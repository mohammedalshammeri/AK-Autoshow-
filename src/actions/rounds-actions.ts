'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireEventCapability } from '@/lib/event-permissions';

export async function getRounds(eventId: string) {
  try {
    await requireEventCapability(eventId, 'view');
    const sql = `SELECT * FROM rounds WHERE event_id = $1 ORDER BY round_order ASC`;
    const result = await query(sql, [eventId]);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRound(roundId: string) {
  try {
    const sql = `SELECT * FROM rounds WHERE id = $1`;
    const result = await query(sql, [roundId]);
    if (result.rows.length === 0) return { success: false, error: 'Round not found' };
    await requireEventCapability(String(result.rows[0].event_id), 'view');
    return { success: true, data: result.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createRound(eventId: string, name: string, order: number) {
  try {
    await requireEventCapability(eventId, 'manage_rounds');
    const sql = `
      INSERT INTO rounds (event_id, name, round_order, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `;
    const result = await query(sql, [eventId, name, order]);
    revalidatePath(`/admin/events/${eventId}/rounds`);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRound(roundId: string, eventId: string) {
  try {
    await requireEventCapability(eventId, 'manage_rounds');
    const sql = `DELETE FROM rounds WHERE id = $1`;
    await query(sql, [roundId]);
    revalidatePath(`/admin/events/${eventId}/rounds`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRoundParticipants(roundId: string) {
  try {
    const roundRes = await query(`SELECT event_id FROM rounds WHERE id = $1`, [roundId]);
    const eventId = String(roundRes.rows[0]?.event_id || '');
    if (eventId) await requireEventCapability(eventId, 'view');
    const sql = `
      SELECT 
        rp.*,
        json_build_object(
          'id', r.id,
          'full_name', r.full_name,
          'car_make', r.car_make,
          'car_model', r.car_model,
          'car_category', r.car_category,
          'username', u.username
        ) as registrations
      FROM round_participants rp
      LEFT JOIN registrations r ON rp.registration_id = r.id
      LEFT JOIN users u ON u.registration_id = r.id
      WHERE rp.round_id = $1
      ORDER BY rp.final_score DESC NULLS LAST
    `;
    const result = await query(sql, [roundId]);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addParticipantToRound(roundId: string, registrationId: string) {
  try {
    const roundRes = await query(`SELECT event_id FROM rounds WHERE id = $1`, [roundId]);
    const eventId = String(roundRes.rows[0]?.event_id || '');
    if (!eventId) return { success: false, error: 'Round not found' };
    await requireEventCapability(eventId, 'manage_rounds');
    const sql = `
      INSERT INTO round_participants (round_id, registration_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await query(sql, [roundId, registrationId]);
    revalidatePath(`/admin/events/*/rounds/*`);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateParticipantScore(
  participantId: string, 
  run1: number, 
  run2: number, 
  final: number, 
  qualified: boolean
) {
  try {
    const eventRes = await query(
      `SELECT ro.event_id
       FROM round_participants rp
       JOIN rounds ro ON ro.id = rp.round_id
       WHERE rp.id = $1`,
      [participantId]
    );
    const eventId = String(eventRes.rows[0]?.event_id || '');
    if (eventId) await requireEventCapability(eventId, 'manage_rounds');
    const sql = `
      UPDATE round_participants
      SET run_1_score = $1, run_2_score = $2, final_score = $3, is_qualified = $4
      WHERE id = $5
      RETURNING *
    `;
    const result = await query(sql, [run1, run2, final, qualified, participantId]);
    revalidatePath(`/admin/events/*/rounds/*`);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeParticipantFromRound(participantId: string) {
  try {
    const eventRes = await query(
      `SELECT ro.event_id
       FROM round_participants rp
       JOIN rounds ro ON ro.id = rp.round_id
       WHERE rp.id = $1`,
      [participantId]
    );
    const eventId = String(eventRes.rows[0]?.event_id || '');
    if (eventId) await requireEventCapability(eventId, 'manage_rounds');
    const sql = `DELETE FROM round_participants WHERE id = $1`;
    await query(sql, [participantId]);
    revalidatePath(`/admin/events/*/rounds/*`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRoundStatus(roundId: string, status: string, eventId: string) {
  try {
    await requireEventCapability(eventId, 'manage_rounds');
    const sql = `UPDATE rounds SET status = $1 WHERE id = $2 RETURNING *`;
    const result = await query(sql, [status, roundId]);
    revalidatePath(`/admin/events/${eventId}/rounds`);
    revalidatePath(`/admin/events/${eventId}/rounds/${roundId}`);
    return { success: true, data: result.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getApprovedRegistrations(eventId: string) {
  try {
    await requireEventCapability(eventId, 'view');
    const sql = `
      SELECT * FROM registrations 
      WHERE event_id = $1 AND status = 'approved'
      ORDER BY full_name
    `;
    const result = await query(sql, [eventId]);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function promoteQualifiedToNextRound(eventId: string, currentRoundId: string) {
  try {
    await requireEventCapability(eventId, 'manage_rounds');
    // Get current round order
    const currentRoundResult = await query(
      `SELECT round_order FROM rounds WHERE id = $1`,
      [currentRoundId]
    );
    
    if (currentRoundResult.rows.length === 0) {
      return { success: false, error: 'Round not found' };
    }
    
    const currentOrder = currentRoundResult.rows[0].round_order;
    
    // Get next round
    const nextRoundResult = await query(
      `SELECT id FROM rounds WHERE event_id = $1 AND round_order = $2`,
      [eventId, currentOrder + 1]
    );
    
    if (nextRoundResult.rows.length === 0) {
      return { success: false, error: 'No next round found' };
    }
    
    const nextRoundId = nextRoundResult.rows[0].id;
    
    // Get qualified participants
    const qualifiedResult = await query(
      `SELECT registration_id FROM round_participants WHERE round_id = $1 AND is_qualified = true`,
      [currentRoundId]
    );
    
    if (qualifiedResult.rows.length === 0) {
      return { success: false, error: 'No qualified participants' };
    }
    
    // Add to next round
    for (const participant of qualifiedResult.rows) {
      await query(
        `INSERT INTO round_participants (round_id, registration_id) VALUES ($1, $2)`,
        [nextRoundId, participant.registration_id]
      );
    }
    
    revalidatePath(`/admin/events/${eventId}/rounds`);
    return { success: true, promoted: qualifiedResult.rows.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
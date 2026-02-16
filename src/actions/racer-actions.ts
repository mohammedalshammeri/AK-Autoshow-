'use server';

import { query } from '@/lib/db';

export async function getRacerRounds(registrationId: string) {
  try {
    const sql = `
      SELECT 
        r.id,
        r.name,
        r.status,
        r.round_order,
        rp.run_1_score,
        rp.run_2_score,
        rp.final_score,
        rp.is_qualified,
        rp.notes
      FROM round_participants rp
      JOIN rounds r ON rp.round_id = r.id
      WHERE rp.registration_id = $1
      ORDER BY r.round_order ASC
    `;
    
    const result = await query(sql, [registrationId]);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRacerStats(eventId: string, registrationId: string) {
  try {
    // Get racer's best score
    const bestScoreResult = await query(
      `SELECT MAX(final_score) as best_score 
       FROM round_participants 
       WHERE registration_id = $1`,
      [registrationId]
    );

    // Get racer's ranking in current event
    const rankingResult = await query(
      `SELECT 
        COUNT(*) + 1 as rank
       FROM round_participants rp1
       JOIN rounds r1 ON rp1.round_id = r1.id
       WHERE r1.event_id = $1
       AND rp1.final_score > (
         SELECT COALESCE(MAX(rp2.final_score), 0)
         FROM round_participants rp2
         JOIN rounds r2 ON rp2.round_id = r2.id
         WHERE rp2.registration_id = $2
         AND r2.event_id = $1
       )`,
      [eventId, registrationId]
    );

    // Get total participants in event
    const totalResult = await query(
      `SELECT COUNT(DISTINCT rp.registration_id) as total
       FROM round_participants rp
       JOIN rounds r ON rp.round_id = r.id
       WHERE r.event_id = $1`,
      [eventId]
    );

    // Get qualification status
    const qualifiedRoundsResult = await query(
      `SELECT COUNT(*) as qualified_rounds
       FROM round_participants rp
       JOIN rounds r ON rp.round_id = r.id
       WHERE rp.registration_id = $1 
       AND rp.is_qualified = true
       AND r.event_id = $2`,
      [registrationId, eventId]
    );

    return {
      success: true,
      data: {
        bestScore: bestScoreResult.rows[0]?.best_score || 0,
        rank: rankingResult.rows[0]?.rank || 0,
        totalParticipants: totalResult.rows[0]?.total || 0,
        qualifiedRounds: qualifiedRoundsResult.rows[0]?.qualified_rounds || 0
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEventLeaderboard(eventId: string, limit: number = 10) {
  try {
    const sql = `
      SELECT 
        reg.full_name,
        reg.car_make,
        reg.car_model,
        reg.car_category,
        u.username,
        MAX(rp.final_score) as best_score,
        COUNT(CASE WHEN rp.is_qualified = true THEN 1 END) as qualified_count
      FROM round_participants rp
      JOIN rounds r ON rp.round_id = r.id
      JOIN registrations reg ON rp.registration_id = reg.id
      LEFT JOIN users u ON reg.id = u.registration_id
      WHERE r.event_id = $1
      GROUP BY reg.id, reg.full_name, reg.car_make, reg.car_model, reg.car_category, u.username
      ORDER BY best_score DESC NULLS LAST
      LIMIT $2
    `;
    
    const result = await query(sql, [eventId, limit]);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

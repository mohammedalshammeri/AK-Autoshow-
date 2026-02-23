import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/confirm-attendance  { reg: 'BN-XXXX-RW2-XXXX' }
export async function POST(request: NextRequest) {
  try {
    const { reg } = await request.json();

    if (!reg) {
      return NextResponse.json({ error: 'Missing registration number' }, { status: 400 });
    }

    // Fetch registration
    const res = await query(
      `SELECT id, status, attendance_confirmed FROM registrations WHERE registration_number = $1`,
      [reg]
    );

    const registration = res.rows[0];

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.status !== 'approved') {
      return NextResponse.json({ error: 'Registration is not approved' }, { status: 400 });
    }

    if (registration.attendance_confirmed) {
      return NextResponse.json({ success: true, alreadyConfirmed: true });
    }

    // Confirm attendance
    await query(
      `UPDATE registrations SET attendance_confirmed = TRUE, attendance_confirmed_at = NOW() WHERE id = $1`,
      [registration.id]
    );

    return NextResponse.json({ success: true, alreadyConfirmed: false });
  } catch (error) {
    console.error('Confirm attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

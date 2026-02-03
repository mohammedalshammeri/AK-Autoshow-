'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function submitSponsorRequest(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const tier = formData.get('package') as string;
  const email = formData.get('email') as string || '';
  const company = formData.get('company') as string || '';

  try {
    await query(
      `INSERT INTO sponsor_requests (name, phone, package_tier, email, company_name) 
       VALUES ($1, $2, $3, $4, $5)`,
      [name, phone, tier, email, company]
    );
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to submit sponsor request:', error);
    return { success: false, error: 'Failed to submit request' };
  }
}

export async function getSponsorRequests() {
  try {
    const result = await query(
      `SELECT * FROM sponsor_requests ORDER BY created_at DESC`
    );
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Failed to fetch sponsor requests:', error);
    return { success: false, error: 'Failed to fetch requests' };
  }
}

export async function updateSponsorRequestStatus(id: string, status: 'approved' | 'rejected') {
  try {
    await query(
      `UPDATE sponsor_requests SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id]
    );
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to update sponsor request status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

export async function getSponsorStats() {
   try {
     const pending = await query(`SELECT COUNT(*) as count FROM sponsor_requests WHERE status = 'pending'`);
     const approved = await query(`SELECT COUNT(*) as count FROM sponsor_requests WHERE status = 'approved'`);
     const rejected = await query(`SELECT COUNT(*) as count FROM sponsor_requests WHERE status = 'rejected'`);
     
     return {
         pending: parseInt(pending.rows[0].count),
         approved: parseInt(approved.rows[0].count),
         rejected: parseInt(rejected.rows[0].count)
     };
   } catch (error) {
       return { pending: 0, approved: 0, rejected: 0 };
   }
}

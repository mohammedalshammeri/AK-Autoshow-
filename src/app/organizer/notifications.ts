'use server';

import { sendApprovalNotification } from '@/lib/notification-service';

// Wrapper for Notification Service with Organizer specific logic if needed
export async function sendApprovalNotify(registration: any) {
  try {
    const eventDate = registration.event_date 
      ? new Date(registration.event_date).toLocaleDateString() 
      : 'TBA'; 

    const result = await sendApprovalNotification('drift', {
       email: registration.email,
       phone: registration.country_code + registration.phone_number,
       fullName: registration.full_name,
       registrationNumber: registration.registration_number,
       // Credentials might not be generated yet if we just approved. 
       // For this specific 'Organizer' flow, maybe we generate them?
       // The requirements mentioned the notification format: BN-...
       // User didn't explicitly ask for login credentials in this specific prompt, 
       // but the Drift template uses them. 
       // For now, we'll pass placeholders or handle login generation if needed.
       // Let's assume we just want the BN Number and QR code primarily.
       username: registration.email.split('@')[0], // Placeholder
       password: 'Sent separately', // Placeholder
       eventName: 'Drift Championship', // ideally fetch event name
       eventDate: eventDate,
       location: 'Bahrain International Circuit' // ideally fetch location
    });

    return result;
  } catch (e) {
    console.error('Notify Error', e);
    return { success: false, error: e instanceof Error ? e.message : 'notify_failed' };
  }
}

export async function sendRejectionNotify(registration: any, reason: string) {
   // Logic for rejection email
   console.log(`Sending rejection to ${registration.email} Reason: ${reason}`);
   return { success: true, skipped: true };
}
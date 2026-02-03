// Resend Email Configuration Checker
// This helps debug email delivery issues

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function checkResendConfiguration() {
  try {
    console.log('🔍 Checking Resend configuration...');
    
    // Check if API key is valid
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in environment');
      return { success: false, error: 'Missing API key' };
    }
    
    console.log('✅ API Key found');
    
    // Test with a simple email to a verified address
    const testResult = await resend.emails.send({
      from: 'AKAutoshow <onboarding@resend.dev>',
      to: ['delivered@resend.dev'], // This is Resend's test email
      subject: 'Test Email Configuration',
      html: '<p>This is a test email to verify Resend configuration.</p>'
    });
    
    if (testResult.error) {
      console.error('❌ Test email failed:', testResult.error);
      return { success: false, error: testResult.error };
    }
    
    console.log('✅ Test email sent successfully:', testResult.data);
    return { success: true, data: testResult.data };
    
  } catch (error) {
    console.error('❌ Configuration check failed:', error);
    return { success: false, error: (error instanceof Error) ? error.message : 'An unknown error occurred' };
  }
}

// Function to check email deliverability for specific domain
export function getEmailDeliveryTips(email: string) {
  const domain = email.split('@')[1];
  
  const tips = {
    'gmail.com': [
      'Gmail has strict spam filters',
      'Make sure to use verified sender domain',
      'Check Gmail Promotions tab',
      'Check Spam/Junk folder'
    ],
    'yahoo.com': [
      'Yahoo requires good sender reputation',
      'Check Bulk/Spam folder',
      'Ensure sender domain is verified'
    ],
    'outlook.com': [
      'Microsoft has advanced spam detection',
      'Check Junk Email folder',
      'Verify sender domain authentication'
    ],
    'hotmail.com': [
      'Same as Outlook.com',
      'Check Junk Email folder',
      'Verify sender domain authentication'
    ]
  };
  
  return domain in tips ? tips[domain as keyof typeof tips] : [
    'Check spam/junk folder',
    'Verify sender domain is authenticated',
    'Contact your email provider if issues persist'
  ];
}

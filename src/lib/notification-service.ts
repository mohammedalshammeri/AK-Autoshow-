/**
 * Notification Service for Multi-Event Support
 * Each event type has its own email/WhatsApp templates
 */

import { generateRegistrationQR, generateRegistrationNumber, generateStandardRegistrationNumber, RegistrationQRData } from './qr-generator';

function renderBsmcEmailFooter() {
  return `
    <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.12); text-align: center; font-size: 12px; color: #9ca3af; line-height: 1.7;">
      Platform by <a href="https://www.bsmc.bh" target="_blank" rel="noopener noreferrer" style="color:#e5e7eb; text-decoration: underline;">BSMC</a>
      &nbsp;•&nbsp;
      <a href="https://www.bsmc.bh" target="_blank" rel="noopener noreferrer" style="color:#e5e7eb; text-decoration: underline;">www.bsmc.bh</a>
      &nbsp;•&nbsp;
      <a href="https://instagram.com/bsmc.mena" target="_blank" rel="noopener noreferrer" style="color:#e5e7eb; text-decoration: underline;">@bsmc.mena</a>
      &nbsp;•&nbsp;
      <a href="https://wa.me/97338409977" target="_blank" rel="noopener noreferrer" style="color:#e5e7eb; text-decoration: underline;">WhatsApp</a>
    </div>
  `;
}

// Define event-specific templates
const EVENT_TEMPLATES = {
  drift: {
    emailSubject_ar: 'تم قبول تسجيلك في بطولة J2drift',
    emailSubject_en: 'Your J2drift Registration Approved',
    emailBody_ar: (data: any) => `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 30px; border-radius: 10px;">
        <h1 style="color: #ef4444; text-align: center; margin-bottom: 30px;">مرحباً بك في بطولة J2drift! 🏁</h1>
        
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #fbbf24; margin-bottom: 15px;">تم قبول تسجيلك بنجاح</h2>
          <p style="font-size: 16px; line-height: 1.8;">
            نحيطكم علماً بأنه تم قبول طلب تسجيلكم في بطولة الدريفت - ${data.eventName}
          </p>
        </div>

        <div style="background: #000; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h3 style="color: #ef4444; margin-bottom: 10px;">رقم تسجيلك</h3>
          <div style="font-size: 24px; font-weight: bold; color: #fbbf24; font-family: monospace; padding: 15px; background: #1a1a1a; border-radius: 5px;">
            ${data.registrationNumber}
          </div>
        </div>

        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #fbbf24; margin-bottom: 15px;">بيانات الدخول لنظام الجولات</h3>
          <p><strong>اسم المستخدم:</strong> <code style="background: #000; padding: 5px 10px; border-radius: 3px;">${data.username}</code></p>
          <p><strong>كلمة المرور:</strong> <code style="background: #000; padding: 5px 10px; border-radius: 3px;">${data.password}</code></p>
          <p style="color: #fbbf24; font-size: 14px; margin-top: 10px;">⚠️ يرجى حفظ هذه البيانات في مكان آمن</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://akautoshow.com/racer/login" style="display: inline-block; background: #ef4444; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              🔑 تسجيل الدخول للنظام
            </a>
          </div>
        </div>

        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #fbbf24; margin-bottom: 15px;">تفاصيل الفعالية</h3>
          <p><strong>📅 التاريخ:</strong> ${data.eventDate}</p>
          <p><strong>📍 الموقع:</strong> ${data.location}</p>
        </div>

        ${data.qrCode ? `
        <div style="text-align: center; background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #000; margin-bottom: 10px;">QR Code للتحقق عند البوابة</h3>
          <img src="${data.qrCode}" alt="QR Code" style="max-width: 300px; width: 100%;" />
        </div>
        ` : ''}

        <div style="background: #7c2d12; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <p style="margin: 0; font-size: 14px;">
            <strong>ملاحظة:</strong> احتفظ برقم التسجيل والـ QR Code معك يوم الفعالية للتحقق عند البوابة.
          </p>
        </div>

        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
          بالتوفيق في البطولة! 🏆<br/>
          فريق J2drift
        </p>

        ${renderBsmcEmailFooter()}
      </div>
    `,
    whatsappMessage_ar: (data: any) => `
🏁 *مرحباً بك في بطولة J2drift!*

✅ تم قبول تسجيلك بنجاح

*رقم التسجيل:*
\`${data.registrationNumber}\`

*بيانات الدخول:*
👤 اسم المستخدم: \`${data.username}\`
🔐 كلمة المرور: \`${data.password}\`

*تفاصيل الفعالية:*
📅 ${data.eventDate}
📍 ${data.location}

🔑 رابط الدخول:
https://akautoshow.com/racer/login

⚠️ احتفظ برقم التسجيل معك للتحقق عند البوابة

بالتوفيق! 🏆
    `.trim()
  },

  carshow: {
    emailSubject_ar: 'تم قبول تسجيلك في AKAutoshow',
    emailSubject_en: 'Your AKAutoshow Registration Approved',
    emailBody_ar: (data: any) => `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 30px;">
        <h1 style="color: #1a56db; text-align: center;">مرحباً بك في AKAutoshow</h1>
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>تم قبول تسجيلك</h2>
          <p>رقم التسجيل: <strong>${data.registrationNumber}</strong></p>
          <p>الفعالية: ${data.eventName}</p>
          <p>التاريخ: ${data.eventDate}</p>
          <p>الموقع: ${data.location}</p>
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
            <p style="margin-bottom: 15px; color: #666;">عرض تفاصيل الفعالية:</p>
            <a href="${data.eventUrl || 'https://akautoshow.com'}" style="display: inline-block; background: #1a56db; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              🎯 زيارة صفحة الفعالية
            </a>
          </div>
        </div>
        <p style="color: #666; text-align: center;">فريق AKAutoshow</p>

        ${renderBsmcEmailFooter()}
      </div>
    `,
    whatsappMessage_ar: (data: any) => `
مرحباً! تم قبول تسجيلك في *${data.eventName}*

رقم التسجيل: ${data.registrationNumber}
📅 ${data.eventDate}
📍 ${data.location}

شكراً لك!
    `.trim()
  }
};

/**
 * Send approval notification based on event type
 */
export async function sendApprovalNotification(
  eventType: 'drift' | 'carshow',
  recipientData: {
    email: string;
    phone: string;
    fullName: string;
    registrationNumber: string;
    username?: string;
    password?: string;
    eventName: string;
    eventDate: string;
    location: string;
    carDetails?: string;
  }
) {
  const template = EVENT_TEMPLATES[eventType];
  
  try {
    // Generate QR Code for drift events
    let qrCode = null;
    if (eventType === 'drift' && recipientData.username) {
      const qrData: RegistrationQRData = {
        registrationNumber: recipientData.registrationNumber,
        fullName: recipientData.fullName,
        eventName: recipientData.eventName,
        eventDate: recipientData.eventDate,
        carDetails: recipientData.carDetails || 'N/A'
      };
      qrCode = await generateRegistrationQR(qrData);
    }

    // Prepare email data
    const emailData = {
      ...recipientData,
      qrCode
    };

    // Send Email (using Resend or your email service)
    await sendEmail({
      to: recipientData.email,
      subject: template.emailSubject_ar,
      html: template.emailBody_ar(emailData)
    });

    // Send WhatsApp
    await sendWhatsApp({
      to: recipientData.phone,
      message: template.whatsappMessage_ar(emailData)
    });

    return { success: true };
  } catch (error) {
    console.error('Notification Error:', error);
    return { success: false, error };
  }
}

/**
 * Email sender (integrate with Resend)
 */
async function sendEmail(data: { to: string; subject: string; html: string }) {
  try {
    // ✅ تفعيل Resend API
    if (!process.env.RESEND_API_KEY) {
      const message = 'RESEND_API_KEY is missing (email not sent)';
      console.error('❌', message);
      console.error('📧 Intended recipient:', data.to);
      console.error('📧 Subject:', data.subject);
      return { success: false, error: message };
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: 'AKAutoshow <noreply@akautoshow.com>',
      to: data.to,
      subject: data.subject,
      html: data.html
    });

    if (result.error) {
      console.error('📧 Email Error:', result.error);
      return { success: false, error: result.error };
    }

    console.log('✅ Email sent successfully to:', data.to);
    return { success: true, id: result.data?.id };
    
  } catch (error: any) {
    console.error('📧 Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * WhatsApp sender (integrate with WhatsApp Business API)
 */
async function sendWhatsApp(data: { to: string; message: string }) {
  // TODO: Integrate with WhatsApp Business API
  console.log('📱 Sending WhatsApp:');
  console.log('To:', data.to);
  console.log('Message:', data.message);
  
  // Example WhatsApp Business API integration:
  /*
  const response = await fetch('https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: data.to,
      type: 'text',
      text: { body: data.message }
    })
  });
  */
  
  return { success: true };
}

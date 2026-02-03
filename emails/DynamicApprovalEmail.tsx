import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface DynamicApprovalEmailProps {
  participantName: string;
  registrationNumber: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventLocationUrl?: string;
}

export const DynamicApprovalEmail = ({
  participantName = 'المشارك',
  registrationNumber = 'REG-12345',
  eventName = 'معرض السيارات',
  eventDate = 'قريباً',
  eventLocation = 'البحرين',
  eventLocationUrl = 'https://maps.google.com/',
}: DynamicApprovalEmailProps) => (
  <Html>
    <Head />
    <Preview>
      تم قبول تسجيلك في {eventName}! رقم التسجيل: {registrationNumber}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={header}>          <Text style={logoText}>
            AK<span style={logoAccent}>Autoshow</span>
          </Text>
          <Text style={tagline}>🏎️ أفضل معرض للسيارات في البحرين</Text>
        </Section>

        <Hr style={hr} />

        {/* Main Content */}
        <Section style={content}>
          {/* Success Icon */}
          <div style={iconContainer}>
            <Text style={successIcon}>✅</Text>
          </div>

          {/* Main Message */}
          <Text style={heading}>
            مبروك {participantName}!
          </Text>
          
          <Text style={subheading}>
            تم قبول تسجيلك بنجاح في معرض السيارات
          </Text>

          {/* Event Details Card */}
          <Section style={eventCard}>
            <Text style={eventTitle}>📋 تفاصيل الفعالية</Text>
            
            <div style={eventDetail}>
              <Text style={eventLabel}>🎉 اسم الفعالية:</Text>
              <Text style={eventValue}>{eventName}</Text>
            </div>
            
            <div style={eventDetail}>
              <Text style={eventLabel}>🆔 رقم التسجيل:</Text>
              <Text style={eventValue}>{registrationNumber}</Text>
            </div>
            
            <div style={eventDetail}>
              <Text style={eventLabel}>📅 تاريخ الفعالية:</Text>
              <Text style={eventValue}>{eventDate}</Text>
            </div>
            
            <div style={eventDetail}>
              <Text style={eventLabel}>📍 المكان:</Text>
              <Text style={eventValue}>{eventLocation}</Text>
            </div>
          </Section>

          {/* Instructions */}
          <Section style={instructionsSection}>
            <Text style={instructionsTitle}>📋 تعليمات مهمة:</Text>
            <ul style={instructionsList}>
              <li style={instructionItem}>احتفظ برقم التسجيل الخاص بك</li>
              <li style={instructionItem}>تأكد من وصول سيارتك قبل موعد البداية بساعة</li>
              <li style={instructionItem}>أحضر هويتك الشخصية ورخصة القيادة</li>
              <li style={instructionItem}>اتبع تعليمات المنظمين في الموقع</li>
            </ul>
          </Section>

          {/* Location Button */}
          <Section style={buttonSection}>
            <Button style={locationButton} href={eventLocationUrl}>
              📍 عرض الموقع على الخريطة
            </Button>
          </Section>

          {/* Contact Info */}
          <Section style={contactSection}>
            <Text style={contactTitle}>💬 تحتاج مساعدة؟</Text>
            <Text style={contactText}>
              إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا
            </Text>            <Text style={contactEmail}>
              📧 البريد الإلكتروني: info@akautoshow.com
            </Text>
          </Section>
        </Section>

        <Hr style={hr} />

        {/* Footer */}
        <Section style={footer}>          <Text style={footerText}>
            شكراً لك لاختيار AKAutoshow
          </Text>
          <Text style={footerSubtext}>
            © 2026 AKAutoshow. جميع الحقوق محفوظة.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Styles
const main = {
  backgroundColor: '#0f0f0f',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  color: '#ffffff',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  padding: '20px 0',
  backgroundColor: '#1a1a1a',
  borderRadius: '12px 12px 0 0',
  marginBottom: '0',
};

const logoText = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
};

const logoAccent = {
  color: '#dc2626', // red-600
};

const tagline = {
  fontSize: '14px',
  color: '#9ca3af',
  margin: '8px 0 0 0',
};

const content = {
  backgroundColor: '#1f1f1f',
  padding: '40px 30px',
  textAlign: 'center' as const,
};

const iconContainer = {
  marginBottom: '24px',
};

const successIcon = {
  fontSize: '48px',
  margin: '0',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 8px 0',
};

const subheading = {
  fontSize: '18px',
  color: '#d1d5db',
  margin: '0 0 32px 0',
};

const eventCard = {
  backgroundColor: '#2d2d2d',
  border: '2px solid #dc2626',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'right' as const,
};

const eventTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#fbbf24', // yellow-400
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
};

const eventDetail = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
  borderBottom: '1px solid #404040',
  paddingBottom: '8px',
};

const eventLabel = {
  fontSize: '14px',
  color: '#9ca3af',
  margin: '0',
  fontWeight: 'bold',
};

const eventValue = {
  fontSize: '14px',
  color: '#ffffff',
  margin: '0',
  fontWeight: 'bold',
};

const instructionsSection = {
  backgroundColor: '#2d2d2d',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'right' as const,
};

const instructionsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#fbbf24',
  margin: '0 0 16px 0',
};

const instructionsList = {
  color: '#d1d5db',
  fontSize: '14px',
  lineHeight: '1.6',
  textAlign: 'right' as const,
  paddingRight: '20px',
};

const instructionItem = {
  marginBottom: '8px',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const locationButton = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  border: 'none',
};

const contactSection = {
  backgroundColor: '#2d2d2d',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const contactTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#fbbf24',
  margin: '0 0 12px 0',
};

const contactText = {
  fontSize: '14px',
  color: '#d1d5db',
  margin: '0 0 8px 0',
};

const contactEmail = {
  fontSize: '14px',
  color: '#ffffff',
  margin: '0',
  fontWeight: 'bold',
};

const hr = {
  borderColor: '#404040',
  margin: '0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '20px 0',
  backgroundColor: '#1a1a1a',
  borderRadius: '0 0 12px 12px',
};

const footerText = {
  fontSize: '14px',
  color: '#ffffff',
  margin: '0 0 8px 0',
  fontWeight: 'bold',
};

const footerSubtext = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
};

export default DynamicApprovalEmail;

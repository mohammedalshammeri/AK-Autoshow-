import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

const bsmcLinks = {
  website: 'https://www.bsmc.bh',
  instagram: 'https://instagram.com/bsmc.mena',
  whatsapp: 'https://wa.me/97338409977',
  logo: 'https://akautoshow.com/BSMC.BH1.jpg'
};

interface RejectionEmailProps {
  participantName?: string;
  eventName?: string;
}

export const RejectionEmail = ({
  participantName = 'Dear Participant',
  eventName = 'AK Auto Show  2026',
}: RejectionEmailProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Logo Section */}
          <Section style={logoSection}>            <Img
              src="https://akautoshow.com/ak-autoshow-logo-new.png"
              width="150"
              alt="AK Auto Show Logo"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Greeting */}
            <Text style={greeting}>
              Dear <strong>{participantName}</strong>,
            </Text>

            {/* Opening Paragraph */}
            <Text style={bodyText}>
              Thank you for your interest and for taking the time to apply for <strong>{eventName}</strong>.
            </Text>

            {/* Decision Paragraph */}
            <Text style={bodyText}>
              Due to the high volume of exceptional applications, we regret to inform you that your vehicle was not selected for this particular event. The selection process was highly competitive.
            </Text>

            {/* Encouragement Paragraph */}
            <Text style={bodyText}>
              We truly appreciate your passion for automotive culture and strongly encourage you to apply for our future events. Please follow our social media channels to stay updated on upcoming opportunities.
            </Text>

            {/* Closing */}
            <Text style={closing}>
              Best regards,
            </Text>

            {/* Signature */}
            <Text style={signature}>
              The AK Auto Show Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {currentYear} AK Auto Show. All rights reserved.
            </Text>

            <div style={{ marginTop: '12px' }}>
              <div style={{ textAlign: 'center' as const }}>
                <a href={bsmcLinks.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Img src={bsmcLinks.logo} width="110" alt="BSMC" style={{ margin: '0 auto', borderRadius: '6px' }} />
                </a>
              </div>
              <Text style={bsmcFooterText}>
                Platform by <a href={bsmcLinks.website} target="_blank" rel="noopener noreferrer" style={bsmcLink}>BSMC</a>
                {' '}•{' '}
                <a href={bsmcLinks.instagram} target="_blank" rel="noopener noreferrer" style={bsmcLink}>Instagram</a>
                {' '}•{' '}
                <a href={bsmcLinks.website} target="_blank" rel="noopener noreferrer" style={bsmcLink}>Website</a>
                {' '}•{' '}
                <a href={bsmcLinks.whatsapp} target="_blank" rel="noopener noreferrer" style={bsmcLink}>WhatsApp</a>
              </Text>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#111111',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: '0',
  padding: '0',
};

const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '580px',
  backgroundColor: '#111111',
};

const logoSection = {
  textAlign: 'center' as const,
  padding: '30px 0',
};

const logo = {
  width: '150px',
  height: 'auto',
  margin: '0 auto',
  display: 'block',
};

const content = {
  padding: '20px 30px',
};

const greeting = {
  color: '#FFFFFF',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 24px 0',
  lineHeight: '1.4',
};

const bodyText = {
  color: '#CCCCCC',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const closing = {
  color: '#FFFFFF',
  fontSize: '16px',
  margin: '30px 0 8px 0',
  lineHeight: '1.4',
};

const signature = {
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 30px 0',
  lineHeight: '1.4',
};

const footer = {
  padding: '20px 30px',
  borderTop: '1px solid #333333',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#888888',
  fontSize: '12px',
  margin: '0',
  lineHeight: '1.4',
};

const bsmcFooterText = {
  color: '#9CA3AF',
  fontSize: '12px',
  margin: '10px 0 0',
  lineHeight: '1.6',
  textAlign: 'center' as const,
};

const bsmcLink = {
  color: '#E5E7EB',
  textDecoration: 'underline',
};

export default RejectionEmail;

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

interface ProfessionalApprovalEmailProps {
  participantName?: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  registrationNumber?: string;
}

export const ProfessionalApprovalEmail = ({
  participantName = 'Dear Participant',
  eventName = 'AK Auto Show 2026',
  eventDate = 'January 28, 2026',
  eventLocation = 'Bahrain International Exhibition Centre',
  carMake = 'Premium',
  carModel = 'Vehicle',
  carYear = '2025',
  registrationNumber = 'AKA-0001',
}: ProfessionalApprovalEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src="https://akautoshow.com/ak-autoshow-logo-new.png"
              width="150"
              alt="AK AutoShow Logo"
              style={logo}
            />
          </Section>

          <Section style={content}>
            <Text style={congratsText}>
              Congratulations!
            </Text>

            <Text style={bodyText}>
              Your vehicle has been officially selected for <strong>{eventName}</strong>, taking place on <strong>{eventDate}</strong>.
            </Text>

            <Text style={vehicleDetails}>
              Vehicle details:<br />
              {carMake} {carModel} {carYear}<br />
              {registrationNumber}
            </Text>

            <Text style={eventDetails}>
              <strong>Event:</strong> {eventName}<br />
              <strong>Date:</strong> {eventDate}<br />
              <strong>Location:</strong> {eventLocation}
            </Text>

            <Text style={bodyText}>
              We look forward to seeing your amazing vehicle at the show!
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#111111',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  color: '#F5F5F5',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const logoSection = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '20px',
};

const congratsText = {
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  color: '#FFFFFF',
  margin: '24px 0',
};

const bodyText = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  color: '#A0A0A0',
  margin: '16px 0',
};

const vehicleDetails = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  color: '#FFFFFF',
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#1A1A1A',
  borderRadius: '8px',
};

const eventDetails = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  color: '#CCCCCC',
  margin: '24px 0',
};

export default ProfessionalApprovalEmail;

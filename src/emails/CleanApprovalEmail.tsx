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

interface CleanApprovalEmailProps {
  participantName?: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  vehicleDetails?: string;
  registrationNumber?: string;
}

const CleanApprovalEmail = ({
  participantName = 'Dear Participant',
  eventName = 'AK Auto Show 2026',
  eventDate = 'January 28, 2026',
  eventLocation = 'Bahrain International Exhibition Centre',
  vehicleDetails = 'Your Premium Vehicle',
  registrationNumber = 'AKA-0001',
}: CleanApprovalEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Logo Section */}
          <Section style={logoSection}>
            <Img
              src="https://akautoshow.com/ak-autoshow-logo-new.png"
              width="150"
              alt="AK AutoShow Logo"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Congratulations Header */}
            <Text style={congratsText}>
              Congratulations!
            </Text>

            {/* Event Selection Text */}
            <Text style={bodyText}>
              Your vehicle has been officially selected for <strong>{eventName}</strong>, taking place on <strong>{eventDate}</strong>.
            </Text>

            {/* Vehicle Details Section */}
            <Section style={detailsSection}>
              <Text style={sectionTitle}>Vehicle details:</Text>
              <Text style={detailText}>{vehicleDetails}</Text>
              <Text style={detailText}>{registrationNumber}</Text>
            </Section>

            {/* Event Information */}
            <Section style={detailsSection}>
              <Text style={detailText}>
                <strong>Event:</strong> {eventName}
              </Text>
              <Text style={detailText}>
                <strong>Date:</strong> {eventDate}
              </Text>
              <Text style={detailText}>
                <strong>Location:</strong> {eventLocation}
              </Text>
            </Section>

            {/* Closing */}
            <Text style={bodyText}>
              We look forward to seeing you there!
            </Text>

            <Text style={signature}>
              Best regards,<br />
              The AK AutoShow Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#111111',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
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
  marginTop: '48px',
  textAlign: 'center' as const,
  color: '#FFFFFF',
};

const bodyText = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  color: '#A0A0A0',
  margin: '24px 0',
};

const detailsSection = {
  margin: '32px 0',
  padding: '20px',
  backgroundColor: '#1A1A1A',
  borderRadius: '8px',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#FFFFFF',
  margin: '0 0 16px 0',
};

const detailText = {
  fontSize: '16px',
  color: '#CCCCCC',
  margin: '8px 0',
};

const signature = {
  fontSize: '16px',
  color: '#FFFFFF',
  textAlign: 'center' as const,
  margin: '32px 0',
};

export default CleanApprovalEmail;

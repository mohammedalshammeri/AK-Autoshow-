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
  qrCodeData?: string; // For Individual
  isGroup?: boolean;
  groupCars?: Array<{
    make: string;
    model: string;
    plate: string;
    qrCode: string;
  }>;
  diamondSponsors?: Array<{
    name: string;
    logo_url: string;
  }>;
}

const CleanApprovalEmail = ({
  participantName = 'Dear Participant',
  eventName = 'AK Auto Show 2026',
  eventDate = 'January 28, 2026',
  eventLocation = 'Bahrain International Exhibition Centre',
  vehicleDetails = 'Your Premium Vehicle',
  registrationNumber = 'AKA-0001',
  qrCodeData,
  isGroup = false,
  groupCars = [],
  diamondSponsors = []
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
              Your {isGroup ? 'group' : 'vehicle'} has been officially selected for <strong>{eventName}</strong>, taking place on <strong>{eventDate}</strong>.
            </Text>

            {/* Individual QR Code */}
            {!isGroup && qrCodeData && (
              <Section style={{ textAlign: 'center' as const, margin: '20px 0' }}>
                <Img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}&color=000000&bgcolor=ffffff`}
                  width="200"
                  height="200"
                  alt="Registration QR Code"
                  style={{ margin: '0 auto', border: '5px solid white', borderRadius: '10px' }}
                />
                <Text style={detailText}>Show this QR code at the entrance</Text>
              </Section>
            )}

            {/* Vehicle Details Section (Individual) */}
            {!isGroup && (
              <Section style={detailsSection}>
                <Text style={sectionTitle}>Vehicle details:</Text>
                <Text style={detailText}>{vehicleDetails}</Text>
                <Text style={detailText}>{registrationNumber}</Text>
              </Section>
            )}

            {/* Group Cars Section */}
            {isGroup && groupCars.length > 0 && (
              <Section style={detailsSection}>
                <Text style={sectionTitle}>Group Vehicles & Passes:</Text>
                {groupCars.map((car, index) => (
                   <div key={index} style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
                      <Text style={{...detailText, fontWeight: 'bold', fontSize: '18px', color: '#fff'}}>
                        #{index + 1} - {car.make} {car.model}
                      </Text>
                      <Text style={detailText}>Plate: {car.plate}</Text>
                      <Img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(car.qrCode)}&color=000000&bgcolor=ffffff`}
                        width="150"
                        height="150"
                        alt={`QR Code for ${car.plate}`}
                        style={{ marginTop: '10px', border: '3px solid white', borderRadius: '5px' }}
                      />
                   </div>
                ))}
              </Section>
            )}

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

            {/* Diamond Sponsors Section */}
            {diamondSponsors.length > 0 && (
              <Section style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #333' }}>
                <Text style={{ ...sectionTitle, textAlign: 'center' as const }}>Diamond Sponsors</Text>
                <div style={{ textAlign: 'center' as const }}>
                  {diamondSponsors.map((sponsor, idx) => (
                    <Img
                      key={idx}
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      width="80"
                      style={{ display: 'inline-block', margin: '10px 15px', verticalAlign: 'middle' }}
                    />
                  ))}
                </div>
              </Section>
            )}

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

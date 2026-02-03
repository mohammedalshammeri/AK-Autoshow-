import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

// Properties the email template will receive
interface DynamicApprovalEmailProps {
  participantName: string;
  registrationNumber: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventLocationUrl: string; // URL for the location
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const DynamicApprovalEmail = ({
  participantName,
  registrationNumber,
  eventName,
  eventDate,
  eventLocation,
  eventLocationUrl,
}: DynamicApprovalEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Registration for {eventName} is Approved!</Preview>
    <Body style={main}>
      <Container style={container}>        <Img
          src={`${baseUrl}/ak-autoshow-logo-new.png`}
          width="250"
          height="auto"
          alt="AKAutoshow"
          style={logo}
        />
        
        <Heading style={heading}>Congratulations, {participantName}!</Heading>
        <Text style={paragraph}>
          Your registration for **{eventName}** has been officially approved. We are thrilled to have you join us.
        </Text>

        <Section style={box}>
          <Text style={subheading}>Your Official Registration Number:</Text>
          <Text style={code}>{registrationNumber}</Text>
          <Text style={infoText}>Please keep this number safe. You will need it for entry.</Text>
        </Section>

        <Section style={box}>
          <Text style={subheading}>Event Details:</Text>
          <Text style={detailItem}>**Event:** {eventName}</Text>
          <Text style={detailItem}>**Date:** {eventDate}</Text>
          <Text style={detailItem}>
            **Location:** {eventLocation}
          </Text>
          <Link href={eventLocationUrl} style={locationLink}>
            View on Google Maps
          </Link>
        </Section>        <Button style={button} href="https://akautoshow.com">
          Visit AKAutoshow Website
        </Button>        <Text style={footer}>
          AKAutoshow - The Ultimate Automotive Experience
        </Text>
      </Container>
    </Body>
  </Html>
);

export default DynamicApprovalEmail;

// --- Styles ---
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

const logo = {
  margin: '0 auto',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
  textAlign: 'center' as const,
  color: '#FFFFFF',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  color: '#A0A0A0',
  padding: '0 20px',
};

const box = {
  backgroundColor: '#1E1E1E',
  borderRadius: '8px',
  margin: '24px 0',
  padding: '20px',
  border: '1px solid #333',
};

const subheading = {
  color: '#A0A0A0',
  fontSize: '14px',
  marginBottom: '8px',
  textAlign: 'center' as const,
};

const code = {
  color: '#D4AF37', // Gold color
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  textAlign: 'center' as const,
  margin: '10px 0',
};

const infoText = {
  color: '#888888',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '4px',
};

const detailItem = {
  color: '#FFFFFF',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '4px 0',
};

const locationLink = {
  color: '#D4AF37',
  fontSize: '14px',
  textDecoration: 'underline',
  marginTop: '10px',
  display: 'block',
};

const button = {
  backgroundColor: '#D4AF37',
  borderRadius: '8px',
  color: '#111111',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '14px 0',
  margin: '32px auto',
};

const footer = {
  color: '#888888',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '24px',
};

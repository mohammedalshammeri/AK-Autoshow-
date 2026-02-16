import QRCode from 'qrcode';

export interface RegistrationQRData {
  registrationNumber: string;
  fullName: string;
  eventName: string;
  eventDate: string;
  carDetails: string;
}

/**
 * Generate QR code as Data URL for registration
 */
export async function generateRegistrationQR(data: RegistrationQRData): Promise<string> {
  const qrContent = JSON.stringify({
    regNum: data.registrationNumber,
    name: data.fullName,
    event: data.eventName,
    date: data.eventDate,
    car: data.carDetails,
    verified: true,
    timestamp: new Date().toISOString()
  });

  try {
    const qrDataURL = await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrDataURL;
  } catch (error) {
    console.error('QR Generation Error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate custom registration number format
 * Format: BN-DDMMYYYY-RW2-XXXX
 */
export function generateRegistrationNumber(eventId: string): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const random = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit random
  
  return `BN-${day}${month}${year}-RW2-${random}`;
}

/**
 * Generate simple format for non-drift events
 */
export function generateStandardRegistrationNumber(eventId: string, count: number): string {
  return `REG-${eventId.slice(0, 8)}-${String(count).padStart(4, '0')}`;
}

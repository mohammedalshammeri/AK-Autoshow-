import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('data') || '';
  const size = Number(searchParams.get('size') || 256);

  if (!data) {
    return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 });
  }

  const safeSize = Number.isFinite(size) ? Math.min(Math.max(size, 128), 768) : 256;

  try {
    const pngBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      width: safeSize,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      type: 'png',
    });

    const pngBytes = new Uint8Array(pngBuffer);
    const pngBlob = new Blob([pngBytes], { type: 'image/png' });

    return new NextResponse(pngBlob, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to generate QR' }, { status: 500 });
  }
}

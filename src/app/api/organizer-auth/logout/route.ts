import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  (await cookies()).delete('organizer_token');
  return NextResponse.redirect(new URL('/organizer/login', 'https://akautoshow.com'), { status: 303 });
}
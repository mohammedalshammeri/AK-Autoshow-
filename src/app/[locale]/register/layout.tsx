import React from 'react';

// Allow up to 60 seconds for processing (e.g. image uploads)
// Note: Vercel Hobby plan is limited to 10s (sometimes 60s for newer runtimes). 
// This config attempts to request 60s.
export const maxDuration = 60;

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

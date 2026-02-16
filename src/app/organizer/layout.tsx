import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const parseOrganizerSession = (raw?: string) => {
  if (!raw) return null;

  const candidates = [raw];
  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    // ignore decode errors
  }

  for (const value of candidates) {
    try {
      return JSON.parse(value);
    } catch {
      // continue
    }
  }

  return null;
};

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('organizer_session');
  const guard = cookieStore.get('organizer_guard')?.value;
  const user = guard === '1' ? parseOrganizerSession(session?.value) : null;

  // If user is logged in, and they are on the login page (checked via logic, or just assume if they are logged in and this layout renders, we might want to push them to dashboard)
  // Unfortunately, in a layout, we don't easily know the current path without headers or middleware tricks.
  // But we can render the Navbar.
  
  // NOTE: If the user IS logged in, and sits on /login, the form is visible. 
  // We'll rely on the Login Page component (or middleware) to bounce them if already logged in.

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500 selection:text-white">
      {user && (
          <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="bg-red-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg">
                   O
                 </div>
                 <span className="font-bold text-xl tracking-tight">
                   Organizer<span className="text-red-600">Portal</span>
                 </span>
                 <a href={`/organizer/events/${user.eventId}`} className="ml-4 text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1 rounded-full transition-colors flex items-center gap-2">
                    📊 Go to Dashboard
                 </a>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                 <span className="hidden md:inline">Welcome, {user.name}</span>
                 <form action={async () => {
                   'use server';
                   const c = await cookies();
                   c.delete('organizer_session');
                   c.delete('organizer_guard');
                   redirect('/organizer/login');
                 }}>
                    <button className="hover:text-white transition-colors bg-gray-800 px-3 py-1 rounded border border-gray-700">Logout</button>
                 </form>
              </div>
            </div>
          </nav>
      )}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
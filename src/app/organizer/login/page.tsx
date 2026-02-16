import { loginOrganizerFormAction } from '../actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const parseOrganizerSession = (raw?: string) => {
  if (!raw) return null;
  const candidates = [raw];
  try {
    candidates.push(decodeURIComponent(raw));
  } catch {}
  for (const value of candidates) {
    try {
      return JSON.parse(value);
    } catch {}
  }
  return null;
};

const getErrorText = (error?: string) => {
  if (!error) return '';
  if (error === 'invalid') return 'Invalid email or password';
  if (error === 'no_event') return 'This organizer account is not linked to any event';
  if (error === 'missing') return 'Please enter email and password';
  return 'Login failed. Please try again.';
};

export default async function OrganizerLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // ✅ CHECK IF ALREADY LOGGED IN - REDIRECT TO DASHBOARD
  const cookieStore = await cookies();
  const session = cookieStore.get('organizer_session');
  const guard = cookieStore.get('organizer_guard')?.value;
  const parsedSession = parseOrganizerSession(session?.value);
  
  console.log('🔐 Login Page Check:', {
    hasSession: !!session,
    guard: guard,
    parsedSession: parsedSession
  });
  
  if (guard === '1' && parsedSession?.eventId) {
    console.log('✅ Already logged in, redirecting to dashboard');
    redirect(`/organizer/events/${parsedSession.eventId}`);
  }

  const params = await searchParams;
  const errorText = getErrorText(params?.error);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* If the Navbar is visible (from Layout), we might want to hide it here or just look consistent */}
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
            O
          </div>
          <h1 className="text-2xl font-bold text-white">Organizer Portal</h1>
          <p className="text-gray-400 mt-2">Sign in to manage your event</p>
        </div>

        <form action={loginOrganizerFormAction} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              name="email"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              placeholder="organizer@akautoshow.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              required
              name="password"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {errorText && (
            <div className="bg-red-900/20 border border-red-900 text-red-200 text-sm p-3 rounded-lg text-center">
              {errorText}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
      
      <p className="text-gray-600 text-sm mt-8 relative z-10">
        Protected Area • Authorized Personnel Only
      </p>
    </div>
  );
}
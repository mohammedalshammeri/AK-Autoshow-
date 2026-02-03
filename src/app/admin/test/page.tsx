'use client';

import { useState } from 'react';

export default function AdminTestPage() {
  const [setupResult, setSetupResult] = useState<any>(null);
  const [loginResult, setLoginResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDatabaseSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setSetupResult(result);
    } catch (error) {
      setSetupResult({ success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@carshowx.app',
          password: 'CarShowX@2025!',
          rememberMe: false
        }),
      });

      const result = await response.json();
      setLoginResult(result);
    } catch (error) {
      setLoginResult({ success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚗 CarShowX Admin System Test
          </h1>
          <p className="text-gray-300">
            Test and setup the admin user management system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Database Setup */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Database Setup</h2>
            <p className="text-gray-300 mb-4">
              Set up admin tables and create test user
            </p>
            
            <button
              onClick={handleDatabaseSetup}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Setup Database'}
            </button>

            {setupResult && (
              <div className="mt-4 p-4 rounded-lg bg-black/30">
                <pre className="text-sm text-white overflow-x-auto">
                  {JSON.stringify(setupResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Login Test */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">🔑 Login Test</h2>
            <p className="text-gray-300 mb-4">
              Test admin authentication system
            </p>
            
            <button
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>

            {loginResult && (
              <div className="mt-4 p-4 rounded-lg bg-black/30">
                <pre className="text-sm text-white overflow-x-auto">
                  {JSON.stringify(loginResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Test Credentials */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">📋 Test Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="text-white ml-2 font-mono">admin@carshowx.app</span>
            </div>
            <div>
              <span className="text-gray-400">Password:</span>
              <span className="text-white ml-2 font-mono">CarShowX@2025!</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/admin/login"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
            >
              Admin Login Page
            </a>
            <a
              href="https://bvebeycfhtikfmcyadiy.supabase.co"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
            >
              Supabase Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

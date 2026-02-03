'use client';

import { useState } from 'react';

export default function CreateAdminPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const createAdminUser = async () => {
    setLoading(true);
    setStatus('Creating admin user...');

    try {
      const response = await fetch('/api/admin/create-admin-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setStatus('✅ Admin user created successfully!');
      } else {
        setStatus('❌ Error: ' + data.error);
      }
    } catch (error) {
      setStatus('❌ Network error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            Create Admin User
          </h1>
          
          <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Admin Credentials
            </h2>
            <div className="space-y-2 text-gray-300">
              <p><strong>Email:</strong> admin@carshowx.app</p>
              <p><strong>Password:</strong> CarShowX@2025!</p>
              <p><strong>Role:</strong> Super Admin</p>
            </div>
          </div>

          <button
            onClick={createAdminUser}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 
                     text-white font-semibold py-3 px-6 rounded-lg 
                     transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Creating...
              </>
            ) : (
              'Create Admin User'
            )}
          </button>

          {status && (
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
              <p className="text-gray-300">{status}</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">
              After Creating the Admin User:
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Go to <code className="bg-gray-700 px-2 py-1 rounded">/admin/login</code></li>
              <li>Use the credentials above to login</li>
              <li>You'll have full admin access to CarShowX</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

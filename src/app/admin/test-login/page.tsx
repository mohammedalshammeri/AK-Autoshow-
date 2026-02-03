'use client';

import { useState } from 'react';

export default function TestLogin() {
  const [email, setEmail] = useState('admin@carshowx.app');
  const [password, setPassword] = useState('CarShowX@2025!');
  const [result, setResult] = useState('');

  const testLogin = async () => {
    setResult('Testing...');
    
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe: false })
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const createAdmin = async () => {
    setResult('Creating admin...');
    
    try {
      const response = await fetch('/api/admin/create-admin-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Admin System Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Create Admin User</h2>
          <button 
            onClick={createAdmin}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create Admin User
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Login</h2>
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded"
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded"
              placeholder="Password"
            />
            <button 
              onClick={testLogin}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Test Login
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-900 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Result:</h3>
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">{result}</pre>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

const SQL_SCRIPT = `-- CarShowX Admin System Database Setup
-- Run this SQL in Supabase SQL Editor

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer')),
    permissions JSONB DEFAULT '{}',
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(512) UNIQUE NOT NULL,
    refresh_token VARCHAR(512) UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_expires_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES admin_sessions(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'warning')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test admin user
INSERT INTO admin_users (
    email, 
    password_hash, 
    full_name, 
    role,
    is_active,
    email_verified,
    permissions
) VALUES (
    'admin@carshowx.app',
    '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdtB5F6ZzBjKjCx9/rJK.8J8uGd8gE.a2',
    'System Administrator',
    'super_admin',
    true,
    true,
    jsonb_build_object(
        'full_access', true,
        'can_manage_users', true,
        'can_manage_registrations', true,
        'can_manage_events', true,
        'can_view_system_logs', true,
        'can_change_settings', true
    )
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    email_verified = EXCLUDED.is_active,
    permissions = EXCLUDED.permissions;

-- Verify setup
SELECT 
    email,
    full_name,
    role,
    is_active,
    created_at
FROM admin_users 
ORDER BY created_at DESC;`;

export default function QuickSetupPage() {
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const copySQL = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const testLogin = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@carshowx.app',
          password: 'CarShowX@2025!',
          rememberMe: false
        })
      });

      const data = await response.json();
      setTestResult({
        success: response.ok && data.success,
        status: response.status,
        message: data.success ? 'Login successful!' : data.error,
        data
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Network error: ' + (error as Error).message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 CarShowX Admin Database Setup
          </h1>
          <p className="text-xl text-gray-300">
            إعداد سريع لقاعدة بيانات نظام المشرفين
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SQL Script */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">📝 SQL Script</h2>
              <button
                onClick={copySQL}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? '✅ تم النسخ!' : '📋 نسخ SQL'}
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {SQL_SCRIPT}
              </pre>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            {/* Steps */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📋 الخطوات</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
                  <div>
                    <p className="text-white font-semibold">افتح Supabase Dashboard</p>
                    <a 
                      href="https://supabase.com/dashboard/project/bvebeycfhtikfmcyadiy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline text-sm"
                    >
                      supabase.com/dashboard/project/bvebeycfhtikfmcyadiy
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
                  <p className="text-white">انقر على <strong>"SQL Editor"</strong> في الشريط الجانبي</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
                  <p className="text-white">انسخ SQL من الجانب الأيسر والصقه في المحرر</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">4</span>
                  <p className="text-white">انقر <strong>"RUN"</strong> لتنفيذ الأوامر</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">5</span>
                  <p className="text-white">اختبر تسجيل الدخول أدناه</p>
                </div>
              </div>
            </div>

            {/* Test Login */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">🧪 اختبار تسجيل الدخول</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">البريد الإلكتروني:</span>
                      <span className="text-yellow-400 ml-2 font-mono">admin@carshowx.app</span>
                    </div>
                    <div>
                      <span className="text-gray-400">كلمة المرور:</span>
                      <span className="text-yellow-400 ml-2 font-mono">CarShowX@2025!</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={testLogin}
                    disabled={testing}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      testing 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    {testing ? '🔄 جاري الاختبار...' : '🧪 اختبار تسجيل الدخول'}
                  </button>
                  
                  <a
                    href="/admin/login"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    🌐 صفحة الدخول
                  </a>
                </div>

                {testResult && (
                  <div className={`p-4 rounded-lg ${
                    testResult.success 
                      ? 'bg-green-900/50 border border-green-400/30' 
                      : 'bg-red-900/50 border border-red-400/30'
                  }`}>
                    <p className={`font-semibold ${
                      testResult.success ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {testResult.success ? '✅ نجح تسجيل الدخول!' : '❌ فشل تسجيل الدخول'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      testResult.success ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {testResult.message}
                    </p>
                    {testResult.success && (
                      <p className="text-green-400 text-sm mt-2">
                        🎉 نظام المشرفين جاهز للاستخدام!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

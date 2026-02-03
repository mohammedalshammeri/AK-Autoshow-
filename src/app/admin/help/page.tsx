'use client';

import { useState } from 'react';

export default function DatabaseHelperPage() {
  const [setupResult, setSetupResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const tryAutomaticSetup = async () => {
    setLoading(true);
    setSetupResult(null);
    
    try {
      const response = await fetch('/api/admin/create-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setSetupResult(result);
    } catch (error) {
      setSetupResult({ 
        success: false, 
        error: 'Network error: ' + (error as Error).message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔧 CarShowX Database Helper
          </h1>
          <p className="text-xl text-gray-300">
            مساعد إعداد قاعدة بيانات نظام المشرفين
          </p>
        </div>

        {/* Current Issue */}
        <div className="bg-red-900/30 border border-red-400/50 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-red-200 mb-4">🚨 المشكلة الحالية</h2>
          <div className="space-y-3 text-red-100">
            <p>❌ الحصول على خطأ "Invalid credentials" عند تسجيل الدخول</p>
            <p>❌ جداول قاعدة البيانات غير موجودة</p>
            <p>✅ صفحة تسجيل الدخول تعمل بشكل صحيح</p>
            <p>✅ API endpoints جاهزة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Automatic Setup */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">🤖 الإعداد التلقائي</h2>
            <p className="text-gray-300 mb-4">جرب إنشاء الجداول تلقائياً أولاً</p>
            
            <button
              onClick={tryAutomaticSetup}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white mb-4`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جاري المحاولة...
                </div>
              ) : (
                '🚀 محاولة الإعداد التلقائي'
              )}
            </button>

            {setupResult && (
              <div className={`p-4 rounded-lg ${
                setupResult.success 
                  ? 'bg-green-900/50 border border-green-400/30' 
                  : 'bg-red-900/50 border border-red-400/30'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  setupResult.success ? 'text-green-200' : 'text-red-200'
                }`}>
                  {setupResult.success ? '✅ نجح الإعداد!' : '❌ فشل الإعداد التلقائي'}
                </h3>
                
                {setupResult.requiresManualSetup ? (
                  <div className="text-yellow-200">
                    <p className="mb-2">🔄 مطلوب إعداد يدوي - استخدم الطريقة اليدوية ←</p>
                  </div>
                ) : (
                  <pre className={`text-xs overflow-x-auto ${
                    setupResult.success ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {JSON.stringify(setupResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Manual Setup */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">🛠️ الإعداد اليدوي</h2>
            <p className="text-gray-300 mb-4">الطريقة المؤكدة للإعداد</p>
            
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">📋 الخطوات:</h3>
                <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
                  <li>افتح Supabase Dashboard</li>
                  <li>انقر على "SQL Editor"</li>
                  <li>انسخ محتوى ملف admin_setup_clean.sql</li>
                  <li>الصق في SQL Editor</li>
                  <li>انقر "RUN"</li>
                </ol>
              </div>

              <div className="space-y-3">
                <a
                  href="https://supabase.com/dashboard/project/bvebeycfhtikfmcyadiy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-center transition-colors"
                >
                  🌐 افتح Supabase Dashboard
                </a>
                
                <a
                  href="/admin/quick-setup"
                  className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-center transition-colors"
                >
                  📝 صفحة نسخ SQL
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SQL Preview */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📄 معاينة SQL</h2>
          <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-green-400 text-sm">
{`-- CarShowX Admin System Database Setup

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES admin_users(id),
    session_token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test admin user
INSERT INTO admin_users (email, password_hash, full_name, role, is_active, email_verified, permissions)
VALUES ('admin@carshowx.app', '$2a$12$LQ...', 'System Administrator', 'super_admin', true, true, '{...}');`}
            </pre>
          </div>
        </div>

        {/* Test Section */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">🧪 اختبار النظام</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">بيانات تسجيل الدخول:</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-400">البريد:</span>
                  <span className="text-yellow-400 ml-2 font-mono">admin@carshowx.app</span>
                </div>
                <div>
                  <span className="text-gray-400">المرور:</span>
                  <span className="text-yellow-400 ml-2 font-mono">CarShowX@2025!</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href="/admin/login"
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-center transition-colors"
              >
                🌐 صفحة تسجيل الدخول
              </a>
              <button
                onClick={() => window.location.reload()}
                className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                🔄 إعادة تحميل الصفحة
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            بعد إعداد قاعدة البيانات، جرب تسجيل الدخول مرة أخرى
          </p>
          <p className="text-gray-400 text-sm">
            إذا نجح تسجيل الدخول، فإن نظام المشرفين جاهز للاستخدام! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function DatabaseSetupPage() {
  const [setupResult, setSetupResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    setSetupResult(null);
    
    try {
      const response = await fetch('/api/admin/setup-simple', {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            🚗 CarShowX Database Setup
          </h1>
          <p className="text-xl text-gray-300">
            إعداد قاعدة بيانات نظام إدارة المشرفين
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            📊 Database Setup
          </h2>
          
          <div className="space-y-6">
            <div className="text-center">
              <button
                onClick={handleSetup}
                disabled={loading}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  loading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 hover:scale-105'
                } text-white shadow-lg`}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري الإعداد...
                  </div>
                ) : (
                  '🚀 إعداد قاعدة البيانات'
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-400/30">
              <h3 className="text-xl font-bold text-blue-200 mb-4">📋 التعليمات:</h3>
              <div className="space-y-3 text-blue-100">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <span>اضغط على زر "إعداد قاعدة البيانات" أعلاه</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <span>إذا فشل الإعداد التلقائي، استخدم الإعداد اليدوي أدناه</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <span>اختبر تسجيل الدخول بعد الإعداد</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {setupResult && (
            <div className="mt-6">
              <div className={`p-4 rounded-xl ${
                setupResult.success 
                  ? 'bg-green-900/30 border border-green-400/30' 
                  : 'bg-red-900/30 border border-red-400/30'
              }`}>
                <h4 className={`font-bold mb-2 ${
                  setupResult.success ? 'text-green-200' : 'text-red-200'
                }`}>
                  {setupResult.success ? '✅ نجح الإعداد!' : '❌ فشل الإعداد'}
                </h4>
                <pre className={`text-sm overflow-x-auto ${
                  setupResult.success ? 'text-green-100' : 'text-red-100'
                }`}>
                  {JSON.stringify(setupResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Manual Setup Instructions */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            🛠️ الإعداد اليدوي (إذا فشل الإعداد التلقائي)
          </h2>
          
          <div className="space-y-4 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
              <div>
                <p className="font-semibold">افتح لوحة تحكم Supabase</p>
                <a 
                  href="https://supabase.com/dashboard/project/bvebeycfhtikfmcyadiy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  https://supabase.com/dashboard/project/bvebeycfhtikfmcyadiy
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
              <div>
                <p className="font-semibold">انقر على "SQL Editor" في الشريط الجانبي</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
              <div>
                <p className="font-semibold">انسخ والصق SQL من ملف QUICK_DATABASE_SETUP.md</p>
                <p className="text-sm text-gray-400">الملف موجود في مجلد المشروع</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
              <div>
                <p className="font-semibold">انقر "RUN" لتنفيذ SQL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Login */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">
            🧪 اختبار تسجيل الدخول
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">بيانات الدخول:</h3>
              <div className="space-y-2 text-gray-300">
                <div>
                  <span className="text-gray-400">البريد الإلكتروني:</span>
                  <span className="ml-2 font-mono text-yellow-300">admin@carshowx.app</span>
                </div>
                <div>
                  <span className="text-gray-400">كلمة المرور:</span>
                  <span className="ml-2 font-mono text-yellow-300">CarShowX@2025!</span>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <a
                href="/admin/login"
                className="inline-block bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                🌐 صفحة تسجيل الدخول
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

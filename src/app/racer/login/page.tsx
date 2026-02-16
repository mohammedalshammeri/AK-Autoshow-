'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function RacerLoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const basePrefix = pathname?.startsWith('/ar') ? '/ar' : pathname?.startsWith('/en') ? '/en' : '';

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/racer/auth/check');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.replace(`${basePrefix}/racer/dashboard`);
          }
        }
      } catch (e) {
        // Not logged in, continue
      }
    };
    checkAuth();
  }, [router, basePrefix]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/racer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        router.push(`${basePrefix}/racer/dashboard`);
      } else {
        setError(data.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]"></div>
      
      <div className="max-w-md w-full relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-bold text-white mb-2">
              🏁 <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-yellow-500">Drift</span>
            </h1>
          </Link>
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-yellow-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">بوابة المتسابقين</h2>
          <p className="text-gray-400">سجل الدخول لعرض نتائجك ومعلوماتك</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-yellow-500 transition"
                placeholder="أدخل اسم المستخدم"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-yellow-500 transition"
                  placeholder="أدخل كلمة المرور"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-500 hover:to-red-500 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-900/20"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول 🏁'}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              💡 البيانات يتم إرسالها لك بعد قبول طلبك من قبل الإدارة
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-white text-sm transition">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

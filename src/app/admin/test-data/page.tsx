'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestDataSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const insertTestData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/test-data', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'فشل في إدخال البيانات التجريبية');
      }
    } catch (error) {
      console.error('Error inserting test data:', error);
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">🎯 إعداد البيانات التجريبية</h1>
            <p className="text-gray-400">إدخال بيانات تجريبية لاختبار النظام</p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-green-400 mb-2">تم بنجاح!</h2>
              <p className="text-gray-300 mb-4">تم إدخال البيانات التجريبية بنجاح</p>
              <p className="text-gray-400 text-sm">سيتم توجيهك للوحة الإدارة...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <h3 className="text-blue-300 font-medium mb-2">سيتم إدخال:</h3>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• 10 سيارات تجريبية (5 موافق عليها، 2 مرفوضة، 3 معلقة)</li>
                  <li>• 3 فعاليات تجريبية (2 نشطة، 1 قادمة)</li>
                  <li>• تحديث إحصائيات لوحة الإدارة</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <div className="flex flex-col space-y-4">
                <button
                  onClick={insertTestData}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-reverse space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الإدخال...</span>
                    </div>
                  ) : (
                    '🚀 إدخال البيانات التجريبية'
                  )}
                </button>

                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  ⬅️ العودة للوحة الإدارة
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            هذه البيانات للاختبار فقط ويمكن حذفها لاحقاً
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Sponsor = {
  id: string;
  name: string;
  tier?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  is_active?: boolean | null;
  display_order?: number | null;
  created_at?: string;
};

export default function AdminSponsorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [error, setError] = useState<string>('');

  const activeCount = useMemo(
    () => sponsors.filter(s => !!s.is_active).length,
    [sponsors]
  );

  useEffect(() => {
    const run = async () => {
      try {
        const authRes = await fetch('/api/admin/auth/check', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!authRes.ok) {
          router.replace('/admin/login');
          return;
        }

        const res = await fetch('/api/sponsors', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        });

        const data = await res.json();
        if (!res.ok || !data?.success) {
          setError(data?.error || 'Failed to load sponsors');
          setSponsors([]);
        } else {
          setSponsors(Array.isArray(data.sponsors) ? data.sponsors : []);
          setError('');
        }
      } catch (e: any) {
        setError(e?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل الرعاة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🤝 إدارة الرعاة</h1>
            <p className="text-gray-400">عرض قائمة الرعاة وإدارة طلبات الرعاية من لوحة التحكم</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← العودة للوحة الرئيسية
            </Link>
            <Link
              href="/admin/dashboard"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              طلبات الرعاية
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <p className="text-gray-400 text-sm">إجمالي الرعاة</p>
            <p className="text-white text-3xl font-bold">{sponsors.length}</p>
          </div>
          <div className="bg-green-900/20 rounded-xl p-6 border border-green-900/30 text-right">
            <p className="text-green-300 text-sm">نشط</p>
            <p className="text-green-200 text-3xl font-bold">{activeCount}</p>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <p className="text-gray-400 text-sm">غير نشط</p>
            <p className="text-white text-3xl font-bold">{Math.max(0, sponsors.length - activeCount)}</p>
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">📋 قائمة الرعاة</h2>
            <p className="text-gray-400 text-sm mt-1">هذه الصفحة للعرض السريع. الموافقة/الرفض على الطلبات من لوحة التحكم.</p>
          </div>

          {sponsors.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <div className="text-6xl mb-3">📭</div>
              لا يوجد رعاة حالياً
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="p-4 text-gray-300 font-medium">الاسم</th>
                    <th className="p-4 text-gray-300 font-medium">الباقة</th>
                    <th className="p-4 text-gray-300 font-medium">الحالة</th>
                    <th className="p-4 text-gray-300 font-medium">الترتيب</th>
                    <th className="p-4 text-gray-300 font-medium">الموقع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {sponsors.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 text-white font-medium">
                        <div className="flex items-center gap-3">
                          {s.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={s.logo_url}
                              alt={s.name}
                              className="w-10 h-10 rounded bg-black/30 border border-gray-700 object-contain"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-black/30 border border-gray-700" />
                          )}
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{s.tier || '-'}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                          s.is_active ? 'bg-green-900/30 border-green-800 text-green-300' : 'bg-gray-900/30 border-gray-700 text-gray-300'
                        }`}>
                          {s.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 font-mono">{typeof s.display_order === 'number' ? s.display_order : '-'}</td>
                      <td className="p-4 text-gray-300">
                        {s.website_url ? (
                          <a
                            href={s.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-300 hover:text-purple-200 underline"
                            dir="ltr"
                          >
                            {s.website_url}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-900/20 rounded-xl p-5 border border-blue-900/30 text-right">
          <p className="text-blue-200 text-sm">
            لإدارة المشاركين والجولات: ادخل إلى
            {' '}
            <Link href="/admin/events" className="underline text-blue-100 hover:text-white">قائمة الفعاليات</Link>
            {' '}
            ثم اختر الفعالية.
          </p>
        </div>
      </div>
    </div>
  );
}

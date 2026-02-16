'use client';

import { useEffect, useMemo, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getSponsorRequests, updateSponsorRequestStatus, getSponsorStats } from '@/actions/sponsor-actions';

type Sponsor = {
  id: string;
  name: string;
  tier?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  is_active?: boolean | null;
  display_order?: number | null;
};

type SponsorRequest = {
  id: string;
  name: string;
  phone: string;
  package_tier: string;
  company_name: string;
  email: string;
  status: string;
  created_at: string;
};

export default function EventSponsorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [requests, setRequests] = useState<SponsorRequest[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const pendingRequests = useMemo(() => requests.filter(r => r.status === 'pending'), [requests]);

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

        const [sRes, listRes, statsRes] = await Promise.all([
          fetch('/api/sponsors', {
            credentials: 'include',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
            },
          }),
          getSponsorRequests(),
          getSponsorStats(),
        ]);

        const sData = await sRes.json();
        if (!sRes.ok || !sData?.success) {
          setError(sData?.error || 'Failed to load sponsors');
          setSponsors([]);
        } else {
          setSponsors(Array.isArray(sData.sponsors) ? sData.sponsors : []);
        }

        if (listRes.success && listRes.data) setRequests(listRes.data);
        if (statsRes) setStats(statsRes);

        setError('');
      } catch (e: any) {
        setError(e?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [router]);

  const handleStatusUpdate = async (reqId: string, status: 'approved' | 'rejected') => {
    if (!confirm(status === 'approved' ? 'هل تريد قبول طلب الراعي؟' : 'هل تريد رفض طلب الراعي؟')) return;

    const result = await updateSponsorRequestStatus(reqId, status);
    if (!result.success) {
      alert('فشل تحديث الحالة');
      return;
    }

    const listRes = await getSponsorRequests();
    if (listRes.success && listRes.data) setRequests(listRes.data);

    const statsRes = await getSponsorStats();
    if (statsRes) setStats(statsRes);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mr-3" />
        جاري تحميل الرعاة...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h1 className="text-2xl font-black">🤝 الرعاة</h1>
        <p className="text-gray-400 mt-1">إدارة الرعاة وطلبات الرعاية من داخل لوحة الفعالية (بدون الرجوع لأي لوحة ثانية).</p>
        <p className="text-gray-500 mt-1 text-sm">Event #{id}</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-2xl p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-900/20 border border-yellow-900/30 rounded-2xl p-5">
          <div className="text-yellow-300 text-sm">طلبات معلقة</div>
          <div className="text-3xl font-black text-yellow-200">{stats.pending}</div>
        </div>
        <div className="bg-green-900/20 border border-green-900/30 rounded-2xl p-5">
          <div className="text-green-300 text-sm">موافق عليها</div>
          <div className="text-3xl font-black text-green-200">{stats.approved}</div>
        </div>
        <div className="bg-red-900/20 border border-red-900/30 rounded-2xl p-5">
          <div className="text-red-300 text-sm">مرفوضة</div>
          <div className="text-3xl font-black text-red-200">{stats.rejected}</div>
        </div>
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="font-bold text-gray-200">طلبات الرعاية المعلقة</div>
          <div className="text-sm text-gray-400">{pendingRequests.length} طلب</div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-10 text-center text-gray-400">لا توجد طلبات معلقة</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right" style={{ minWidth: '900px' }}>
              <thead className="bg-gray-950/60">
                <tr className="text-gray-400 text-sm border-b border-gray-800">
                  <th className="p-4">الاسم</th>
                  <th className="p-4">الشركة</th>
                  <th className="p-4">الهاتف</th>
                  <th className="p-4">الباقة</th>
                  <th className="p-4">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {pendingRequests.map(r => (
                  <tr key={r.id} className="hover:bg-gray-800/30 transition">
                    <td className="p-4 text-white font-medium">{r.name}</td>
                    <td className="p-4 text-gray-300">{r.company_name || '-'}</td>
                    <td className="p-4 text-gray-300" dir="ltr">{r.phone}</td>
                    <td className="p-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold border bg-gray-900/30 border-gray-800 text-gray-200">
                        {r.package_tier}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-start">
                        <button
                          onClick={() => handleStatusUpdate(r.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold transition"
                        >
                          قبول
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(r.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold transition"
                        >
                          رفض
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <div className="font-bold text-gray-200">قائمة الرعاة</div>
          <div className="text-sm text-gray-400">{sponsors.length} راعي</div>
        </div>

        {sponsors.length === 0 ? (
          <div className="p-10 text-center text-gray-400">لا يوجد رعاة حالياً</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right" style={{ minWidth: '900px' }}>
              <thead className="bg-gray-950/60">
                <tr className="text-gray-400 text-sm border-b border-gray-800">
                  <th className="p-4">الاسم</th>
                  <th className="p-4">الباقة</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">الموقع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sponsors.map(s => (
                  <tr key={s.id} className="hover:bg-gray-800/30 transition">
                    <td className="p-4 text-white font-medium">
                      <div className="flex items-center gap-3">
                        {s.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logo_url} alt={s.name} className="w-10 h-10 rounded bg-black/30 border border-gray-800 object-contain" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-black/30 border border-gray-800" />
                        )}
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{s.tier || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                        s.is_active ? 'bg-green-900/30 border-green-800 text-green-300' : 'bg-gray-900/30 border-gray-800 text-gray-300'
                      }`}>
                        {s.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300" dir="ltr">
                      {s.website_url ? (
                        <span className="text-purple-200">{s.website_url}</span>
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
    </div>
  );
}

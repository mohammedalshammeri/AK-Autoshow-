'use client';

import { useState, useEffect, use } from 'react';
import { approveRacerRegistration } from '@/app/_actions';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, Search, Download, RefreshCcw, Users, ArrowRight } from 'lucide-react';

type Reg = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  country_code: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_category: string;
  status: string;
  registration_number: string | null;
  created_at: string;
  car_photo_url: string | null;
  has_passenger: boolean;
  passenger_name: string | null;
  round_id: string | null;
};

type Round = {
  id: string;
  name: string;
  round_order: number;
  status: string;
  round_date: string;
};

type Stats = { total: string; pending: string; approved: string; rejected: string };

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
};
const STATUS_LABEL: Record<string, string> = {
  approved: 'مقبول',
  rejected: 'مرفوض',
  pending: 'قيد المراجعة',
};

export default function RoundRegistrationsPage({ params }: { params: Promise<{ id: string; roundId: string }> }) {
  const { id: eventId, roundId } = use(params);

  const [regs, setRegs] = useState<Reg[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [allRounds, setAllRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approvalSuccess, setApprovalSuccess] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (search) params.set('q', search);

      const [regRes, roundsRes] = await Promise.all([
        fetch(`/api/admin/events/${eventId}/rounds/${roundId}/registrations?${params}`),
        fetch(`/api/admin/events/${eventId}/rounds`),
      ]);

      const regData = await regRes.json();
      if (regData.success) {
        setRegs(regData.registrations);
        setStats(regData.stats);
        setRound(regData.round);
      }

      const roundsData = await roundsRes.json();
      if (roundsData.success) setAllRounds(roundsData.data || roundsData.rounds || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [roundId, statusFilter, categoryFilter]);

  const handleApprove = async (regId: string) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا المتسابق؟')) return;
    setProcessingId(regId);
    try {
      const res = await approveRacerRegistration(regId);
      if (res.success) {
        setApprovalSuccess(regId);
        setTimeout(() => setApprovalSuccess(null), 3000);
        loadData();
      } else {
        alert('خطأ: ' + res.error);
      }
    } catch {
      alert('حدث خطأ غير متوقع');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (regId: string) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا المتسابق؟')) return;
    setProcessingId(regId);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/rounds/${roundId}/registrations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId, status: 'rejected' }),
      });
      if (res.ok) loadData();
      else alert('حدث خطأ في الرفض');
    } catch {
      alert('حدث خطأ غير متوقع');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMoveToRound = async (regId: string, newRoundId: string) => {
    setMovingId(regId);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/rounds/${roundId}/registrations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId, newRoundId }),
      });
      if (res.ok) loadData();
      else alert('حدث خطأ في النقل');
    } catch {
      alert('حدث خطأ غير متوقع');
    } finally {
      setMovingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const exportCSV = () => {
    const headers = ['الاسم', 'البريد', 'الجوال', 'السيارة', 'الفئة', 'الحالة', 'رقم التسجيل', 'التاريخ'];
    const rows = regs.map(r => [
      r.full_name, r.email, `${r.country_code}${r.phone_number}`,
      `${r.car_make} ${r.car_model} ${r.car_year}`, r.car_category || '',
      STATUS_LABEL[r.status] || r.status, r.registration_number || '',
      new Date(r.created_at).toLocaleDateString('ar-BH'),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${round?.name || 'round'}-registrations.csv`;
    a.click();
  };

  const roundStatus = round?.status;
  const roundStatusColor = roundStatus === 'active' ? 'bg-green-600' : roundStatus === 'completed' ? 'bg-gray-600' : 'bg-yellow-600';
  const roundStatusLabel = roundStatus === 'active' ? 'جاري 🏁' : roundStatus === 'completed' ? 'مكتمل ✅' : 'قادم ⏳';

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6" dir="rtl">
      {/* Toast */}
      {approvalSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold">
          ✅ تم قبول المتسابق وإرسال الإشعار بنجاح
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <Link href={`/admin/events/${eventId}/rounds`} className="text-gray-400 hover:text-yellow-400 flex items-center gap-1 mb-2 text-sm transition-colors">
              <ArrowRight className="w-4 h-4" />
              عودة لقائمة الجولات
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {round?.name || 'جولة الأسبوع'}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${roundStatusColor}`}>
                {roundStatusLabel}
              </span>
              {round?.round_date && (
                <span className="text-gray-400 text-sm">
                  📅 {new Date(round.round_date).toLocaleDateString('ar-BH')}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors">
              <RefreshCcw className="w-4 h-4" /> تحديث
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-black font-semibold text-sm transition-colors">
              <Download className="w-4 h-4" /> تصدير CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'الإجمالي', value: stats?.total || 0, color: 'text-blue-400', bg: 'from-blue-600/20 to-blue-800/20 border-blue-700/50', icon: <Users className="w-6 h-6 text-blue-400" /> },
            { label: 'قيد المراجعة', value: stats?.pending || 0, color: 'text-yellow-400', bg: 'from-yellow-600/20 to-yellow-800/20 border-yellow-700/50', icon: <Clock className="w-6 h-6 text-yellow-400" /> },
            { label: 'مقبول', value: stats?.approved || 0, color: 'text-green-400', bg: 'from-green-600/20 to-green-800/20 border-green-700/50', icon: <CheckCircle className="w-6 h-6 text-green-400" /> },
            { label: 'مرفوض', value: stats?.rejected || 0, color: 'text-red-400', bg: 'from-red-600/20 to-red-800/20 border-red-700/50', icon: <XCircle className="w-6 h-6 text-red-400" /> },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.bg} border rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-1">
                {s.icon}
                <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
              </div>
              <p className="text-gray-300 text-sm font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث بالاسم، رقم التسجيل، رقم الجوال..."
                className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg py-2 pr-10 pl-4 focus:border-yellow-500 focus:outline-none text-sm"
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none">
              <option value="all">كل الحالات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none">
              <option value="all">كل الفئات</option>
              <option value="headers">Headers</option>
              <option value="turbo">Turbo</option>
              <option value="4x4">4x4</option>
            </select>
            <button type="submit" className="px-5 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm">بحث</button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-yellow-500"></div>
            </div>
          ) : regs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-3">📋</div>
              <p>لا توجد تسجيلات في هذا الأسبوع</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/80 border-b border-gray-700">
                  <tr>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">#</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">الاسم</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">السيارة</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">الفئة</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">الجوال</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">تاريخ التسجيل</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">الحالة</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">رقم T.R.</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-semibold">الإجراءات</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">نقل للأسبوع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {regs.map((reg, idx) => (
                    <tr key={reg.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{reg.full_name}</div>
                        <div className="text-gray-400 text-xs">{reg.email}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {reg.car_make} {reg.car_model}
                        <div className="text-gray-500 text-xs">{reg.car_year}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
                          {reg.car_category || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-xs">{reg.country_code}{reg.phone_number}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {new Date(reg.created_at).toLocaleDateString('ar-BH')}
                        <div className="text-gray-500">{new Date(reg.created_at).toLocaleTimeString('ar-BH', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[reg.status] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                          {STATUS_LABEL[reg.status] || reg.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-yellow-400 text-xs font-mono">{reg.registration_number || '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {(reg.status === 'pending' || reg.status === 'rejected') && (
                            <button
                              disabled={!!processingId}
                              onClick={() => handleApprove(reg.id)}
                              className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                            >
                              {processingId === reg.id ? '...' : '✅ قبول'}
                            </button>
                          )}
                          {(reg.status === 'pending' || reg.status === 'approved') && (
                            <button
                              disabled={!!processingId}
                              onClick={() => handleReject(reg.id)}
                              className="bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                            >
                              {processingId === reg.id ? '...' : '❌ رفض'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          disabled={movingId === reg.id}
                          defaultValue=""
                          onChange={e => { if (e.target.value) handleMoveToRound(reg.id, e.target.value); }}
                          className="bg-gray-800 border border-gray-600 text-gray-300 text-xs rounded px-2 py-1.5 focus:border-yellow-500 focus:outline-none disabled:opacity-50 w-32"
                        >
                          <option value="" disabled>نقل إلى...</option>
                          {allRounds.filter(r => r.id !== roundId).map(r => (
                            <option key={r.id} value={r.id}>الأسبوع {r.round_order}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Total count */}
        {!loading && regs.length > 0 && (
          <p className="text-gray-500 text-sm mt-3 text-left">
            إجمالي النتائج: {regs.length}
          </p>
        )}
      </div>
    </div>
  );
}

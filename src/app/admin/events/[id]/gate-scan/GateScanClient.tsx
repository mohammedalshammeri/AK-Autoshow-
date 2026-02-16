'use client';

import { useMemo, useState } from 'react';

type GateScanResult = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  status: string;
  registration_number: string | null;
  car_make: string | null;
  car_model: string | null;
  car_year: number | null;
  created_at: string;
  check_in_status?: string | null;
  inspection_status?: string | null;
  checked_in_at?: string | null;
  rejection_reason?: string | null;
  car_images?: { id: string; image_url: string }[];
};

export default function GateScanClient({ eventId }: { eventId: string }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GateScanResult[]>([]);
  const [selected, setSelected] = useState<GateScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const canSearch = useMemo(() => query.trim().length > 0, [query]);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setError(null);
    setIsSearching(true);
    setSelected(null);

    try {
      const res = await fetch(`/api/admin/events/${eventId}/gate-scan?q=${encodeURIComponent(q)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to search');
      }
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const updateGateStatus = async (action: 'check_in' | 'reject_gate') => {
    if (!selected) return;

    let notes: string | undefined;
    if (action === 'reject_gate') {
      const reason = prompt('سبب الرفض عند البوابة:') || '';
      notes = reason.trim() || 'Rejected at gate';
    }

    setError(null);
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/gate-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: selected.id, action, notes }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Update failed');
      }

      const nextSelected: GateScanResult = {
        ...selected,
        ...(data.registration || {}),
      };
      setSelected(nextSelected);

      setResults((prev) =>
        prev.map((r) => (r.id === selected.id ? { ...r, ...(data.registration || {}) } : r))
      );
    } catch (e: any) {
      setError(e?.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-2">🚩 فحص البوابة</h1>
        <p className="text-gray-400 text-sm mb-4">ابحث برقم التسجيل، الاسم، البريد، رقم الجوال، أو تفاصيل السيارة.</p>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch();
            }}
            placeholder="مثال: BN-... أو الاسم"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-yellow-500 focus:outline-none"
          />
          <button
            onClick={runSearch}
            disabled={!canSearch || isSearching}
            className="px-6 py-3 rounded bg-yellow-500 text-black font-semibold disabled:opacity-50"
          >
            {isSearching ? 'جاري البحث...' : 'بحث'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-700 text-red-200 p-3 rounded">
            {error}
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">نتائج البحث</h2>
        {results.length === 0 ? (
          <p className="text-gray-400">لا توجد نتائج.</p>
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className="w-full text-left flex justify-between items-center bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 hover:border-yellow-500 transition-colors"
              >
                <div>
                  <p className="text-white font-semibold">{r.full_name}</p>
                  <p className="text-gray-400 text-sm">{r.email} • {r.phone_number}</p>
                  <p className="text-gray-400 text-sm">🚗 {r.car_make} {r.car_model} ({r.car_year})</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 text-sm font-mono">{r.registration_number || `AKA-${String(r.id).slice(-4)}`}</p>
                  <p className="text-gray-400 text-xs mt-1">{r.check_in_status === 'checked_in' ? '✅ Checked in' : '—'}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selected.full_name}</h3>
                  <p className="text-gray-400 text-sm">{selected.registration_number || `AKA-${String(selected.id).slice(-4)}`}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-3xl">×</button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3">👤 المشارك</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div>{selected.email}</div>
                    <div>{selected.phone_number}</div>
                    <div>الحالة: <span className="text-white">{selected.status}</span></div>
                    <div>الدخول: <span className="text-white">{selected.check_in_status || '—'}</span></div>
                    <div>الفحص: <span className="text-white">{selected.inspection_status || '—'}</span></div>
                  </div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3">🚗 السيارة</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div>{selected.car_make} {selected.car_model}</div>
                    <div>السنة: <span className="text-white">{selected.car_year}</span></div>
                    <div>الصور: <span className="text-white">{selected.car_images?.length || 0}</span></div>
                  </div>
                </div>
              </div>

              {selected.car_images && selected.car_images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {selected.car_images.map((img, idx) => (
                    <div key={img.id} className="relative">
                      <img
                        src={img.image_url}
                        alt={`car ${idx + 1}`}
                        className="w-full h-56 object-cover rounded-xl border border-gray-700"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6 text-gray-300">
                  لا توجد صور للسيارة.
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-3 justify-end">
                <button
                  onClick={() => updateGateStatus('reject_gate')}
                  disabled={isUpdating}
                  className="px-5 py-3 rounded bg-red-600 text-white font-semibold disabled:opacity-50"
                >
                  {isUpdating ? '...' : 'رفض عند البوابة'}
                </button>
                <button
                  onClick={() => updateGateStatus('check_in')}
                  disabled={isUpdating}
                  className="px-5 py-3 rounded bg-green-600 text-white font-semibold disabled:opacity-50"
                >
                  {isUpdating ? '...' : '✅ السماح بالدخول (Check-in)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

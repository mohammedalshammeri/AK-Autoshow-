'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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

function QRScannerModal({
  onDetected,
  onClose,
}: {
  onDetected: (value: string) => void;
  onClose: () => void;
}) {
  const scannerDivId = 'gate-qr-scanner-div';
  const scannerRef = useRef<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const hasDetected = useRef(false);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        if (!mounted) return;

        const scanner = new Html5QrcodeScanner(
          scannerDivId,
          {
            fps: 10,
            qrbox: { width: 280, height: 280 },
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
          },
          false
        );
        scannerRef.current = scanner;

        scanner.render(
          (decodedText: string) => {
            if (hasDetected.current) return;
            hasDetected.current = true;

            // Try to parse JSON QR format: { regNum, name, ... }
            let searchValue = decodedText;
            try {
              const parsed = JSON.parse(decodedText);
              if (parsed?.regNum) searchValue = parsed.regNum;
              else if (parsed?.registrationNumber) searchValue = parsed.registrationNumber;
            } catch {
              // plain text — use as-is
            }

            scanner.clear().catch(() => {});
            onDetected(searchValue);
          },
          (errorMsg: string) => {
            // Ignore per-frame decode failures (normal)
          }
        );
      } catch (e: any) {
        if (mounted) setScanError('تعذّر تشغيل الكاميرا: ' + (e?.message || ''));
      }
    };

    startScanner();

    return () => {
      mounted = false;
      scannerRef.current?.clear().catch(() => {});
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[60] p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📷</span>
            <h2 className="text-white font-bold text-lg">مسح QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Scanner area */}
        <div className="p-4">
          {scanError ? (
            <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <p>{scanError}</p>
            </div>
          ) : (
            <div
              id={scannerDivId}
              className="w-full rounded-lg overflow-hidden"
              style={{ minHeight: 320 }}
            />
          )}
        </div>

        {/* Hint */}
        <div className="px-5 pb-4 text-center">
          <p className="text-gray-400 text-sm">وجّه الكاميرا نحو QR Code الموجود في بطاقة المتسابق</p>
        </div>
      </div>
    </div>
  );
}

export default function GateScanClient({ eventId }: { eventId: string }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GateScanResult[]>([]);
  const [selected, setSelected] = useState<GateScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrSuccess, setQRSuccess] = useState<string | null>(null);

  const canSearch = useMemo(() => query.trim().length > 0, [query]);

  const runSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery ?? query).trim();
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
      const found: GateScanResult[] = Array.isArray(data.results) ? data.results : [];
      setResults(found);
      // Auto-select if exactly one result
      if (found.length === 1) setSelected(found[0]);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQRDetected = (value: string) => {
    setShowQRScanner(false);
    setQuery(value);
    setQRSuccess(value);
    runSearch(value);
    setTimeout(() => setQRSuccess(null), 4000);
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
      {/* QR scanned toast */}
      {qrSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-teal-600 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-pulse">
          📷 تم مسح QR: {qrSuccess}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-2">🚩 فحص البوابة</h1>
        <p className="text-gray-400 text-sm mb-4">ابحث برقم التسجيل، الاسم، البريد، رقم الجوال، أو امسح QR Code مباشرة.</p>

        {/* Search row */}
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
          {/* QR Camera button */}
          <button
            onClick={() => setShowQRScanner(true)}
            className="px-5 py-3 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            title="مسح QR Code"
          >
            <span className="text-xl">📷</span>
            <span>مسح QR</span>
          </button>
          <button
            onClick={() => runSearch()}
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

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          onDetected={handleQRDetected}
          onClose={() => setShowQRScanner(false)}
        />
      )}

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

              {/* Check-in status banner */}
              {selected.check_in_status === 'checked_in' && (
                <div className="bg-green-600/20 border border-green-500/40 rounded-xl p-4 mb-6 text-center">
                  <p className="text-green-400 font-bold text-lg">✅ تم الدخول مسبقاً</p>
                  {selected.checked_in_at && (
                    <p className="text-green-300 text-sm mt-1">
                      {new Date(selected.checked_in_at).toLocaleString('ar-BH')}
                    </p>
                  )}
                </div>
              )}
              {selected.inspection_status === 'rejected' && (
                <div className="bg-red-600/20 border border-red-500/40 rounded-xl p-4 mb-6 text-center">
                  <p className="text-red-400 font-bold text-lg">❌ مرفوض عند البوابة</p>
                  {selected.rejection_reason && (
                    <p className="text-red-300 text-sm mt-1">{selected.rejection_reason}</p>
                  )}
                </div>
              )}

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

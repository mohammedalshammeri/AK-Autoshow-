'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Registration = Record<string, any> & { id: string };

type Category = 'headers' | 'turbo' | '4x4' | '';

export default function EventEditRegistrationPage({
  params,
}: {
  params: Promise<{ id: string; registrationId: string }>;
}) {
  const router = useRouter();
  const { id: eventId, registrationId } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [registration, setRegistration] = useState<Registration | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    car_make: '',
    car_model: '',
    car_year: '',
    car_category: '' as Category,
    has_passenger: false,
    passenger_name: '',
  });

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

        const res = await fetch(
          `/api/admin/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}`,
          {
            credentials: 'include',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
            },
          }
        );

        const data = await res.json();
        if (!res.ok || !data?.success) {
          setError(data?.error || 'Failed to load registration');
          setRegistration(null);
          return;
        }

        const reg = data.registration as Registration;
        setRegistration(reg);
        setForm({
          full_name: reg.full_name || '',
          email: reg.email || '',
          phone_number: reg.phone_number || '',
          car_make: reg.car_make || '',
          car_model: reg.car_model || '',
          car_year: reg.car_year ? String(reg.car_year) : '',
          car_category: (['headers', 'turbo', '4x4'].includes(String(reg.car_category || '').toLowerCase())
            ? String(reg.car_category || '').toLowerCase()
            : '') as Category,
          has_passenger: !!reg.has_passenger,
          passenger_name: reg.passenger_name || '',
        });
      } catch (e: any) {
        setError(e?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [eventId, registrationId, router]);

  const onChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setError('');
    setSaving(true);

    try {
      const payload: any = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        car_make: form.car_make.trim(),
        car_model: form.car_model.trim(),
        car_year: form.car_year ? Number(form.car_year) : null,
        car_category: form.car_category || null,
        has_passenger: !!form.has_passenger,
        passenger_name: form.has_passenger ? form.passenger_name.trim() : null,
      };

      const res = await fetch(
        `/api/admin/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Failed to save');
        return;
      }

      setRegistration(data.registration || registration);
      router.refresh();
      alert('تم حفظ التعديلات ✅');
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل بيانات المشارك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">✏️ تعديل بيانات المشارك</h1>
            <p className="text-gray-400">
              Registration ID: <span className="font-mono">{registrationId}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/events/${eventId}/registrations`}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← القائمة
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {!registration ? (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-10 border border-gray-700 text-center text-gray-300">
            لم يتم العثور على بيانات هذا المشارك.
          </div>
        ) : (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">البيانات الأساسية</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-300 mb-2">الاسم الكامل</label>
                <input
                  value={form.full_name}
                  onChange={(e) => onChange('full_name', e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl p-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">الإيميل</label>
                <input
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl p-3 outline-none focus:border-red-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">رقم الهاتف</label>
                <input
                  value={form.phone_number}
                  onChange={(e) => onChange('phone_number', e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl p-3 outline-none focus:border-red-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">سنة السيارة</label>
                <input
                  value={form.car_year}
                  onChange={(e) => onChange('car_year', e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl p-3 outline-none focus:border-red-500"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">الشركة (Make)</label>
                <input
                  value={form.car_make}
                  onChange={(e) => onChange('car_make', e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl p-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">الموديل (Model)</label>
                <input
                  value={form.car_model}
                  onChange={(e) => onChange('car_model', e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl p-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">الفئة (Category)</label>
                <select
                  value={form.car_category}
                  onChange={(e) => onChange('car_category', e.target.value as Category)}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl p-3 outline-none focus:border-red-500"
                >
                  <option value="">— بدون —</option>
                  <option value="headers">Headers (هدرز)</option>
                  <option value="turbo">Turbo (تيربو)</option>
                  <option value="4x4">4x4 (دفع رباعي)</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-gray-200">
                  <input
                    type="checkbox"
                    checked={form.has_passenger}
                    onChange={(e) => onChange('has_passenger', e.target.checked)}
                    className="h-4 w-4"
                  />
                  لديه مساعد (Passenger)
                </label>
              </div>

              {form.has_passenger && (
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300 mb-2">اسم المساعد</label>
                  <input
                    value={form.passenger_name}
                    onChange={(e) => onChange('passenger_name', e.target.value)}
                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl p-3 outline-none focus:border-red-500"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                الحالة الحالية: <span className="text-white font-bold">{String(registration.status || '-')}</span>
              </div>
              <button
                onClick={onSave}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

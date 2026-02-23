'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Registration {
  id: string;
  full_name: string;
  registration_number: string;
  status: string;
  car_make: string;
  car_model: string;
  car_year: string;
  car_category: string;
  has_passenger: boolean;
  passenger_name: string;
  check_in_status: string;
  attendance_confirmed: boolean;
  attendance_confirmed_at: string | null;
  event_name: string;
  event_date: string;
  location: string;
}

interface Props {
  registration: Registration;
  regNumber: string;
  eventDate: string;
  qrUrl: string;
}

export default function AttendanceClient({ registration, regNumber, eventDate, qrUrl }: Props) {
  const [confirmed, setConfirmed] = useState(registration.attendance_confirmed);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setConfirming(true);
    setError('');
    try {
      const res = await fetch('/api/confirm-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reg: regNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmed(true);
      } else {
        setError(data.error || 'حدث خطأ، حاول مرة أخرى');
      }
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setConfirming(false);
    }
  };

  const isCheckedIn = registration.check_in_status === 'checked_in';

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white" dir="rtl">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 py-4 px-6 text-center">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
          AKAutoshow
        </h1>
        <p className="text-gray-400 text-sm">تأكيد الحضور</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">

        {/* Status Banner */}
        {isCheckedIn ? (
          <div className="bg-green-900/30 border border-green-500/50 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h2 className="text-xl font-bold text-green-400">تم تسجيل حضورك</h2>
            <p className="text-green-300 text-sm mt-1">أهلاً بك في الفعالية!</p>
          </div>
        ) : confirmed ? (
          <div className="bg-green-900/20 border border-green-600/40 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h2 className="text-xl font-bold text-green-400">تم تأكيد حضورك</h2>
            <p className="text-gray-300 text-sm mt-1">نراك في الفعالية! أحضر هذه البطاقة معك</p>
          </div>
        ) : (
          <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">🏁</div>
            <h2 className="text-xl font-bold text-yellow-400">تسجيلك مقبول</h2>
            <p className="text-gray-300 text-sm mt-1">يرجى تأكيد حضورك للاحتفاظ بمكانك في الفعالية</p>
          </div>
        )}

        {/* Registration Number */}
        <div className="bg-black border border-gray-700 rounded-2xl p-5 text-center">
          <p className="text-gray-400 text-sm mb-2">رقم تسجيلك</p>
          <div className="text-2xl md:text-3xl font-black font-mono text-yellow-400 tracking-wider">
            {regNumber}
          </div>
        </div>

        {/* CONFIRMATION BUTTON — shown only if not confirmed yet */}
        {!confirmed && !isCheckedIn && (
          <div className="bg-gray-900 border border-yellow-700/50 rounded-2xl p-6 text-center">
            <p className="text-gray-300 mb-2 text-sm">⚠️ الأماكن محدودة</p>
            <p className="text-white mb-5 font-semibold">
              هل ستحضر الفعالية؟ أكد حضورك الآن لضمان مكانك
            </p>
            {error && (
              <p className="text-red-400 text-sm mb-3">{error}</p>
            )}
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-lg py-4 px-6 rounded-xl transition-all duration-200 active:scale-95"
            >
              {confirming ? '⏳ جاري التأكيد...' : '✅ نعم، سأحضر الفعالية'}
            </button>
          </div>
        )}

        {/* QR Code — shown only after confirmation */}
        {(confirmed || isCheckedIn) && (
          <div className="bg-white rounded-2xl p-5 text-center">
            <p className="text-black font-bold text-sm mb-3">QR Code للتحقق عند البوابة</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="QR Code"
              width={220}
              height={220}
              className="mx-auto rounded-xl"
            />
            <p className="text-gray-500 text-xs mt-2">أظهر هذا الكود عند الدخول</p>
          </div>
        )}

        {/* Participant Info */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-yellow-400 mb-3">بيانات المشارك</h3>
          <Row label="👤 الاسم" value={registration.full_name} />
          <Row label="🚗 السيارة" value={`${registration.car_make} ${registration.car_model} ${registration.car_year || ''}`} />
          {registration.car_category && (
            <Row label="🏷️ الفئة" value={registration.car_category} />
          )}
          {registration.has_passenger && registration.passenger_name && (
            <Row label="👫 الراكب" value={registration.passenger_name} />
          )}
        </div>

        {/* Event Details */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-yellow-400 mb-3">تفاصيل الفعالية</h3>
          <Row label="🏆 الفعالية" value={registration.event_name} />
          <Row label="📅 التاريخ" value={eventDate} />
          <Row label="📍 الموقع" value={registration.location || '—'} />
        </div>

        {/* Note */}
        <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-4 text-sm text-center text-red-200">
          <strong>ملاحظة:</strong> بعد تأكيد الحضور سيظهر كود الدخول QR. أحضره معك يوم الفعالية.
        </div>

        <div className="text-center pb-6">
          <Link href="/" className="text-gray-500 text-sm hover:text-gray-300 underline">
            العودة للرئيسية
          </Link>
        </div>

      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-2 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-semibold text-right">{value}</span>
    </div>
  );
}

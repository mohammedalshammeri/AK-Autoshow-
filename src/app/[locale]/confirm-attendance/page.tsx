import { query } from '@/lib/db';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ reg?: string }>;
}

async function getRegistration(regNumber: string) {
  try {
    const result = await query(
      `SELECT
        r.id, r.full_name, r.registration_number, r.status, r.car_make, r.car_model, r.car_year,
        r.car_category, r.has_passenger, r.passenger_name, r.check_in_status,
        e.name as event_name, e.event_date, e.location
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.registration_number = $1`,
      [regNumber]
    );
    return result.rows[0] || null;
  } catch {
    return null;
  }
}

export default async function ConfirmAttendancePage({ searchParams }: PageProps) {
  const { reg } = await searchParams;

  if (!reg) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4" dir="rtl">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">رابط غير صحيح</h1>
          <p className="text-gray-400">لم يتم تحديد رقم التسجيل في الرابط.</p>
          <Link href="/" className="mt-6 inline-block text-yellow-400 underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const registration = await getRegistration(reg);

  if (!registration) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4" dir="rtl">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">لم يتم العثور على التسجيل</h1>
          <p className="text-gray-400">رقم التسجيل <span className="font-mono text-yellow-400">{reg}</span> غير موجود.</p>
          <Link href="/" className="mt-6 inline-block text-yellow-400 underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  if (registration.status !== 'approved') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4" dir="rtl">
        <div className="bg-gray-900 border border-yellow-700/50 rounded-2xl p-8 max-w-md w-full text-center text-white">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-2">طلبك قيد المراجعة</h1>
          <p className="text-gray-400 mb-4">لم يتم قبول تسجيلك بعد. ستصلك رسالة بمجرد الموافقة.</p>
          <p className="text-gray-500 text-sm font-mono">{reg}</p>
        </div>
      </div>
    );
  }

  const eventDate = registration.event_date
    ? new Date(registration.event_date).toLocaleDateString('ar-BH', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  const qrData = JSON.stringify({
    regNum: registration.registration_number,
    name: registration.full_name,
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=000000&bgcolor=ffffff&margin=10`;

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
        ) : (
          <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">🏁</div>
            <h2 className="text-xl font-bold text-yellow-400">تسجيلك مقبول</h2>
            <p className="text-gray-300 text-sm mt-1">أحضر هذه البطاقة معك يوم الفعالية</p>
          </div>
        )}

        {/* Registration Number */}
        <div className="bg-black border border-gray-700 rounded-2xl p-5 text-center">
          <p className="text-gray-400 text-sm mb-2">رقم تسجيلك</p>
          <div className="text-2xl md:text-3xl font-black font-mono text-yellow-400 tracking-wider">
            {registration.registration_number}
          </div>
        </div>

        {/* QR Code */}
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
          <Row label="📍 الموقع" value={registration.location} />
        </div>

        {/* Note */}
        <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-4 text-sm text-center text-red-200">
          <strong>ملاحظة:</strong> احتفظ برقم التسجيل والـ QR Code معك يوم الفعالية للتحقق عند البوابة.
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

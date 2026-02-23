import { query } from '@/lib/db';
import AttendanceClient from './AttendanceClient';
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
        r.attendance_confirmed, r.attendance_confirmed_at,
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

  return (
    <AttendanceClient
      registration={registration}
      regNumber={reg}
      eventDate={eventDate}
      qrUrl={qrUrl}
    />
  );
}

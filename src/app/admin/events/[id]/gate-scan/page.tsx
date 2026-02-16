import GateScanClient from './GateScanClient';
import { requireEventCapability } from '@/lib/event-permissions';

export default async function EventGateScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    await requireEventCapability(id, 'gate_scan');
  } catch (e: any) {
    const message = String(e?.message || 'FORBIDDEN');

    if (message === 'NOT_AUTHENTICATED') {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">🚩 فحص البوابة</h1>
          <p className="text-gray-300">يلزم تسجيل الدخول.</p>
        </div>
      );
    }

    if (message === 'NO_EVENT_ACCESS' || message === 'FORBIDDEN') {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">🚩 فحص البوابة</h1>
          <p className="text-gray-300 mb-4">لا تملك صلاحية البوابة لهذه الفعالية.</p>
          <a
            href={`/admin/events/${id}/permissions`}
            className="inline-flex items-center justify-center px-5 py-3 rounded bg-yellow-500 text-black font-semibold"
          >
            إدارة صلاحيات الفريق داخل الفعالية
          </a>
        </div>
      );
    }

    throw e;
  }

  return <GateScanClient eventId={id} />;
}

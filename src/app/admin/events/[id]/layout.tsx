import Link from 'next/link';

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function EventAdminLayout({ children, params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="bg-gray-900/70 backdrop-blur border border-gray-800/80 rounded-2xl overflow-hidden h-fit shadow-xl">
            <div className="p-6 border-b border-gray-800/80">
              <div className="text-xs text-gray-400">لوحة تحكم الفعالية</div>
              <div className="text-2xl font-black tracking-tight">Event #{id}</div>
              <div className="mt-2 text-xs text-gray-500">إدارة داخل نطاق هذه الفعالية فقط</div>
            </div>

            <nav className="p-4 space-y-3">
              <MenuItem href={`/admin/events/${id}`} label="نظرة عامة" icon="📊" />
              <MenuItem href={`/admin/events/${id}/registrations`} label="المشاركون" icon="📋" />
              <MenuItem href={`/admin/events/${id}/rounds`} label="الجولات" icon="🏆" />
              <MenuItem href={`/admin/events/${id}/gate-scan`} label="فحص البوابة" icon="🚩" />
              <MenuItem href={`/admin/events/${id}/sponsors`} label="الرعاة" icon="🤝" />
              <MenuItem href={`/admin/events/${id}/permissions`} label="الصلاحيات" icon="👥" />
            </nav>
          </aside>

          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between bg-gray-950/40 hover:bg-gray-900/70 border border-gray-800/80 rounded-xl px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
    >
      <span className="font-bold text-gray-200">{label}</span>
      <span className="text-xl">{icon}</span>
    </Link>
  );
}

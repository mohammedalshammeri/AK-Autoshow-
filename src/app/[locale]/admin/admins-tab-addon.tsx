'use client';

interface AdminsTabProps {
  admins: any[];
  onCreateAdmin: () => void;
  onDeleteAdmin: (userId: string, userName: string) => void;
}

export function AdminsTab({
  admins,
  onCreateAdmin,
  onDeleteAdmin,
}: AdminsTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-400 border-b border-indigo-500 pb-2">
          👥 إدارة المستخدمين ({admins.length})
        </h2>
        <button
          onClick={onCreateAdmin}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-opacity shadow-lg"
        >
          ➕ إضافة مستخدم جديد
        </button>
      </div>
      {admins.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">👤</div>
          <p className="text-xl">لا يوجد مستخدمون إداريون</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="bg-gray-900 border border-gray-700 p-6 rounded-lg flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{admin.full_name || admin.email}</h3>
                <p className="text-gray-300 mb-1">📧 {admin.email}</p>
                <p className="text-indigo-400 text-sm">{admin.role === 'super_admin' ? 'مدير عام' : 'مدير'}</p>
              </div>
              <button
                onClick={() => onDeleteAdmin(admin.id, admin.full_name || admin.email)}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 text-white px-4 py-2 rounded text-sm transition-opacity shadow-md"
              >
                🗑️ حذف
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState, use } from 'react';
import { useRouter } from 'next/navigation';

type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  global_role?: string;
  event_role?: string | null;
};

const EVENT_ROLE_OPTIONS = [
  { value: 'event_admin', label: 'event_admin (مدير الفعالية)' },
  { value: 'approver', label: 'approver (قبول/رفض)' },
  { value: 'data_entry', label: 'data_entry (تعديل/إدخال بيانات)' },
  { value: 'gate', label: 'gate (البوابة/QR)' },
  { value: 'viewer', label: 'viewer (عرض فقط)' },
] as const;

export default function EventPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: eventId } = use(params);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<(typeof EVENT_ROLE_OPTIONS)[number]['value']>('approver');

  const activeUsers = useMemo(() => users.filter(u => u.is_active), [users]);
  const assignedUsers = useMemo(() => activeUsers.filter(u => !!u.event_role), [activeUsers]);
  const unassignedUsers = useMemo(() => activeUsers.filter(u => !u.event_role), [activeUsers]);

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

        const res = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}/staff`, {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        });

        const data = await res.json();
        if (!res.ok || !data?.success) {
          setError(data?.error || 'Failed to load users');
          setUsers([]);
          return;
        }

        setUsers(Array.isArray(data.users) ? data.users : []);
        setError('');
      } catch (e: any) {
        setError(e?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [router, eventId]);

  const assignUser = async () => {
    if (!selectedUserId) return;
    setSavingUserId(selectedUserId);
    setError('');
    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}/staff`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUserId: selectedUserId, eventRole: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Failed to assign user');
        return;
      }

      setUsers(prev => prev.map(u => (u.id === selectedUserId ? { ...u, event_role: selectedRole } : u)));
      setSelectedUserId('');
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setSavingUserId(null);
    }
  };

  const updateEventRole = async (userId: string, eventRole: string) => {
    setSavingUserId(userId);
    setError('');
    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}/staff`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUserId: userId, eventRole }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Failed to update role');
        return;
      }

      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, event_role: eventRole } : u)));
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setSavingUserId(null);
    }
  };

  const removeUser = async (userId: string) => {
    setSavingUserId(userId);
    setError('');
    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}/staff`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUserId: userId }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Failed to remove user');
        return;
      }

      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, event_role: null } : u)));
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setSavingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mr-3" />
        جاري تحميل الصلاحيات...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h1 className="text-2xl font-black">👥 الصلاحيات</h1>
        <p className="text-gray-400 mt-1">هنا تحدد من هم فريق هذه الفعالية وما هو دور كل شخص داخلها (قبول/رفض، إدخال بيانات، بوابة...). لا نغيّر أدوار النظام العامة من هنا.</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-2xl p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
        <div className="font-bold text-gray-200 mb-4">إضافة شخص لفريق الفعالية</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="bg-gray-950 text-white border border-gray-800 rounded-xl px-3 py-3 outline-none focus:border-red-600"
          >
            <option value="">اختر مستخدم...</option>
            {unassignedUsers.map(u => (
              <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="bg-gray-950 text-white border border-gray-800 rounded-xl px-3 py-3 outline-none focus:border-red-600"
          >
            {EVENT_ROLE_OPTIONS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <button
            onClick={assignUser}
            disabled={!selectedUserId || savingUserId === selectedUserId}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-3 font-bold transition disabled:opacity-50"
          >
            {savingUserId === selectedUserId ? 'جاري الإضافة...' : 'إضافة'}
          </button>
        </div>
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="font-bold text-gray-200">فريق الفعالية</div>
          <div className="text-sm text-gray-400">{assignedUsers.length} عضو</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right" style={{ minWidth: '900px' }}>
            <thead className="bg-gray-950/60">
              <tr className="text-gray-400 text-sm border-b border-gray-800">
                <th className="p-4">الاسم</th>
                <th className="p-4">البريد</th>
                <th className="p-4">الدور داخل الفعالية</th>
                <th className="p-4">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {assignedUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-800/30 transition">
                  <td className="p-4 text-white font-medium">{u.full_name || '-'}</td>
                  <td className="p-4 text-gray-300" dir="ltr">{u.email}</td>
                  <td className="p-4">
                    <select
                      value={String(u.event_role || 'viewer')}
                      disabled={savingUserId === u.id}
                      onChange={(e) => updateEventRole(u.id, e.target.value)}
                      className="bg-gray-950 text-white border border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-red-600 disabled:opacity-50"
                    >
                      {EVENT_ROLE_OPTIONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => removeUser(u.id)}
                      disabled={savingUserId === u.id}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-bold transition disabled:opacity-50"
                    >
                      {savingUserId === u.id ? '...' : 'إزالة'}
                    </button>
                  </td>
                </tr>
              ))}
              {assignedUsers.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-gray-500" colSpan={4}>لا يوجد مستخدمون</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

function getRoleBadge(role: string) {
  const r = (role || '').toLowerCase();
  if (r === 'super_admin') return { label: '🔴 مدير عام', className: 'bg-red-900/50 text-red-400' };
  if (r === 'admin') return { label: '🔵 مدير', className: 'bg-blue-900/50 text-blue-400' };
  if (r === 'management') return { label: '🟡 إدارة/اعتماد', className: 'bg-yellow-900/40 text-yellow-300' };
  if (r === 'organizer') return { label: '🟢 منظم/بوابة', className: 'bg-green-900/40 text-green-300' };
  if (r === 'data_entry') return { label: '🟣 إدخال بيانات', className: 'bg-purple-900/40 text-purple-300' };
  if (r === 'moderator') return { label: '🟠 مشرف', className: 'bg-orange-900/40 text-orange-300' };
  return { label: '⚪ مشاهدة فقط', className: 'bg-gray-900/50 text-gray-400' };
}

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/check', {
          credentials: 'include'
        });

        if (!response.ok) {
          router.replace('/admin/login');
          return;
        }

        const data = await response.json();
        if (!data.authenticated) {
          router.replace('/admin/login');
          return;
        }

        // Load users
        await loadUsers();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      setError('Network error loading users');
    } finally {
      setLoading(false);
    }
  };
  const handleBackToDashboard = () => {
    router.push('/admin/dashboard');
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          isActive: !currentStatus
        }),
      });

      if (response.ok) {
        await loadUsers(); // Reload users
        alert(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم بنجاح`);
      } else {
        alert('حدث خطأ في تحديث حالة المستخدم');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('حدث خطأ في الاتصال');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">جاري تحميل المستخدمين...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">👥 إدارة المستخدمين</h1>
            <p className="text-gray-400">إدارة المستخدمين الإداريين والأدوار والصلاحيات</p>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← العودة للوحة الرئيسية
            </button>
            <button
              onClick={() => router.push('/admin/users/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + إضافة مستخدم جديد
            </button>
          </div>
        </div>        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">👨‍💼 المستخدمون الإداريون</h2>
          </div>
          
          {users.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">👥</div>
              <div className="text-gray-400 text-lg">لا توجد مستخدمين</div>
              <p className="text-gray-500 mt-2">لا يوجد حالياً أي مستخدمين إداريين في النظام.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="text-right p-4 text-gray-300 font-medium">البريد الإلكتروني</th>
                    <th className="text-right p-4 text-gray-300 font-medium">الاسم</th>
                    <th className="text-right p-4 text-gray-300 font-medium">الدور</th>
                    <th className="text-right p-4 text-gray-300 font-medium">الحالة</th>
                    <th className="text-right p-4 text-gray-300 font-medium">آخر دخول</th>
                    <th className="text-right p-4 text-gray-300 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 text-white text-right">{user.email}</td>
                      <td className="p-4 text-gray-300 text-right">{user.full_name}</td>
                      <td className="p-4 text-right">
                        {(() => {
                          const badge = getRoleBadge(user.role);
                          return (
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>{/* keep <tr> children element-only */}<td className="p-4 text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-900/50 text-green-400' 
                            : 'bg-red-900/50 text-red-400'
                        }`}>
                          {user.is_active ? '✅ نشط' : '❌ غير نشط'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 text-right">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString('ar-BH') 
                          : 'لم يدخل مطلقاً'
                        }
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center space-x-2 space-x-reverse justify-end">
                          <button 
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className="text-blue-400 hover:text-blue-300 text-sm bg-blue-900/30 px-2 py-1 rounded"
                          >
                            ✏️ تعديل
                          </button>
                          <button 
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                            className={`text-sm px-2 py-1 rounded ${
                              user.is_active 
                                ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-900/30' 
                                : 'text-green-400 hover:text-green-300 bg-green-900/30'
                            }`}
                          >
                            {user.is_active ? '⏸️ إيقاف' : '▶️ تفعيل'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
                <p className="text-white text-2xl font-bold">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-gray-400 text-sm">مستخدمين نشطين</p>
                <p className="text-white text-2xl font-bold">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <div className="flex items-center justify-between flex-row-reverse">              <div>
                <p className="text-gray-400 text-sm">مديرين عامين</p>
                <p className="text-white text-2xl font-bold">
                  {users.filter(u => u.role === 'super_admin').length}
                </p>
              </div>
              <div className="p-3 bg-red-600/20 rounded-lg">
                <span className="text-2xl">🔴</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSponsorRequests, updateSponsorRequestStatus, getSponsorStats } from '@/actions/sponsor-actions';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  permissions: any;
}

interface SponsorRequest {
  id: string;
  name: string;
  phone: string;
  package_tier: string;
  company_name: string;
  email: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authCheckDone, setAuthCheckDone] = useState(false);
  
  // Sponsors State
  const [requests, setRequests] = useState<SponsorRequest[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    // Prevent multiple auth checks
    if (authCheckDone) return;
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/check', {
          credentials: 'include',
          cache: 'no-cache'
        });

        if (!response.ok) {
          setLoading(false);
          window.location.replace('/admin/login');
          return;
        }

        const data = await response.json();
        
        if (data.authenticated && data.user) {
          setUser(data.user);
          setLoading(false);
          setAuthCheckDone(true);
          
          // Fetch Sponsor Data
          fetchSponsorData();
        } else {
          setLoading(false);
          window.location.replace('/admin/login');
        }
      } catch (error) {
        setLoading(false);
        window.location.replace('/admin/login');
      }
    };

    checkAuth();
  }, [authCheckDone]);

  const fetchSponsorData = async () => {
    const listRes = await getSponsorRequests();
    if (listRes.success && listRes.data) {
        setRequests(listRes.data);
    }
    const statsRes = await getSponsorStats();
    if (statsRes) {
        setStats(statsRes);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
      if(!confirm(status === 'approved' ? 'Are you sure you want to approve this sponsor?' : 'Are you sure you want to reject this sponsor?')) return;
      
      const result = await updateSponsorRequestStatus(id, status);
      if(result.success) {
          fetchSponsorData();
      } else {
          alert('Failed to update status');
      }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      window.location.replace('/admin/login');
    }
  };

  const handleUserManagement = () => window.location.href = '/ar/admin';
  const handleCarManagement = () => window.location.href = '/ar/admin';
  const handleEventManagement = () => window.location.href = '/ar/admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">إعادة توجيه لصفحة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-800/60 backdrop-blur-sm border-b border-gray-700" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                🏎️ <span className="text-red-500">لوحة إدارة</span> معرض السيارات
              </h1>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-4">
              <span className="text-gray-300">
                مرحباً، {user?.full_name || user?.email}
              </span>
              <span className="px-3 py-1 bg-red-600 text-white text-xs rounded-full">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Arabic Title */}
        <div className="mb-8 text-right" dir="rtl">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏎️ لوحة إدارة معرض السيارات
          </h1>
          <p className="text-gray-300 text-lg">
            مرحباً بك في نظام إدارة المعرض - جميع الأنظمة تعمل بشكل مثالي
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8" dir="rtl">
          {/* Pending Requests */}
          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-6 text-center border-2 border-yellow-500">
            <div className="text-4xl font-bold text-white mb-2">{stats.pending}</div>
            <div className="text-yellow-100 text-sm font-medium">طلبات معلقة</div>
          </div>

          {/* Approved */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-center border-2 border-green-500">
            <div className="text-4xl font-bold text-white mb-2">{stats.approved}</div>
            <div className="text-green-100 text-sm font-medium">موافق عليها</div>
          </div>

          {/* Rejected */}
          <div className="bg-gradient-to-br from-red-600 to-rose-600 rounded-xl p-6 text-center border-2 border-red-500">
            <div className="text-4xl font-bold text-white mb-2">{stats.rejected}</div>
            <div className="text-red-100 text-sm font-medium">مرفوضة</div>
          </div>

          {/* Total Modifications (Static for now) */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-center border-2 border-blue-500">
            <div className="text-4xl font-bold text-white mb-2">48</div>
            <div className="text-blue-100 text-sm font-medium">إجمالي التعديلات</div>
          </div>

          {/* Events (Static for now) */}
          <div className="bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl p-6 text-center border-2 border-purple-500">
            <div className="text-4xl font-bold text-white mb-2">3</div>
            <div className="text-purple-100 text-sm font-medium">الفعاليات</div>
          </div>
        </div>

        {/* Pending Requests Section */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8" dir="rtl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-reverse space-x-3">
              <span className="text-2xl">📋</span>
              <h2 className="text-2xl font-bold text-white">الطلبات المعلقة ({pendingRequests.length})</h2>
            </div>
          </div>
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-400 text-xl">لا توجد طلبات معلقة</p>
              <p className="text-gray-500 text-sm mt-2">جميع الطلبات تمت معالجتها</p>
            </div>
          ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-right text-gray-300">
                    <thead className="bg-gray-700/50 text-gray-100">
                        <tr>
                            <th className="p-3">الاسم</th>
                            <th className="p-3">الشركة</th>
                            <th className="p-3">رقم الهاتف</th>
                            <th className="p-3">الباقة</th>
                            <th className="p-3">التاريخ</th>
                            <th className="p-3 text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingRequests.map((req) => (
                            <tr key={req.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                                <td className="p-3 font-medium text-white">{req.name}</td>
                                <td className="p-3">{req.company_name || '-'}</td>
                                <td className="p-3" dir="ltr">{req.phone}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        req.package_tier === 'Diamond' ? 'bg-cyan-900 text-cyan-200' :
                                        req.package_tier === 'Gold' ? 'bg-yellow-900 text-yellow-200' :
                                        'bg-gray-600 text-gray-200'
                                    }`}>
                                        {req.package_tier}
                                    </span>
                                </td>
                                <td className="p-3 text-sm text-gray-400">
                                    {new Date(req.created_at).toLocaleDateString('ar-BH')}
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => handleStatusUpdate(req.id, 'approved')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                        >
                                            قبول
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                        >
                                            رفض
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          )}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-center mb-4">
              <span className="text-4xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4 text-center">إدارة المستخدمين</h3>
            <p className="text-gray-300 mb-4 text-center">إدارة المستخدمين والأدوار والصلاحيات</p>
            <button 
              onClick={handleUserManagement}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
              إدارة المستخدمين
            </button>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-center mb-4">
              <span className="text-4xl">🚗</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4 text-center">إدارة السيارات</h3>
            <p className="text-gray-300 mb-4 text-center">إضافة وتعديل وإدارة قوائم السيارات</p>
            <button 
              onClick={handleCarManagement}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
              إدارة السيارات
            </button>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-center mb-4">
              <span className="text-4xl">🎪</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4 text-center">إدارة الفعاليات</h3>
            <p className="text-gray-300 mb-4 text-center">إنشاء وإدارة فعاليات ومعارض السيارات</p>
            <button 
              onClick={handleEventManagement}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
              إدارة الفعاليات
            </button>
          </div>
        </div>        {/* Additional Tools */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6" dir="rtl">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-center mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4 text-center">بيانات تجريبية</h3>
            <p className="text-gray-300 mb-4 text-center">إدخال بيانات تجريبية لاختبار النظام</p>
            <button 
              onClick={() => router.push('/admin/test-data')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
              إضافة بيانات تجريبية
            </button>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-center mb-4">
              <span className="text-4xl">🔄</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4 text-center">تحديث النظام</h3>
            <p className="text-gray-300 mb-4 text-center">إعادة تحميل وتحديث البيانات</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
              تحديث الصفحة
            </button>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-center mb-4">
              <span className="text-4xl">⚙️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4 text-center">إعدادات النظام</h3>
            <p className="text-gray-300 mb-4 text-center">تكوين إعدادات النظام والتفضيلات</p>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
              الإعدادات
            </button>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-center mb-4">
              <span className="text-4xl">🚪</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4 text-center">تسجيل الخروج</h3>
            <p className="text-gray-300 mb-4 text-center">إنهاء الجلسة والخروج من النظام</p>
            <button 
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
              تسجيل الخروج
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

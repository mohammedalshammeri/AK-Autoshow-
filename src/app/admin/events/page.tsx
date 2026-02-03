'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  name: string;
  title?: string; // For compatibility
  description: string;
  event_date: string;
  start_date?: string;
  end_date?: string;
  location: string;
  status: string;
  created_at: string;
}

export default function EventManagement() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
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

        // Load events
        await loadEvents();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/admin/login');
      }
    };

    checkAuth();
  }, [router]);
  // Force complete reload with cache bust
  const loadEvents = async (bustCache = false) => {
    try {
      console.log('📊 Loading events...');
      setLoading(true);
      
      // Add cache busting parameter
      const url = bustCache 
        ? `/api/admin/events?t=${Date.now()}` 
        : '/api/admin/events';
        
      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store', // Force fresh data
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Loaded events:', data.events?.length || 0, 'events');
        setEvents(data.events || []);
        setError(''); // Clear any previous errors
      } else {
        console.error('❌ Failed to load events, status:', response.status);
        setError('Failed to load events');
      }
    } catch (error) {
      console.error('❌ Network error loading events:', error);
      setError('Network error loading events');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/admin/dashboard');
  };
  const handleEventAction = async (eventId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/events/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          eventId,
          action
        }),
      });

      if (response.ok) {
        await loadEvents(); // Reload events
        alert(`تم ${action === 'activate' ? 'تفعيل' : action === 'deactivate' ? 'إلغاء تفعيل' : 'حذف'} الفعالية بنجاح`);
      } else {
        alert('حدث خطأ في تنفيذ العملية');
      }
    } catch (error) {
      console.error('Error performing event action:', error);
      alert('حدث خطأ في الاتصال');
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    const confirmed = confirm(`هل أنت متأكد من حذف الفعالية "${eventTitle}"؟\n\nهذا الإجراء لا يمكن التراجع عنه!`);
    
    if (confirmed) {
      try {
        const response = await fetch('/api/admin/events/action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            eventId,
            action: 'delete'
          }),
        });        console.log('Delete response status:', response.status);
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('Delete response data:', responseData);
          
          // Force complete reload with cache busting
          setLoading(true);
          
          // Add cache busting to force fresh data
          const refreshResponse = await fetch(`/api/admin/events?t=${Date.now()}`, {
            credentials: 'include',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            console.log('🔄 Refreshed events after delete:', refreshData.events?.length || 0, 'events');
            setEvents(refreshData.events || []);
          }
          
          setLoading(false);
          // Check if it was hard delete or soft delete
          if (responseData.verified?.includes('completely deleted')) {
            alert(`تم حذف الفعالية "${eventTitle}" نهائياً من قاعدة البيانات! 🗑️`);
          } else {
            alert(`تم حذف الفعالية "${eventTitle}" بنجاح! 🗑️`);
          }
        } else {
          const errorData = await response.json();
          console.error('Delete error:', errorData);
          alert(`حدث خطأ في حذف الفعالية: ${errorData.error || 'خطأ غير معروف'}`);
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('حدث خطأ في الاتصال أثناء حذف الفعالية');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">جاري تحميل الفعاليات...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🎪 إدارة الفعاليات</h1>
            <p className="text-gray-400">إنشاء وإدارة فعاليات معرض السيارات</p>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← العودة للوحة الرئيسية
            </button>
            <button
              onClick={() => router.push('/admin/events/create')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + إنشاء فعالية جديدة
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">🏁 فعاليات معرض السيارات</h2>
          </div>
          
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🎪</div>
              <div className="text-gray-400 text-lg">لا توجد فعاليات</div>
              <p className="text-gray-500 mt-2">لا توجد حالياً أي فعاليات في النظام. ابدأ بإنشاء فعالية جديدة!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="text-right p-4 text-gray-300 font-medium">اسم الفعالية</th>
                    <th className="text-right p-4 text-gray-300 font-medium">الموقع</th>
                    <th className="text-right p-4 text-gray-300 font-medium">تاريخ البداية</th>
                    <th className="text-right p-4 text-gray-300 font-medium">تاريخ النهاية</th>
                    <th className="text-right p-4 text-gray-300 font-medium">المشاركون</th>
                    <th className="text-right p-4 text-gray-300 font-medium">الحالة</th>
                    <th className="text-right p-4 text-gray-300 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-700/30 transition-colors">                      <td className="p-4 text-white text-right">
                        <div className="font-medium">{event.name}</div>
                        <div className="text-gray-400 text-sm line-clamp-2">{event.description}</div>
                      </td>
                      <td className="p-4 text-gray-300 text-right">{event.location}</td>
                      <td className="p-4 text-gray-300 text-right">
                        {new Date(event.event_date).toLocaleDateString('ar-BH')}
                      </td>
                      <td className="p-4 text-gray-300 text-right">
                        {new Date(event.event_date).toLocaleDateString('ar-BH')}
                      </td>
                      <td className="p-4 text-gray-300 text-right">
                        <div className="text-sm">
                          <span className="font-medium">0</span>
                          <span className="text-gray-500"> / ∞</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          event.status === 'active' 
                            ? 'bg-green-900/50 text-green-400' 
                            : event.status === 'upcoming'
                            ? 'bg-blue-900/50 text-blue-400'
                            : event.status === 'completed'
                            ? 'bg-gray-900/50 text-gray-400'
                            : 'bg-red-900/50 text-red-400'
                        }`}>
                          {event.status === 'active' ? '🟢 نشطة' 
                           : event.status === 'upcoming' ? '🔵 قادمة'
                           : event.status === 'completed' ? '⚪ منتهية'
                           : '🔴 ملغية'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center space-x-2 space-x-reverse justify-end">
                          <button 
                            onClick={() => router.push(`/admin/events/${event.id}`)}
                            className="text-blue-400 hover:text-blue-300 text-sm bg-blue-900/30 px-2 py-1 rounded"
                          >
                            👁️ عرض
                          </button>
                          <button 
                            onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                            className="text-yellow-400 hover:text-yellow-300 text-sm bg-yellow-900/30 px-2 py-1 rounded"
                          >
                            ✏️ تعديل
                          </button>                          {event.status === 'active' ? (
                            <button 
                              onClick={() => handleEventAction(event.id, 'deactivate')}
                              className="text-orange-400 hover:text-orange-300 text-sm bg-orange-900/30 px-2 py-1 rounded"
                            >
                              ⏸️ إيقاف
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleEventAction(event.id, 'activate')}
                              className="text-green-400 hover:text-green-300 text-sm bg-green-900/30 px-2 py-1 rounded"
                            >
                              ▶️ تفعيل
                            </button>
                          )}                          <button 
                            onClick={() => handleDeleteEvent(event.id, event.name)}
                            className="text-red-400 hover:text-red-300 text-sm bg-red-900/30 px-2 py-1 rounded"
                          >
                            🗑️ حذف
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-gray-400 text-sm">إجمالي الفعاليات</p>
                <p className="text-white text-2xl font-bold">{events.length}</p>
              </div>
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <span className="text-2xl">🎪</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-gray-400 text-sm">فعاليات نشطة</p>
                <p className="text-white text-2xl font-bold">
                  {events.filter(e => e.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-lg">
                <span className="text-2xl">🟢</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-gray-400 text-sm">فعاليات قادمة</p>
                <p className="text-white text-2xl font-bold">
                  {events.filter(e => e.status === 'upcoming').length}
                </p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <span className="text-2xl">🔵</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-gray-400 text-sm">فعاليات منتهية</p>
                <p className="text-white text-2xl font-bold">
                  {events.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-gray-600/20 rounded-lg">
                <span className="text-2xl">⚪</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

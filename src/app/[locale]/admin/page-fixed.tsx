'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { SponsorsTab, SponsorForm } from './../admin/sponsors-tab-addon';

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  car_make: string;
  car_model: string;
  car_year: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  event_id?: number;
  registration_number?: string;
  car_images?: Array<{
    id: number;
    image_url: string;
  }>;
}

interface Event {
  id: number;
  name: string;
  event_date: string;
  location: string;
  description?: string;
  created_at: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'events' | 'admins' | 'gate' | 'sponsors'>('pending');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  
  // Sponsors states
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<any>(null);
  
  // Gate verification states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadRegistrations();
      loadEvents();
      loadAdmins();
      loadSponsors();
    }
    setLoading(false);
  };

  const loadRegistrations = async () => {
    console.log('🔍 بدء جلب البيانات بالطريقة الجديدة...');
    setLoading(true);
    
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        car_images (
          id,
          image_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ خطأ فادح في جلب البيانات المترابطة:', error);
      alert('Failed to load data: ' + error.message);
      setLoading(false);
      return;
    }

    console.log('✅ تم جلب', data?.length, 'تسجيل مع صورهم في خطوة واحدة.');
    
    if (data && data.length > 0) {
        console.log('🔍 مثال على البيانات المستلمة (التسجيل الأول):', data[0]);
        console.log('📸 الصور المرتبطة به:', data[0].car_images);
    }

    setRegistrations(data || []);
    setLoading(false);
    console.log('🎉 تم تحميل جميع التسجيلات بنجاح.');
  };

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('❌ خطأ في جلب الأحداث:', error);
      return;
    }

    setEvents(data || []);
    console.log('✅ تم جلب الأحداث:', data?.length);
  };

  const loadAdmins = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setAdmins(result.users || []);
        console.log('✅ تم جلب المستخدمين:', result.users?.length);
      } else {
        console.error('❌ خطأ في جلب المستخدمين:', result.error);
      }
    } catch (error) {
      console.error('❌ خطأ في الاتصال:', error);
    }
  };

  const loadSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors', {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setSponsors(result.sponsors || []);
        console.log('✅ تم جلب الرعاة:', result.sponsors?.length);
      } else {
        console.error('❌ خطأ في جلب الرعاة:', result.error);
      }
    } catch (error) {
      console.error('❌ خطأ في الاتصال:', error);
    }
  };

  const handleCreateSponsor = async (sponsorData: any) => {
    try {
      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(sponsorData),
      });

      const result = await response.json();

      if (result.success) {
        await loadSponsors();
        setShowSponsorForm(false);
        setEditingSponsor(null);
        alert('تم إضافة الراعي بنجاح!');
      } else {
        alert(`خطأ في إضافة الراعي: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ خطأ في إضافة الراعي:', error);
      alert('حدث خطأ في إضافة الراعي');
    }
  };

  const handleUpdateSponsor = async (sponsorId: number, sponsorData: any) => {
    try {
      const response = await fetch('/api/sponsors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: sponsorId, ...sponsorData }),
      });

      const result = await response.json();

      if (result.success) {
        await loadSponsors();
        setShowSponsorForm(false);
        setEditingSponsor(null);
        alert('تم تحديث الراعي بنجاح!');
      } else {
        alert(`خطأ في تحديث الراعي: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث الراعي:', error);
      alert('حدث خطأ في تحديث الراعي');
    }
  };

  const handleDeleteSponsor = async (sponsorId: number, sponsorName: string) => {
    const confirmed = confirm(`هل أنت متأكد من حذف الراعي "${sponsorName}"؟\n\nهذا الإجراء لا يمكن التراجع عنه!`);
    
    if (confirmed) {
      try {
        const response = await fetch('/api/sponsors', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ id: sponsorId }),
        });

        const result = await response.json();

        if (result.success) {
          await loadSponsors();
          alert(`تم حذف الراعي "${sponsorName}" بنجاح!`);
        } else {
          alert(`خطأ في حذف الراعي: ${result.error}`);
        }
      } catch (error) {
        console.error('❌ خطأ في حذف الراعي:', error);
        alert('حدث خطأ في حذف الراعي');
      }
    }
  };

  // Admin user management
  const handleCreateAdmin = async (adminData: any) => {
    try {
      // تشفير البيانات بشكل صحيح للنصوص العربية
      const sanitizedData = {
        email: adminData.email.trim(),
        password: adminData.password,
        role: adminData.role || 'admin',
        full_name: adminData.full_name.trim()
      };

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        credentials: 'include',
        body: JSON.stringify(sanitizedData),
      });

      const result = await response.json();

      if (result.success) {
        await loadAdmins();
        setShowAdminForm(false);
        alert('تم إضافة المستخدم بنجاح!');
      } else {
        alert(`خطأ في إضافة المستخدم: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ خطأ في إضافة المستخدم:', error);
      alert('حدث خطأ في إضافة المستخدم');
    }
  };

  const handleDeleteAdmin = async (userId: string, userEmail: string) => {
    const confirmed = confirm(`هل أنت متأكد من حذف المستخدم "${userEmail}"؟`);
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/users?id=${userId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const result = await response.json();

        if (result.success) {
          await loadAdmins();
          alert(`تم حذف المستخدم "${userEmail}" بنجاح!`);
        } else {
          alert(`خطأ في حذف المستخدم: ${result.error}`);
        }
      } catch (error) {
        console.error('❌ خطأ في حذف المستخدم:', error);
        alert('حدث خطأ في حذف المستخدم');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('خطأ في تسجيل الدخول: ' + error.message);
    } else if (data.user) {
      setUser(data.user);
      loadRegistrations();
      loadEvents();
      loadAdmins();
      loadSponsors();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRegistrations([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-[2px]">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-center mb-6">              <img 
                src="/ak-autoshow-logo-new.png" 
                alt="AK Autoshow" 
                className="h-20 w-auto mx-auto mb-4 object-contain"
              />
              <h1 className="text-xl font-bold text-white">
                لوحة إدارة المعرض
              </h1>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-yellow-500 focus:outline-none"
                required
              />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-yellow-500 focus:outline-none"
                required
              />
              <button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white rounded font-semibold hover:opacity-90 transition-opacity"
              >
                تسجيل الدخول
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const pending = registrations.filter(r => r.status === 'pending');
  const approved = registrations.filter(r => r.status === 'approved');
  const rejected = registrations.filter(r => r.status === 'rejected');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-[2px]">
        <div className="bg-gray-900 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">              <img                src="/ak-autoshow-logo-new.png" 
                alt="AK Autoshow" 
                className="h-16 w-auto object-contain"
              />
              <h1 className="text-2xl font-bold text-white">
                لوحة إدارة المعرض
              </h1>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white px-6 py-2 rounded transition-opacity"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-xl text-center shadow-lg">
            <h3 className="text-3xl font-bold text-white">{pending.length}</h3>
            <p className="text-white/90">طلبات معلقة</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-6 rounded-xl text-center shadow-lg">
            <h3 className="text-3xl font-bold text-white">{approved.length}</h3>
            <p className="text-white/90">طلبات موافق عليها</p>
          </div>
          <div className="bg-gradient-to-br from-red-400 to-pink-600 p-6 rounded-xl text-center shadow-lg">
            <h3 className="text-3xl font-bold text-white">{rejected.length}</h3>
            <p className="text-white/90">طلبات مرفوضة</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-cyan-600 p-6 rounded-xl text-center shadow-lg">
            <h3 className="text-3xl font-bold text-white">{registrations.length}</h3>
            <p className="text-white/90">إجمالي التسجيلات</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-pink-600 p-6 rounded-xl text-center shadow-lg">
            <h3 className="text-3xl font-bold text-white">{events.length}</h3>
            <p className="text-white/90">الفعاليات</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-400 to-purple-600 p-6 rounded-xl text-center shadow-lg">
            <h3 className="text-3xl font-bold text-white">{admins.length}</h3>
            <p className="text-white/90">المستخدمين</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-red-600 p-6 rounded-xl text-center shadow-lg">
            <h3 className="text-3xl font-bold text-white">{sponsors.length}</h3>
            <p className="text-white/90">الرعاة</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'pending' 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg transform scale-105' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            📋 معلقة ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'approved' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            ✅ موافق عليها ({approved.length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'rejected' 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg transform scale-105' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            ❌ مرفوضة ({rejected.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'events' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🎉 إدارة الفعاليات ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'admins' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            👥 إدارة المستخدمين ({admins.length})
          </button>
          <button
            onClick={() => setActiveTab('gate')}
            className={`px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'gate' 
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg transform scale-105' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🎫 بوابة التحقق ({approved.length})
          </button>
          <button
            onClick={() => setActiveTab('sponsors')}
            className={`px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'sponsors' 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🤝 إدارة الرعاة ({sponsors.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'sponsors' && (
            <SponsorsTab 
              sponsors={sponsors}
              onCreateSponsor={() => {setShowSponsorForm(true); setEditingSponsor(null);}}
              onEditSponsor={(sponsor: any) => {setEditingSponsor(sponsor); setShowSponsorForm(true);}}
              onDeleteSponsor={handleDeleteSponsor}
            />
          )}

          {activeTab === 'admins' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-400 border-b border-indigo-500 pb-2">
                  👥 إدارة المستخدمين ({admins.length})
                </h2>
                <button
                  onClick={() => setShowAdminForm(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white px-6 py-2 rounded-lg font-semibold transition-opacity shadow-lg"
                >
                  ➕ إضافة مستخدم جديد
                </button>
              </div>

              {admins.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-xl">لا يوجد مستخدمين إداريين</p>
                  <p className="text-gray-500 mt-2">ابدأ بإضافة مستخدم جديد</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {admins.map(admin => (
                    <div key={admin.id} className="bg-gray-900 border border-gray-700 hover:border-indigo-500 p-6 rounded-lg transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{admin.user_metadata?.full_name || 'غير محدد'}</h3>
                          <p className="text-indigo-400 mb-2">📧 {admin.email}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>الدور: {admin.user_metadata?.role || 'admin'}</span>
                            <span>تاريخ الإنشاء: {new Date(admin.created_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Other tabs would go here - for now just showing sponsors and admins tabs */}
          {!['sponsors', 'admins'].includes(activeTab) && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xl">تبويب {activeTab} قيد التطوير...</p>
            </div>
          )}
        </div>
      </div>

      {/* Sponsor Form Modal */}
      {showSponsorForm && (
        <SponsorForm
          sponsor={editingSponsor}
          onSubmit={editingSponsor ? 
            (data: any) => handleUpdateSponsor(editingSponsor.id, data) : 
            handleCreateSponsor
          }
          onCancel={() => { setShowSponsorForm(false); setEditingSponsor(null); }}
        />
      )}

      {/* Admin User Form Modal */}
      {showAdminForm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-indigo-500 rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-400">
                  ➕ إضافة مستخدم إداري جديد
                </h2>
                <button 
                  onClick={() => setShowAdminForm(false)}
                  className="text-gray-400 hover:text-white text-3xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  full_name: formData.get('full_name') as string,
                  email: formData.get('email') as string,
                  password: formData.get('password') as string,
                  role: formData.get('role') as string
                };
                handleCreateAdmin(data);
              }} className="space-y-6">
                
                <div>
                  <label className="block text-white font-semibold mb-2">الاسم الكامل *</label>
                  <input
                    type="text"
                    name="full_name"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-indigo-500 focus:outline-none"
                    required
                    placeholder="مثال: محمد أحمد"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-indigo-500 focus:outline-none"
                    required
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">كلمة المرور *</label>
                  <input
                    type="password"
                    name="password"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-indigo-500 focus:outline-none"
                    required
                    minLength={6}
                    placeholder="يجب أن تكون كلمة المرور 6 أحرف على الأقل"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">الصلاحية *</label>
                  <select
                    name="role"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-indigo-500 focus:outline-none"
                    required
                  >
                    <option value="admin">مدير</option>
                    <option value="super_admin">مدير عام</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white py-3 rounded-lg font-semibold transition-opacity"
                  >
                    ➕ إضافة المستخدم
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdminForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

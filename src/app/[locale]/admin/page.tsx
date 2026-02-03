'use client';

import { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { sendApprovalEmail, sendRejectionEmail } from '@/app/_actions';

// Layout Components
import { AdminShell } from '@/components/admin/layout/AdminShell';

// Tab Components
import { AdminsTab } from './admins-tab-addon';
import { RegistrationsTab } from './registrations-tab-addon';
import { StatisticsTab } from './statistics-tab-addon';
import { GateVerificationTab } from './gate-verification-tab-addon';
import { EventsTab, EventForm, Event } from './events-tab-addon';
import { SponsorsTab, SponsorForm } from './sponsors-tab-addon';
import { GalleryTab, GalleryForm } from './gallery-tab-addon';
import { ProductsTab, ProductForm } from './products-tab-addon';
import { OrdersTab } from './orders-tab-addon';
import { RegistrationDetailsModal } from './registration-details-modal';

import * as XLSX from 'xlsx';

// Interface definitions
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
  group_name?: string;
  registration_type?: 'individual' | 'group';
  car_count?: number;
  car_images?: Array<{
    id: number;
    image_url: string;
  }>;
}

export default function AdminPage() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'events'
    | 'admins'
    | 'gate'
    | 'sponsors'
    | 'gallery'
    | 'products'
    | 'orders'
    | 'statistics'
  >('pending');

  // Data States
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // UI States
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const [showAdminForm, setShowAdminForm] = useState(false);
  
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<any>(null);
  
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGalleryImage, setEditingGalleryImage] = useState<any>(null);
  
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  // Search State for Gate
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedGateParticipant, setSelectedGateParticipant] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // --- Initial Load ---
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await fetch('/api/admin/auth/check');
      const data = await res.json();
      
      if (data.authenticated && data.user) {
        setUser(data.user as any);
        await Promise.all([
          loadRegistrations(),
          loadEvents(),
          loadAdmins(),
          loadSponsors(),
          loadGallery(),
          loadProducts(),
          loadOrders()
        ]);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    }
    setLoading(false);
  };

  // --- Auth Handlers ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe: true }),
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('Invalid JSON response:', text);
        alert('Server Error: ' + text.substring(0, 100) + '...');
        return;
      }

      if (!data.success) {
        alert('خطأ في تسجيل الدخول: ' + (data.error || 'Unknown error'));
      } else if (data.user) {
        setUser(data.user as any);
        await Promise.all([
          // loadRegistrations(),
          // loadEvents(),
          loadAdmins(),
          // loadSponsors(),
          // loadGallery(),
          // loadProducts(),
          // loadOrders()
        ]);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setRegistrations([]);
    setEvents([]);
    window.location.reload(); // Refresh to clean state
  };

  // --- Data Loading Functions ---
  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/registrations');
      const result = await res.json();
      if (result.success) {
        setRegistrations(result.registrations || []);
      } else {
        console.error('Error loading registrations:', result.error);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    }
    setLoading(false);
  };

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      const result = await res.json();
      if (result.success) {
        setEvents((result.events as Event[]) || []);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json();
      if (result.success) setAdmins(result.users || []);
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const loadSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors');
      const result = await response.json();
      if (result.success) setSponsors(result.sponsors || []);
    } catch (error) {
      console.error('Error loading sponsors:', error);
    }
  };

  const loadGallery = async () => {
    try {
      const response = await fetch('/api/admin/gallery');
      const result = await response.json();
      if (result.success) setGalleryImages(result.images || []);
    } catch (error) {
      console.error('Error loading gallery:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      if (result.success) setProducts(result.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch('/api/orders');
      const result = await response.json();
      if (result.success) setOrders(result.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // --- Action Handlers ---

  // Registration Actions
  const updateStatus = async (regId: string, newStatus: 'approved' | 'rejected') => {
    const confirmationMessage = newStatus === 'approved' 
      ? 'هل أنت متأكد من قبول هذا الطلب؟' 
      : 'هل أنت متأكد من رفض هذا الطلب؟';
      
    if (!confirm(confirmationMessage)) return;

    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: regId, status: newStatus })
      });
      const result = await res.json();
      
      if (!result.success) throw new Error(result.error);
      
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: newStatus } : r));
      alert(`تم ${newStatus === 'approved' ? 'قبول' : 'رفض'} الطلب بنجاح!`);
      
      const reg = registrations.find(r => r.id === regId);
      if (reg) {
        if (newStatus === 'approved') {
           console.log('📧 Sending Approval Email via Server Action...');
           try {
              const emailResult = await sendApprovalEmail({
                registrationId: reg.id,
                participantEmail: reg.email,
                participantName: reg.full_name,
                registrationNumber: reg.registration_number || `AKA-${reg.id.substring(0,6)}`,
                eventId: reg.event_id || 0
              });
              if (emailResult.success) {
                console.log('✅ Email sent successfully');
                alert('تم إرسال إيميل الموافقة بنجاح');
              } else {
                console.error('❌ Email failed:', emailResult.error);
                alert('تنبيه: تم قبول الطلب ولكن فشل إرسال الإيميل: ' + emailResult.error);
              }
           } catch (emailErr) {
             console.error('❌ Email Exception:', emailErr);
             alert('تنبيه: تم قبول الطلب ولكن حدث خطأ مفاجئ أثناء إرسال الإيميل');
           }
        } else {
           console.log('📧 Sending Rejection Email via Server Action...');
           await sendRejectionEmail({
             participantEmail: reg.email,
             participantName: reg.full_name,
             eventName: 'Godzilla Car Show'
           });
        }
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('حدث خطأ أثناء تحديث الحالة: ' + error.message);
      loadRegistrations();
    }
  };

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(registrations.map(r => ({
      'الاسم': r.full_name,
      'رقم الهاتف': r.phone_number,
      'البريد الإلكتروني': r.email,
      'نوع السيارة': r.car_make,
      'الموديل': r.car_model,
      'السنة': r.car_year,
      'الحالة': r.status,
      'تاريخ التسجيل': new Date(r.created_at).toLocaleDateString()
    })));
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, "registrations.xlsx");
  };

  // Event Actions
  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'created_at'>) => {
    const basicEventData = {
      name: eventData.name_ar || eventData.name_en || eventData.name || 'فعالية جديدة',
      event_date: eventData.event_date,
      location: eventData.location_ar || eventData.location_en || eventData.location || 'موقع غير محدد',
      description: eventData.description_ar || eventData.description_en || eventData.description || 'وصف غير متوفر',
      name_ar: eventData.name_ar,
      name_en: eventData.name_en,
      location_ar: eventData.location_ar,
      location_en: eventData.location_en,
      description_ar: eventData.description_ar,
      description_en: eventData.description_en
    };

    try {
      if (editingEvent) {
        const res = await fetch('/api/admin/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingEvent.id, ...basicEventData })
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error);
        alert('تم تحديث الفعالية بنجاح! ✅');
      } else {
        const res = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(basicEventData)
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error);
        alert('تم إنشاء الفعالية بنجاح! 🎉');
      }
      loadEvents();
      setShowEventForm(false);
      setEditingEvent(null);
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert('خطأ في حفظ الفعالية: ' + error.message);
    }
  };

  const handleDeleteEvent = async (eventId: number | string, eventName: string) => {
    if (!confirm(`هل أنت متأكد من حذف الفعالية "${eventName}"؟`)) return;
    try {
      const res = await fetch(`/api/admin/events?id=${eventId}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      
      setEvents(events.filter(e => String(e.id) !== String(eventId)));
      alert(`تم حذف الفعالية "${eventName}" بنجاح!`);
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert('خطأ في حذف الفعالية: ' + error.message);
      loadEvents();
    }
  };

  // Admin Actions
  const handleCreateAdmin = async (adminData: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData)
      });
      const result = await response.json();
      if (result.success) {
        loadAdmins();
        setShowAdminForm(false);
        alert('تم إضافة المسؤول بنجاح');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteAdmin = async (userId: string, userName: string) => {
    if (!confirm(`حذف المسؤول ${userName}؟`)) return;
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) loadAdmins();
      else throw new Error(result.error);
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Sponsor Actions
  const handleCreateSponsor = async (data: any) => {
    await genericApiAction('/api/sponsors', 'POST', data, loadSponsors, () => setShowSponsorForm(false));
  };
  const handleUpdateSponsor = async (id: number, data: any) => {
    await genericApiAction('/api/sponsors', 'PUT', { id, ...data }, loadSponsors, () => {
      setShowSponsorForm(false);
      setEditingSponsor(null);
    });
  };
  const handleDeleteSponsor = async (id: number, name: string) => {
    if(confirm(`حذف الراعي ${name}؟`)) 
      await genericApiAction('/api/sponsors', 'DELETE', { id }, loadSponsors);
  };

  // Gallery Actions
  const handleCreateGallery = async (data: any) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.displayOrder) formData.append('displayOrder', String(data.displayOrder));
    if (data.image) formData.append('image', data.image);

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        // Note: Do NOT set Content-Type header when sending FormData, 
        // the browser will automatically set it with the correct boundary
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        await loadGallery();
        setShowGalleryForm(false);
        alert('تمت العملية بنجاح');
      } else {
        alert('خطأ: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال');
    }
  };
  const handleUpdateGallery = async (id: number, data: any) => {
    await genericApiAction('/api/admin/gallery', 'PUT', data, loadGallery, () => {
      setShowGalleryForm(false);
      setEditingGalleryImage(null);
    });
  };
   // Correctly target the admin API for deletion
  const handleDeleteGalleryLike = (id: number) => genericApiAction('/api/admin/gallery', 'DELETE', { id }, loadGallery);

  // Gate/Search Logic
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.length >= 2) {
      setIsSearching(true);
      const lowerVal = val.toLowerCase();
      const results = registrations.filter(r => 
        r.status === 'approved' && (
          r.full_name.toLowerCase().includes(lowerVal) ||
          r.registration_number?.toLowerCase().includes(lowerVal) ||
          r.phone_number.includes(val) ||
          r.id.toLowerCase().includes(lowerVal)
        )
      );
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: 'pending' | 'processing' | 'completed' | 'cancelled') => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        await loadOrders();
        alert('تم تحديث حالة الطلب بنجاح');
      } else {
        alert(`خطأ: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('حدث خطأ في تحديث حالة الطلب');
    }
  };

  // Generic Helper
  const genericApiAction = async (endpoint: string, method: string, body: any, reload: () => void, onSuccess?: () => void) => {
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await res.json();
      if (result.success) {
        await reload();
        onSuccess?.();
        alert('تمت العملية بنجاح');
      } else {
        alert('خطأ: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال');
    }
  };

  // --- Rendering ---

  if (!user) {
    return (
      <div className="min-h-screen bg-[#111317] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">
              لوحة التحكم
            </h1>
            <p className="text-gray-400">سجل دخولك للمتابعة</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:opacity-90 transition-all"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered lists
  const pendingRegistrations = registrations.filter(r => r.status === 'pending');
  const approvedRegistrations = registrations.filter(r => r.status === 'approved');
  const rejectedRegistrations = registrations.filter(r => r.status === 'rejected');

  // Title Mapping
  const tabTitles: Record<string, string> = {
    pending: 'طلبات الانضمام (قيد الانتظار)',
    approved: 'طلبات الانضمام (المقبولة)',
    rejected: 'طلبات الانضمام (المرفوضة)',
    statistics: 'الإحصائيات والتقارير',
    events: 'إدارة الفعاليات',
    admins: 'إدارة المسؤولين',
    gate: 'بوابة التحقق',
    products: 'إدارة المنتجات',
    orders: 'إدارة الطلبات',
    sponsors: 'إدارة الرعاة',
    gallery: 'معرض الصور'
  };

  return (
    <AdminShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userEmail={user.email}
      onLogout={handleLogout}
      title={tabTitles[activeTab]}
      counts={{
        pending: pendingRegistrations.length,
        approved: approvedRegistrations.length,
        rejected: rejectedRegistrations.length,
        orders: orders.length
      }}
    >
      {/* Tab Content Routing */}
      {activeTab === 'statistics' && (
        <StatisticsTab 
          registrations={registrations} 
          sponsors={sponsors}
        />
      )}

      {activeTab === 'pending' && (
        <RegistrationsTab
          registrations={pendingRegistrations}
          tabType="pending"
          onSelectRegistration={setSelectedReg}
          onUpdateStatus={updateStatus}
        />
      )}

      {activeTab === 'approved' && (
        <RegistrationsTab
          registrations={approvedRegistrations}
          tabType="approved"
          onSelectRegistration={setSelectedReg}
          onUpdateStatus={updateStatus}
        />
      )}

      {activeTab === 'rejected' && (
        <RegistrationsTab
          registrations={rejectedRegistrations}
          tabType="rejected"
          onSelectRegistration={setSelectedReg}
          onUpdateStatus={updateStatus}
        />
      )}

      {activeTab === 'gate' && (
        <GateVerificationTab
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchResults={searchResults}
          selectedParticipant={selectedGateParticipant}
          isSearching={isSearching}
          onSelectParticipant={setSelectedGateParticipant}
          onClearSelection={() => setSelectedGateParticipant(null)}
        />
      )}

      {activeTab === 'events' && (
        <>
          <EventsTab
            events={events}
            onCreateEvent={() => { setEditingEvent(null); setShowEventForm(true); }}
            onEditEvent={(event) => { setEditingEvent(event); setShowEventForm(true); }}
            onDeleteEvent={handleDeleteEvent}
          />
          {showEventForm && (
            <EventForm
              event={editingEvent}
              onSubmit={handleCreateEvent}
              onCancel={() => { setShowEventForm(false); setEditingEvent(null); }}
            />
          )}
        </>
      )}

      {activeTab === 'admins' && (
        <AdminsTab
          admins={admins}
          onCreateAdmin={() => setShowAdminForm(true)}
          onDeleteAdmin={handleDeleteAdmin}
        />
      )}

      {/* Legacy/Addon Tabs */}
      {activeTab === 'sponsors' && (
        <>
          <SponsorsTab
            sponsors={sponsors}
            onCreateSponsor={() => { setEditingSponsor(null); setShowSponsorForm(true); }}
            onEditSponsor={(sponsor) => { setEditingSponsor(sponsor); setShowSponsorForm(true); }}
            onDeleteSponsor={handleDeleteSponsor}
          />
          {showSponsorForm && (
            <SponsorForm
              sponsor={editingSponsor}
              onSubmit={editingSponsor ? (data) => handleUpdateSponsor(editingSponsor.id, data) : handleCreateSponsor}
              onCancel={() => { setShowSponsorForm(false); setEditingSponsor(null); }}
            />
          )}
        </>
      )}

      {activeTab === 'gallery' && (
        <>
          <GalleryTab
            images={galleryImages}
            onCreateImageAction={() => { setEditingGalleryImage(null); setShowGalleryForm(true); }}
            onEditImageAction={(img) => { setEditingGalleryImage(img); setShowGalleryForm(true); }}
            onDeleteImageAction={(id) => genericApiAction('/api/admin/gallery', 'DELETE', { id }, loadGallery)}
          />
          {showGalleryForm && (
            <GalleryForm
              image={editingGalleryImage}
              onSubmitAction={editingGalleryImage ? (data) => handleUpdateGallery(editingGalleryImage.id, data) : handleCreateGallery}
              onCancelAction={() => { setShowGalleryForm(false); setEditingGalleryImage(null); }}
            />
          )}
        </>
      )}

      {activeTab === 'products' && (
        <>
          <ProductsTab
            products={products}
            onCreateProductAction={() => { setEditingProduct(null); setShowProductForm(true); }}
            onEditProductAction={(prod) => { setEditingProduct(prod); setShowProductForm(true); }}
            onDeleteProductAction={(id) => genericApiAction('/api/products', 'DELETE', { id }, loadProducts)}
          />
          {showProductForm && (
            <ProductForm
              product={editingProduct}
              onSaveAction={() => { 
                loadProducts(); 
                setShowProductForm(false); 
                setEditingProduct(null); 
              }}
              onCancelAction={() => { setShowProductForm(false); setEditingProduct(null); }}
            />
          )}
        </>
      )}

      {activeTab === 'orders' && (
        <OrdersTab
          orders={orders}
          loadingOrders={loadingOrders}
          onUpdateOrderStatusAction={handleUpdateOrderStatus}
          onRefreshOrdersAction={loadOrders}
        />
      )}

      {/* Admin Creation Modal */}
      {showAdminForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">إضافة مسؤول جديد</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateAdmin(Object.fromEntries(formData));
            }} className="space-y-4">
              <input name="full_name" placeholder="الاسم الكامل" required className="w-full bg-gray-800 border-gray-600 rounded p-2 text-white placeholder-gray-400" />
              <input name="email" type="email" placeholder="البريد الإلكتروني" required className="w-full bg-gray-800 border-gray-600 rounded p-2 text-white placeholder-gray-400" />
              <input name="password" type="password" placeholder="كلمة المرور" required className="w-full bg-gray-800 border-gray-600 rounded p-2 text-white placeholder-gray-400" />
              <select name="role" className="w-full bg-gray-800 border-gray-600 rounded p-2 text-white">
                <option value="admin">مسؤول</option>
                <option value="super_admin">مسؤول عام</option>
              </select>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700">حفظ</button>
                <button type="button" onClick={() => setShowAdminForm(false)} className="flex-1 bg-gray-700 text-white py-2 rounded hover:bg-gray-600">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Details Modal */}
      {selectedReg && (
          <RegistrationDetailsModal 
            registration={selectedReg} 
            onClose={() => setSelectedReg(null)} 
            onUpdateStatus={updateStatus} 
          />
      )}

    </AdminShell>
  );
}

'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { getEventRegistrations, getEventDetails } from '@/actions/event-admin-actions';
import { approveRacerRegistration } from '@/app/_actions';
import Link from 'next/link';
import { 
  Users, 
  Car, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  RefreshCcw, 
  ChevronLeft,
  Camera,
  UserCheck,
  CreditCard,
  MoreVertical,
  Eye
} from 'lucide-react';

// --- Image Modal Component ---
const ImageModal = ({ src, alt, onClose }: { src: string, alt: string, onClose: () => void }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <button 
          className="absolute -top-12 right-0 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all backdrop-blur-sm" 
          onClick={onClose}
        >
          ✕
        </button>
        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#0f1115]">
          <img src={src} alt={alt} className="max-w-full max-h-[80vh] object-contain" />
        </div>
        <div className="mt-6 px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
          <p className="text-white text-sm font-medium tracking-wide flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-400" />
            {alt}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function EventRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [newCredentials, setNewCredentials] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [accessError, setAccessError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{src: string, alt: string} | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setAccessError(null);
    try {
      const [regRes, eventRes] = await Promise.all([
        getEventRegistrations(id),
        getEventDetails(id)
      ]);
    
      if (regRes.success && regRes.data) {
        setRegistrations(regRes.data);
        setFilteredData(regRes.data);
      } else {
        const rawError = String((regRes as any)?.error || '').toUpperCase();
        if (rawError.includes('NO_EVENT_ACCESS') || rawError.includes('FORBIDDEN') || rawError.includes('UNAUTHORIZED')) {
          setAccessError('NO_EVENT_ACCESS');
        } else if ((regRes as any)?.error) {
          setAccessError(String((regRes as any).error));
        }
        setRegistrations([]);
      }

      if (eventRes.success) {
        setEvent(eventRes.data);
      } else {
        setEvent(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Filtering & Search
  useEffect(() => {
    let result = registrations;

    // Filter by status
    if (filter !== 'all') {
      result = result.filter(r => r.status === filter);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.full_name?.toLowerCase().includes(q) ||
        r.phone_number?.includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.car_make?.toLowerCase().includes(q) ||
        r.car_model?.toLowerCase().includes(q) ||
        r.registration_number?.toLowerCase().includes(q) ||
        r.reference_id?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q)
      );
    }

    setFilteredData(result);
  }, [registrations, filter, searchQuery]);

  const handleApprove = async (regId: string) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا المتسابق؟ سيتم إنشاء حساب له فوراً.')) return;
      
    setProcessingId(regId);
    try {
      const res = await approveRacerRegistration(regId);
      if (res.success) {
        setNewCredentials({
          username: res.username,
          password: res.password,
          regId: regId
        });
        loadData(); // Refresh list to update status
      } else {
        alert('خطأ: ' + res.error);
      }
    } catch (e) {
      alert('حدث خطأ غير متوقع');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            مقبول
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" />
            مرفوض
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            <Clock className="w-3.5 h-3.5" />
            قيد المراجعة
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="text-gray-400 animate-pulse">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (accessError === 'NO_EVENT_ACCESS') {
    return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-[#1a1c23] border border-red-900/30 rounded-2xl p-8 text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">⛔</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">وصول مقيد</h1>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  ليس لديك الصلاحيات الكافية لعرض تسجيلات هذه الفعالية. يرجى التواصل مع المدير العام.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link
                        href={`/admin/events/${id}`}
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl font-medium transition-colors border border-white/10"
                    >
                        العودة للفعالية
                    </Link>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-100" dir="rtl">
      {/* Credentials Modal */}
      {newCredentials && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-[#1a1c23] border border-green-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl relative">
                <button onClick={() => setNewCredentials(null)} className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors">✕</button>
                
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                
                <h3 className="text-xl font-bold text-center text-white mb-2">تم قبول المتسابق بنجاح!</h3>
                <p className="text-gray-400 text-center text-sm mb-6">تم توليد بيانات الدخول الخاصة بالمتسابق تلقائياً.</p>
                
                <div className="bg-[#111317] p-4 rounded-xl border border-gray-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                        <span className="text-xs text-gray-500 font-medium uppercase">اسم المستخدم</span>
                        <div className="flex items-center gap-2">
                           <code className="text-yellow-400 font-mono font-bold text-lg select-all">{newCredentials.username}</code>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-xs text-gray-500 font-medium uppercase">كلمة المرور</span>
                        <div className="flex items-center gap-2">
                           <code className="text-red-400 font-mono font-bold text-lg select-all">{newCredentials.password}</code>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6">
                    <button onClick={() => setNewCredentials(null)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all w-full shadow-lg shadow-green-600/20">
                        تم نسخ البيانات، إغلاق
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">يرجى مشاركة هذه البيانات مع المتسابق</p>
                </div>
            </div>
        </div>
      )}

      {/* Image Modal */}
      {previewImage && (
          <ImageModal src={previewImage.src} alt={previewImage.alt} onClose={() => setPreviewImage(null)} />
      )}

      {/* Header Section */}
      <header className="bg-[#1a1c23] border-b border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href={`/admin/events/${id}`} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
               <ChevronLeft className="w-5 h-5" />
             </Link>
             <div>
               <h1 className="text-xl font-bold text-white flex items-center gap-2">
                 <span className="bg-gradient-to-r from-indigo-500 to-purple-600 w-2 h-6 rounded-full"></span>
                 {event?.name || 'الفعالية'}
               </h1>
               <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                 <Users className="w-3 h-3" />
                 إدارة المتقدمين والتسجيلات
               </p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={loadData} 
              className="hidden sm:flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
            >
              <RefreshCcw className="w-4 h-4" />
              تحديث
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1a1c23] p-5 rounded-2xl border border-gray-800/60 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">الكل</p>
                    <h3 className="text-3xl font-bold text-white">{registrations.length}</h3>
                </div>
                <div className="absolute bottom-4 left-4 text-indigo-500/20">
                    <Users className="w-10 h-10" />
                </div>
            </div>

            <div className="bg-[#1a1c23] p-5 rounded-2xl border border-gray-800/60 shadow-lg relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                    <p className="text-yellow-500/80 text-xs font-medium uppercase tracking-wider mb-1">قيد الانتظار</p>
                    <h3 className="text-3xl font-bold text-white">{registrations.filter(r => r.status === 'pending').length}</h3>
                </div>
                <div className="absolute bottom-4 left-4 text-yellow-500/20">
                    <Clock className="w-10 h-10" />
                </div>
            </div>

            <div className="bg-[#1a1c23] p-5 rounded-2xl border border-gray-800/60 shadow-lg relative overflow-hidden group hover:border-green-500/50 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                    <p className="text-green-500/80 text-xs font-medium uppercase tracking-wider mb-1">المقبولين</p>
                    <h3 className="text-3xl font-bold text-white">{registrations.filter(r => r.status === 'approved').length}</h3>
                </div>
                <div className="absolute bottom-4 left-4 text-green-500/20">
                    <CheckCircle className="w-10 h-10" />
                </div>
            </div>

            <div className="bg-[#1a1c23] p-5 rounded-2xl border border-gray-800/60 shadow-lg relative overflow-hidden group hover:border-red-500/50 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                    <p className="text-red-500/80 text-xs font-medium uppercase tracking-wider mb-1">المرفوضين</p>
                    <h3 className="text-3xl font-bold text-white">{registrations.filter(r => r.status === 'rejected').length}</h3>
                </div>
                <div className="absolute bottom-4 left-4 text-red-500/20">
                    <XCircle className="w-10 h-10" />
                </div>
            </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-[#1a1c23] p-4 rounded-xl border border-gray-800 shadow-sm">
            <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="بحث باسم المتسابق، رقم الهاتف، أو نوع السيارة..." 
                    className="w-full bg-[#0f1115] border border-gray-700 text-white text-sm rounded-lg pr-10 pl-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-3">
                <div className="relative min-w-[160px]">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select 
                        className="w-full bg-[#0f1115] border border-gray-700 text-white text-sm rounded-lg pr-10 pl-4 py-2.5 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="pending">قيد المراجعة</option>
                        <option value="approved">المقبولين</option>
                        <option value="rejected">المرفوضين</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#1a1c23] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-[#23252e] border-b border-gray-700">
                            <th className="py-4 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider w-16 text-center">#</th>
                            <th className="py-4 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">المتسابق</th>
                            <th className="py-4 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">المركبة</th>
                            <th className="py-4 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">الوثائق الرسمية</th>
                            <th className="py-4 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">الحالة</th>
                            <th className="py-4 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider w-32 text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredData.map((reg, idx) => (
                            <tr key={reg.id} className="group hover:bg-[#23252e]/50 transition-colors duration-150">
                                <td className="py-5 px-6 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 text-gray-400 font-mono text-sm border border-gray-700">
                                      {String(filteredData.length - idx).padStart(2, '0')}
                                    </span>
                                </td>
                                
                                <td className="py-5 px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold border border-gray-600 shadow-sm shrink-0">
                                                {reg.full_name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            {reg.registration_type === 'group' && (
                                                <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded-full border border-[#1a1c23]" title={`تسجيل مجموعة: ${reg.group_name}`}>
                                                    مجموعة
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-bold text-base leading-tight">{reg.full_name}</p>
                                                <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 rounded font-mono">#{reg.reference_id || reg.id.slice(0,6)}</span>
                                            </div>
                                            
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                                                    <span dir="ltr">{reg.country_code} {reg.phone_number}</span>
                                                </div>
                                                {reg.email && (
                                                    <div className="text-xs text-gray-500 truncate max-w-[180px]" title={reg.email}>
                                                        {reg.email}
                                                    </div>
                                                )}
                                            </div>

                                            {reg.registration_type === 'group' && reg.group_name && (
                                                <div className="text-xs text-purple-300 mt-1 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {reg.group_name} ({reg.car_count} سيارات)
                                                </div>
                                            )}

                                            {reg.has_passenger && (
                                              <div className="mt-2 text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20 w-fit">
                                                <div className="flex items-center gap-1 font-semibold">
                                                    <UserCheck className="w-3 h-3" />
                                                    مساعد: {reg.passenger_name}
                                                </div>
                                                {reg.passenger_mobile && <div className="text-gray-400 mt-0.5" dir="ltr">{reg.passenger_mobile}</div>}
                                              </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                <td className="py-5 px-6">
                                    <div className="flex items-start gap-4">
                                        <div 
                                          className="relative w-16 h-12 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden shrink-0 cursor-pointer hover:border-indigo-500 transition-colors group/img"
                                          onClick={() => reg.car_photo_url && setPreviewImage({src: reg.car_photo_url, alt: `${reg.car_make} ${reg.car_model}`})}
                                        >
                                            {reg.car_photo_url ? (
                                                <>
                                                  <img src={reg.car_photo_url} className="w-full h-full object-cover" alt="Car" />
                                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                    <Eye className="w-4 h-4 text-white" />
                                                  </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                  <Car className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm mb-1 line-clamp-1">{reg.car_make} <span className="text-gray-400">{reg.car_model}</span></p>
                                            <div className="flex gap-2">
                                                <span className="text-xs bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-gray-300 font-mono">{reg.car_year}</span>
                                                {reg.car_category && (
                                                  <span className="text-xs bg-indigo-900/30 border border-indigo-800 px-1.5 py-0.5 rounded text-indigo-300">
                                                    {reg.car_category}
                                                  </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="py-5 px-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            {reg.driver_cpr_photo_url ? (
                                                <button 
                                                    onClick={() => setPreviewImage({src: reg.driver_cpr_photo_url, alt: `هوية السائق: ${reg.driver_cpr || ''}`})}
                                                    className="flex items-center gap-2 text-xs bg-[#252830] hover:bg-[#2d3039] text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors group/btn"
                                                    title={reg.driver_cpr || 'عرض الصورة'}
                                                >
                                                    <CreditCard className="w-3.5 h-3.5 text-indigo-400 group-hover/btn:text-white transition-colors" />
                                                    <span className="truncate max-w-[100px]">{reg.driver_cpr || 'صورة الهوية'}</span>
                                                    <Eye className="w-3 h-3 text-gray-500 ml-1 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                </button>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-900/10 px-2 py-1 rounded w-fit border border-red-900/20">
                                                    <XCircle className="w-3 h-3" />
                                                    هوية مفقودة
                                                </span>
                                            )}
                                        </div>

                                        {reg.has_passenger && (
                                            <div className="flex items-center gap-2">
                                                {reg.passenger_cpr_photo_url ? (
                                                    <button 
                                                        onClick={() => setPreviewImage({src: reg.passenger_cpr_photo_url, alt: `هوية المساعد: ${reg.passenger_cpr || ''}`})}
                                                        className="flex items-center gap-2 text-xs bg-[#252830] hover:bg-[#2d3039] text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors group/btn"
                                                        title={reg.passenger_cpr || 'عرض الصورة'}
                                                    >
                                                        <CreditCard className="w-3.5 h-3.5 text-purple-400 group-hover/btn:text-white transition-colors" />
                                                        <span className="truncate max-w-[100px]">{reg.passenger_cpr || 'هوية المساعد'}</span>
                                                        <Eye className="w-3 h-3 text-gray-500 ml-1 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                    </button>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-900/10 px-2 py-1 rounded w-fit border border-red-900/20">
                                                        <XCircle className="w-3 h-3" />
                                                        هوية مساعد مفقودة
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {(reg.emergency_contact_name || reg.emergency_contact_number) && (
                                            <div className="mt-2 text-[10px] text-gray-500 border-t border-gray-800 pt-2">
                                                <div className="flex items-center gap-1 mb-0.5">
                                                    <span className="bg-red-500/10 text-red-400 px-1 rounded">طوارئ</span>
                                                    <span className="font-semibold text-gray-400">{reg.emergency_contact_name}</span>
                                                </div>
                                                <div dir="ltr" className="font-mono">{reg.emergency_contact_number}</div>
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="py-5 px-6">
                                    <div className="flex flex-col gap-2">
                                        {getStatusBadge(reg.status)}
                                        
                                        {/* Status Metadata */}
                                        {reg.status === 'rejected' && reg.rejection_reason && (
                                            <div className="text-[10px] bg-red-900/20 text-red-300 p-2 rounded border border-red-900/30 max-w-[180px]">
                                                <span className="font-bold block mb-0.5">سبب الرفض:</span>
                                                {reg.rejection_reason}
                                            </div>
                                        )}

                                        {reg.status === 'approved' && reg.username && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono bg-black/20 px-2 py-1 rounded w-fit border border-gray-800">
                                                <UserCheck className="w-3 h-3 text-green-500/50" />
                                                {reg.username}
                                            </div>
                                        )}

                                        {/* Inspection/Check-in Status Badges */}
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {reg.inspection_status && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                    reg.inspection_status === 'passed' ? 'bg-green-900/20 text-green-400 border-green-800' :
                                                    reg.inspection_status === 'failed' ? 'bg-red-900/20 text-red-400 border-red-800' :
                                                    'bg-gray-800 text-gray-400 border-gray-700'
                                                }`}>
                                                    فحص: {reg.inspection_status === 'passed' ? 'اجتاز' : reg.inspection_status === 'failed' ? 'فشل' : reg.inspection_status}
                                                </span>
                                            )}
                                            {reg.check_in_status && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                    reg.check_in_status === 'checked_in' ? 'bg-blue-900/20 text-blue-400 border-blue-800' :
                                                    'bg-gray-800 text-gray-400 border-gray-700'
                                                }`}>
                                                    حضور: {reg.check_in_status === 'checked_in' ? 'نعم' : 'لا'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                <td className="py-5 px-6">
                                    <div className="flex items-center justify-center gap-2">
                                        {reg.status === 'pending' || reg.status === 'rejected' ? (
                                            <button 
                                                disabled={!!processingId}
                                                onClick={() => handleApprove(reg.id)}
                                                className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-all shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="قبول المتسابق"
                                            >
                                                {processingId === reg.id ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            </button>
                                        ) : null}
                                        
                                        <Link
                                            href={`/admin/events/${id}/registrations/${reg.id}`}
                                            className="bg-gray-700 hover:bg-gray-600 text-gray-200 p-2 rounded-lg transition-colors border border-gray-600"
                                            title="عرض التفاصيل الكاملة"
                                        >
                                            <FileText className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {filteredData.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">لا توجد نتائج</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">
                        لم يتم العثور على أي تسجيلات مطابقة لمعايير البحث الحالية. حاول تغيير الفلتر أو كلمة البحث.
                    </p>
                    <button 
                      onClick={() => {setFilter('all'); setSearchQuery('');}}
                      className="mt-6 text-indigo-400 hover:text-indigo-300 font-medium text-sm hover:underline"
                    >
                      مسح الفلاتر
                    </button>
                </div>
            )}
            
            {/* Footer Stats */}
            <div className="bg-[#23252e] border-t border-gray-700 px-6 py-3 flex items-center justify-between">
               <p className="text-xs text-gray-500">
                  عرض {filteredData.length} من أصل {registrations.length} متسابق
               </p>
               <div className="flex gap-2">
                   {/* Pagination placeholders if needed later */}
               </div>
            </div>
        </div>
      </main>
    </div>
  );
}

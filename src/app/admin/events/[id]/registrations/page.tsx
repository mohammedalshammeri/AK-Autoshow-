'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { getEventRegistrations, getEventDetails } from '@/actions/event-admin-actions';
import { approveRacerRegistration } from '@/app/_actions';
import Link from 'next/link';

// --- Image Modal Component ---
const ImageModal = ({ src, alt, onClose }: { src: string, alt: string, onClose: () => void }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
        <button className="absolute -top-12 right-0 text-white text-xl font-bold bg-gray-800 rounded-full w-10 h-10 hover:bg-red-600 transition z-50" onClick={onClose}>✕</button>
        <img src={src} alt={alt} className="max-w-full max-h-[85vh] object-contain rounded-lg border border-gray-700 shadow-2xl" />
        <p className="mt-4 text-white text-lg font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur">{alt}</p>
      </div>
    </div>
  );
};

export default function EventRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [newCredentials, setNewCredentials] = useState<any>(null);
  const [filter, setFilter] = useState('all');
    const [accessError, setAccessError] = useState<string | null>(null);
  
  // Modal State
  const [previewImage, setPreviewImage] = useState<{src: string, alt: string} | null>(null);

    const loadData = useCallback(async () => {
    setLoading(true);
        setAccessError(null);
    const [regRes, eventRes] = await Promise.all([
        getEventRegistrations(id),
        getEventDetails(id)
    ]);
    
        if (regRes.success && regRes.data) {
            setRegistrations(regRes.data);
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
    setLoading(false);
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

  const handleApprove = async (regId: string) => {
      // confirm is good but users hate blocking popups. Let's trust the button text.
      // Or just a quick check
      if(!window.confirm('هل أنت متأكد من قبول هذا المتسابق؟ سيتم إنشاء حساب له فوراً.')) return;
      
      setProcessingId(regId);
      const res = await approveRacerRegistration(regId);
      
      if (res.success) {
          setNewCredentials({
              username: res.username,
              password: res.password,
              regId: regId
          });
          loadData(); // Refresh
      } else {
          alert('خطأ: ' + res.error);
      }
      setProcessingId(null);
  };

  const filteredRegistrations = registrations.filter(r => {
      if (filter === 'all') return true;
      return r.status === filter;
  });

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (accessError === 'NO_EVENT_ACCESS') {
        return (
            <div className="min-h-[70vh] text-white p-6 md:p-10" dir="rtl">
                <div className="max-w-2xl mx-auto bg-gray-900/70 border border-gray-800/80 rounded-2xl p-8 md:p-10 text-center shadow-xl">
                    <div className="text-5xl mb-4">⛔</div>
                    <h1 className="text-2xl md:text-3xl font-black mb-2">لا تملك صلاحية مشاهدة تسجيلات هذه الفعالية</h1>
                    <p className="text-gray-400 mb-7">لازم يتم إضافتك كـ (Staff) داخل الفعالية أولاً.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={`/admin/events/${id}/permissions`}
                            className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-xl font-bold"
                        >
                            إدارة صلاحيات الفعالية
                        </Link>
                        <Link
                            href={`/admin/events/${id}`}
                            className="bg-gray-800 text-gray-200 px-6 py-3 rounded-xl font-bold border border-gray-700"
                        >
                            رجوع للوحة الفعالية
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="text-white p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Image Preview Modal */}
        {previewImage && (
            <ImageModal src={previewImage.src} alt={previewImage.alt} onClose={() => setPreviewImage(null)} />
        )}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800/80 pb-6 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-l from-white to-gray-400 tracking-tight">
                    🏁 {event?.name}
                </h1>
                <p className="text-gray-400 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    إدارة التسجيلات والمتسابقين
                </p>
            </div>
            <div className="flex gap-3">
                <Link href={`/admin/events/${id}`} className="bg-gray-900/60 text-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-900 transition font-bold border border-gray-800/80">
                    عودة
                </Link>
                <button onClick={loadData} className="bg-gray-900/60 text-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-900 transition font-bold border border-gray-800/80">
                    تحديث القائمة 🔄
                </button>
            </div>
        </header>

        {/* Credentials Popup */}
        {newCredentials && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur pb-20">
                <div className="bg-gray-900 border border-green-500/50 p-8 rounded-2xl max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
                    <button onClick={() => setNewCredentials(null)} className="absolute top-4 left-4 text-gray-500 hover:text-white">✕</button>
                    
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🎉</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-center text-white mb-2">تم القبول بنجاح!</h3>
                    <p className="text-gray-400 text-center text-sm mb-6">تم إنشاء حساب للمتسابق للدخول إلى بوابة السباق.</p>
                    
                    <div className="bg-black p-5 rounded-xl border border-gray-800 font-mono text-center space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">اسم المستخدم</p>
                            <div className="flex items-center justify-center gap-2 bg-gray-900 p-2 rounded border border-gray-800">
                                <span className="text-xl text-yellow-400 select-all font-bold">{newCredentials.username}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">كلمة المرور</p>
                            <div className="flex items-center justify-center gap-2 bg-gray-900 p-2 rounded border border-gray-800">
                                <span className="text-xl text-red-400 select-all font-bold">{newCredentials.password}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                        <p className="text-green-500/80 text-xs mb-4">⚠️ يرجى تصوير الشاشة أو إرسال البيانات للمتسابق الآن.</p>
                        <button onClick={() => setNewCredentials(null)} className="bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition w-full">
                            تم النسخ، إغلاق
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Stats & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900/60 backdrop-blur p-5 rounded-2xl border border-gray-800/80">
                <h3 className="text-gray-400 text-sm mb-1">الكل</h3>
                <p className="text-3xl font-bold">{registrations.length}</p>
            </div>
            <div className="bg-yellow-900/15 p-5 rounded-2xl border border-yellow-800/30">
                <h3 className="text-yellow-500 text-sm mb-1">قيد الانتظار</h3>
                <p className="text-3xl font-bold text-yellow-400">{registrations.filter(r => r.status === 'pending').length}</p>
            </div>
            <div className="bg-green-900/15 p-5 rounded-2xl border border-green-800/30">
                <h3 className="text-green-500 text-sm mb-1">المقبولين</h3>
                <p className="text-3xl font-bold text-green-400">{registrations.filter(r => r.status === 'approved').length}</p>
            </div>
            <div className="flex items-end">
                 <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full bg-gray-900/60 text-white border border-gray-800/80 rounded-xl p-4 outline-none focus:border-red-500"
                 >
                     <option value="all">عرض الجميع</option>
                     <option value="pending">قيد المراجعة</option>
                     <option value="approved">المقبولين</option>
                     <option value="rejected">المرفوضين</option>
                 </select>
            </div>
        </div>

        <div className="bg-gray-900/70 backdrop-blur rounded-2xl border border-gray-800/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-right" style={{ minWidth: '1000px' }}>
                    <thead>
                        <tr className="bg-gray-800/60 text-gray-300 text-sm tracking-wide border-b border-gray-700/70">
                            <th className="p-5 font-medium">#</th>
                            <th className="p-5 font-medium">المتسابق</th>
                            <th className="p-5 font-medium">السيارة</th>
                            <th className="p-5 font-medium">الوثائق (الهوية)</th>
                            <th className="p-5 font-medium">صور السيارة</th>
                            <th className="p-5 font-medium">الحالة</th>
                            <th className="p-5 font-medium text-left">الإجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredRegistrations.map((reg, idx) => (
                            <tr key={reg.id} className="hover:bg-gray-800/30 transition-colors group">
                                <td className="p-5 text-gray-500 font-mono text-sm">
                                    {String(registrations.length - idx).padStart(2, '0')}
                                </td>
                                
                                <td className="p-5">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white text-lg">{reg.full_name}</span>
                                        <span className="text-gray-500 text-sm" dir="ltr">{reg.phone_number}</span>
                                        {reg.has_passenger && (
                                            <span className="mt-1 text-xs bg-gray-800 text-gray-300 w-fit px-2 py-0.5 rounded border border-gray-700">
                                                + مساعد: {reg.passenger_name}
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="p-5">
                                    <div className="flex flex-col">
                                        <span className="text-gray-200 font-medium">{reg.car_make} {reg.car_model}</span>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">{reg.car_year}</span>
                                            {reg.car_category && (
                                                <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-900">
                                                    {reg.car_category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                <td className="p-5">
                                    <div className="flex flex-wrap gap-2">
                                        {reg.driver_cpr_photo_url ? (
                                            <button 
                                                onClick={() => setPreviewImage({src: reg.driver_cpr_photo_url, alt: 'هوية السائق'})}
                                                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 border border-gray-700 transition"
                                            >
                                                🆔 هوية السائق
                                            </button>
                                        ) : <span className="text-xs text-red-900 bg-red-900/20 px-2 py-1 rounded">مفقودة</span>}

                                        {reg.has_passenger && (
                                            reg.passenger_cpr_photo_url ? (
                                                <button 
                                                    onClick={() => setPreviewImage({src: reg.passenger_cpr_photo_url, alt: 'هوية المساعد'})}
                                                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 border border-gray-700 transition"
                                                >
                                                    🆔 هوية المساعد
                                                </button>
                                            ) : <span className="text-xs text-red-900 bg-red-900/20 px-2 py-1 rounded">هوية مفقودة</span>
                                        )}
                                    </div>
                                </td>

                                <td className="p-5">
                                     {reg.car_photo_url ? (
                                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-gray-700 hover:border-white transition cursor-pointer group/img"
                                             onClick={() => setPreviewImage({src: reg.car_photo_url, alt: `${reg.car_make} ${reg.car_model}`})}>
                                            <img src={reg.car_photo_url} alt="Car" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition">
                                                🔍
                                            </div>
                                        </div>
                                     ) : (
                                         <span className="text-gray-600">-</span>
                                     )}
                                </td>

                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                        reg.status === 'approved' ? 'bg-green-900/30 border-green-800 text-green-400' :
                                        reg.status === 'rejected' ? 'bg-red-900/30 border-red-800 text-red-400' :
                                        'bg-yellow-900/30 border-yellow-800 text-yellow-500'
                                    }`}>
                                        {reg.status === 'approved' ? 'مقبول' : reg.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                                    </span>
                                    {reg.username && (
                                        <div className="mt-2 text-xs flex items-center gap-1 text-gray-500 bg-black/30 px-2 py-1 rounded w-fit">
                                            👤 {reg.username}
                                        </div>
                                    )}
                                </td>

                                <td className="p-5 text-left">
                                    <div className="flex items-center gap-2 justify-start">
                                        <Link
                                            href={`/admin/events/${id}/registrations/${reg.id}`}
                                            className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-xl text-sm font-bold transition border border-gray-700"
                                        >
                                            ✏️ تعديل
                                        </Link>

                                        {reg.status === 'pending' ? (
                                            <button 
                                                disabled={processingId === reg.id}
                                                onClick={() => handleApprove(reg.id)}
                                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg shadow-green-900/20 px-4 py-2 rounded-xl text-sm font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processingId === reg.id ? 'جاري المعالجة...' : '✅ قبول'}
                                            </button>
                                        ) : (
                                            <span className="text-gray-600 text-sm">مكتمل</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {filteredRegistrations.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                    <div className="text-4xl mb-3">📭</div>
                    <p>لا توجد بيانات مطابقة للفلتر</p>
                </div>
            )}
        </div>
            </div>
        </div>
  );
}

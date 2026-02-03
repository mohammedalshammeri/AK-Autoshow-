'use client';

import { useState, useEffect } from 'react';
import { X, Check, XCircle, User, Phone, Mail, Car, Calendar, Hash, Users, Crown } from 'lucide-react';

interface RegistrationDetailsModalProps {
  registration: any;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
}

export function RegistrationDetailsModal({ registration, onClose, onUpdateStatus }: RegistrationDetailsModalProps) {
  const [detailedReg, setDetailedReg] = useState<any>(registration);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (registration && registration.registration_type === 'group' && !registration.group_cars) {
        setLoadingDetails(true);
        fetch(`/api/admin/registrations?id=${registration.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.registration) {
                    setDetailedReg(data.registration);
                }
            })
            .catch(err => console.error('Failed to load details', err))
            .finally(() => setLoadingDetails(false));
    } else {
        setDetailedReg(registration);
    }
  }, [registration]);

  if (!registration) return null;

  const isGroup = registration.registration_type === 'group';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-gray-900 border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl" 
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 border-b border-gray-700 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                تفاصيل التسجيل
                {isGroup && <span className="text-sm bg-purple-600 text-white px-2 py-0.5 rounded">قروب</span>}
             </h2>
             <span className={`text-xs px-2 py-1 rounded-full ${
                registration.status === 'approved' ? 'bg-green-900 text-green-300' :
                registration.status === 'rejected' ? 'bg-red-900 text-red-300' :
                'bg-yellow-900 text-yellow-300'
             }`}>
               {registration.status === 'approved' ? 'مقبول' : registration.status === 'rejected' ? 'مرفوض' : 'معلق'}
             </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Images Section */}
          {registration.car_images && registration.car_images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {registration.car_images.map((img: any, idx: number) => (
                <div key={idx} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group">
                  <img 
                    src={img.image_url} 
                    alt={`Car ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <a 
                    href={img.image_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm">عرض بالحجم الكامل</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 border border-dashed border-gray-700 rounded-lg p-8 text-center">
              <span className="text-4xl block mb-2">📷</span>
              <p className="text-gray-400">لا توجد صور مرفقة</p>
            </div>
          )}

          {/* Group Special Section */}
          {isGroup && (
            <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
               <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2 mb-4">
                 <Users size={20} />
                 معلومات القروب المسجل
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600/20 p-2 rounded">
                        <Users className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">اسم القروب</p>
                        <p className="text-white font-bold text-lg">{registration.group_name || 'غير محدد'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600/20 p-2 rounded">
                        <Car className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">عدد سيارات القروب</p>
                        <p className="text-white font-bold text-lg">{registration.car_count || 1}</p>
                    </div>
                  </div>

                  <div className="col-span-full border-t border-purple-800/50 pt-3 mt-1">
                      <div className="flex items-center gap-2">
                          <Crown className="text-yellow-500" size={16} />
                          <span className="text-sm text-gray-300">
                             مدير القروب هو المسؤول عن التواصل وتنظيم دخول سيارات القروب
                          </span>
                      </div>
                  </div>
               </div>
            </div>
          )}

          {/* Group Cars List */}
          {loadingDetails && isGroup && (
             <div className="bg-gray-800 p-4 rounded text-center text-gray-400 animate-pulse">
                جاري تحميل تفاصيل سيارات القروب...
             </div>
          )}

          {detailedReg && detailedReg.group_cars && detailedReg.group_cars.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
               <div className="bg-purple-900/30 p-3 border-b border-purple-800/50 flex justify-between items-center">
                   <h3 className="text-lg font-bold text-white">قائمة سيارات القروب ({detailedReg.group_cars.length})</h3>
               </div>
               <div className="overflow-x-auto max-h-60">
                 <table className="w-full text-right text-sm">
                   <thead className="bg-gray-900/50 text-gray-400 sticky top-0">
                     <tr>
                       <th className="p-3">#</th>
                       <th className="p-3">النوع (Make)</th>
                       <th className="p-3">الموديل (Model)</th>
                       <th className="p-3">السنة</th>
                       <th className="p-3">رقم اللوحة</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-700">
                     {detailedReg.group_cars.map((car: any, idx: number) => (
                        <tr key={car.id || idx} className="hover:bg-purple-900/10 transition-colors">
                           <td className="p-3 text-gray-500">{idx + 1}</td>
                           <td className="p-3 font-medium text-white">{car.make}</td>
                           <td className="p-3 text-gray-300">{car.model}</td>
                           <td className="p-3 text-gray-400">{car.year}</td>
                           <td className="p-3 font-mono text-yellow-500 font-bold" dir="ltr">{car.plate_number}</td>
                        </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-400 border-b border-gray-700 pb-2">
                {isGroup ? 'معلومات مدير القروب' : 'المعلومات الشخصية'}
              </h3>
              
              <div className="flex items-center gap-3 text-gray-300">
                <User className="text-gray-500" size={18} />
                <div>
                  <p className="text-xs text-gray-500">{isGroup ? 'اسم المدير' : 'الاسم الكامل'}</p>
                  <p className="font-medium">{registration.full_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="text-gray-500" size={18} />
                <div dir="ltr" className="text-right">
                  <p className="text-xs text-gray-500">رقم الهاتف</p>
                  <p className="font-medium">{registration.phone_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="text-gray-500" size={18} />
                <div>
                  <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                  <p className="font-medium">{registration.email}</p>
                </div>
              </div>
            </div>

            {/* Car Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-400 border-b border-gray-700 pb-2">معلومات السيارة</h3>
              
              <div className="flex items-center gap-3 text-gray-300">
                <Car className="text-gray-500" size={18} />
                <div>
                  <p className="text-xs text-gray-500">المركبة</p>
                  <p className="font-medium text-lg">{registration.car_make} {registration.car_model}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="text-gray-500" size={18} />
                <div>
                  <p className="text-xs text-gray-500">سنة الصنع</p>
                  <p className="font-medium">{registration.car_year}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <Hash className="text-gray-500" size={18} />
                <div>
                  <p className="text-xs text-gray-500">رقم التسجيل</p>
                  <p className="font-mono text-yellow-500">{registration.registration_number || 'N/A'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-800/50 border-t border-gray-700 p-4 flex gap-3">
          {registration.status === 'pending' && (
            <>
              <button 
                onClick={() => { onUpdateStatus(registration.id, 'approved'); onClose(); }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} /> موافقة
              </button>
              <button 
                onClick={() => { onUpdateStatus(registration.id, 'rejected'); onClose(); }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={18} /> رفض
              </button>
            </>
          )}
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

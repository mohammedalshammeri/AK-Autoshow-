'use client';

import { MessageCircle } from 'lucide-react';

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
  registration_type?: 'individual' | 'group';
  group_name?: string;
  car_count?: number;
  car_images?: Array<{
    id: number;
    image_url: string;
  }>;
}

interface RegistrationsTabProps {
  registrations: Registration[];
  tabType: 'pending' | 'approved' | 'rejected';
  onSelectRegistration: (reg: Registration) => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
}

export function RegistrationsTab({ 
  registrations, 
  tabType, 
  onSelectRegistration, 
  onUpdateStatus 
}: RegistrationsTabProps) {
  const generateWhatsAppLink = (participant: any) => {
    const phone = participant.phone_number.replace(/\+/g, ''); // Remove '+' for the link
    const regNumber = participant.registration_number || 'AKA-' + participant.id.slice(-4);
    
    const message = `🎉 Congratulations! / مبروك!

Your vehicle has been officially selected for **Godzilla Car Show**! 🏎️🔥
تم قبول سيارتك رسمياً للمشاركة في معرض قودزيلا للسيارات!

🚗 *Vehicle / المركبة:* ${participant.car_make} ${participant.car_model} (${participant.car_year})
🔢 *Ref / المرجع:* ${regNumber}

📅 *Date / التاريخ:* Friday, Feb 13, 2026 (2:00PM - 8:00PM)
📍 *Location / الموقع:* Gravity Village

We look forward to seeing your amazing vehicle at the show!
نراكم في المعرض! 🔥`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const getStatusColor = () => {
    switch(tabType) {
      case 'pending': return 'text-yellow-400 border-yellow-500';
      case 'approved': return 'text-green-400 border-green-500';
      case 'rejected': return 'text-red-400 border-red-500';
    }
  };

  const getStatusText = () => {
    switch(tabType) {
      case 'pending': return 'الطلبات المعلقة';
      case 'approved': return 'الطلبات الموافق عليها';
      case 'rejected': return 'الطلبات المرفوضة';
    }
  };

  const statusStyle = getStatusColor();
  // Fixed color logic for tailwind dynamic classes safelist issue by returning full class string above
  // But for simple interpolation below:

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold border-b pb-2 ${statusStyle}`}>
          {tabType === 'pending' && '📋'} {tabType === 'approved' && '✅'} {tabType === 'rejected' && '❌'} {getStatusText()} ({registrations.length})
        </h2>
      </div>
      
      {registrations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl">لا توجد {getStatusText()}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {registrations.map(reg => (
            <div 
              key={reg.id}
              className={`bg-gray-900 border border-gray-700 hover:border-indigo-500 p-6 rounded-lg cursor-pointer transition-colors group relative`}
              onClick={() => onSelectRegistration(reg)}
            >
              {/* Group Badge */}
              {reg.registration_type === 'group' && (
                 <div className="absolute top-4 left-4 bg-purple-600 px-2 py-1 rounded text-xs text-white font-bold shadow-lg z-10">
                     قروب: {reg.group_name || 'غير مسمى'} ({reg.car_count} سيارات)
                 </div>
              )}

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                      {reg.full_name} 
                      {reg.registration_type === 'group' && <span className="text-sm font-normal text-purple-400 mr-2">(مدير القروب)</span>}
                  </h3>
                  <p className="text-gray-300 mb-1">
                    🚗 {reg.registration_type === 'group' ? 'تشكيلة سيارات' : `${reg.car_make} - ${reg.car_model} (${reg.car_year})`}
                  </p>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>📧 {reg.email} | 📱 {reg.phone_number}</span>
                    <a
                      href={generateWhatsAppLink(reg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 transition-colors p-1 rounded-full hover:bg-gray-800"
                      aria-label={`Send WhatsApp to ${reg.full_name}`}
                      title="Send WhatsApp Message"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageCircle size={16} />
                    </a>
                  </div>
                  <p className={`text-sm mt-2 font-medium ${
                    tabType === 'approved' ? 'text-green-400' :
                    tabType === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    📸 {reg.car_images?.length || 0} صور | 
                    📅 {new Date(reg.created_at).toLocaleDateString('ar')}
                  </p>
                </div>
                {tabType === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(reg.id, 'approved');
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white px-4 py-2 rounded text-sm transition-opacity shadow-md flex items-center gap-1"
                    >
                      ✅ موافقة
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(reg.id, 'rejected');
                      }}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white px-4 py-2 rounded text-sm transition-opacity shadow-md flex items-center gap-1"
                    >
                      ❌ رفض
                    </button>
                  </div>
                )}
                {(tabType === 'approved' || tabType === 'rejected') && (
                  <div className={`px-3 py-1 rounded text-sm ${
                    tabType === 'approved' ? 'bg-green-600/20 text-green-400 border border-green-600' : 'bg-red-600/20 text-red-400 border border-red-600'
                  }`}>
                    {tabType === 'approved' ? '✅ موافق عليه' : '❌ مرفوض'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

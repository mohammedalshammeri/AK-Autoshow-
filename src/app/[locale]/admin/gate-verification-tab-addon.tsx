'use client';

import { MessageCircle } from 'lucide-react';

interface GateVerificationTabProps {
  searchQuery: string;
  searchResults: any[];
  selectedParticipant: any;
  isSearching: boolean;
  onSearchChange: (value: string) => void;
  onSelectParticipant: (participant: any | null) => void;
  onClearSelection: () => void;
}

export function GateVerificationTab({
  searchQuery,
  searchResults,
  selectedParticipant,
  isSearching,
  onSearchChange,
  onSelectParticipant,
  onClearSelection,
}: GateVerificationTabProps) {
  // Define generateWhatsAppLink for this component
  const generateWhatsAppLink = (participant: any) => {
    const phone = participant.phone_number.replace(/\+/g, ''); // Remove '+' for the link
    const regNumber = participant.registration_number || 'AKA-' + participant.id.slice(-4);
    
    // Using encodeURIComponent for the message body
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

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-teal-400 mb-4 flex items-center gap-2">
          🎫 بوابة التحقق من المشاركين
        </h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث بالاسم، رقم التسجيل، البريد الإلكتروني أو تفاصيل السيارة..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-teal-500 focus:outline-none"
        />
        {isSearching && (
          <p className="text-gray-400 text-sm mt-2">جاري البحث...</p>
        )}
      </div>

      {/* Results List */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">نتائج البحث</h3>
        {searchResults.length === 0 ? (
          <p className="text-gray-400">لا توجد نتائج حتى الآن. ابدأ بالبحث عن مشارك.</p>
        ) : (
          <div className="space-y-3">
            {searchResults.map((participant) => (
              <div
                key={participant.id}
                className="flex justify-between items-center bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:border-teal-500 transition-colors"
                onClick={() => onSelectParticipant(participant)}
              >
                <div>
                  <p className="text-white font-semibold">{participant.full_name}</p>
                  <p className="text-gray-400 text-sm">
                    {participant.email} • {participant.phone_number}
                  </p>
                  <p className="text-gray-400 text-sm">
                    🚗 {participant.car_make} {participant.car_model} ({participant.car_year})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-teal-400 text-sm font-mono">
                    {participant.registration_number || `AKA-${String(participant.id).slice(-4)}`}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    📅 {new Date(participant.created_at).toLocaleDateString('ar')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      {!searchQuery && (
        <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border border-teal-500/30 p-8 rounded-xl text-center">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-2xl font-bold text-white mb-4">مرحباً بك في بوابة التحقق</h3>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
            هذه البوابة مخصصة للمشرفين للتحقق من بيانات المشاركين المقبولين عند دخول المعرض. 
            ابحث عن المشارك لعرض معلوماته وصور سيارته للتأكد من الهوية.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8 text-left">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                🔍 كيفية البحث
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• ابحث بالاسم الكامل</li>
                <li>• ابحث برقم التسجيل (AKA-xxxx)</li>
                <li>• ابحث بالبريد الإلكتروني</li>
                <li>• ابحث بماركة أو موديل السيارة</li>
              </ul>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                ✅ ما ستراه
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• معلومات المشارك الشخصية</li>
                <li>• تفاصيل السيارة المسجلة</li>
                <li>• صور السيارة للمقارنة</li>
                <li>• رقم التسجيل للتأكيد</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Participant Details Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-cyan-500 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-cyan-500">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🎫</div>
                  <div>
                    <h2 className="text-3xl font-bold text-cyan-400">
                      بيانات المشارك المقبول
                    </h2>
                    <p className="text-gray-300">التحقق من الهوية عند البوابة</p>
                  </div>
                </div>
                <button 
                  onClick={onClearSelection}
                  className="text-gray-400 hover:text-white text-4xl transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Verification Status */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-xl mb-6 text-center">
                <div className="text-3xl mb-2">✅</div>
                <h3 className="text-xl font-bold text-white">مشارك مقبول ومؤكد</h3>
                <p className="text-green-100">يحق له الدخول للمعرض</p>
              </div>

              {/* Registration Number */}
              <div className="bg-gradient-to-r from-cyan-800 to-teal-800 p-6 rounded-xl mb-6 text-center">
                <h3 className="text-lg text-cyan-200 mb-2">رقم التسجيل الرسمي</h3>
                <div className="text-4xl font-bold text-white tracking-wider">
                  {selectedParticipant.registration_number || `AKA-${selectedParticipant.id.slice(-4)}`}
                </div>
                <p className="text-cyan-200 text-sm mt-2">تأكد من هذا الرقم مع المشارك</p>
              </div>

              {/* Participant Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    👤 معلومات المشارك
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">الاسم الكامل:</span>
                      <p className="text-white font-medium text-lg">{selectedParticipant.full_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">البريد الإلكتروني:</span>
                      <p className="text-white">{selectedParticipant.email}</p>
                    </div>                    <div>
                      <span className="text-gray-400 text-sm">رقم الهاتف:</span>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-mono">{selectedParticipant.phone_number}</p>
                        <a
                          href={generateWhatsAppLink(selectedParticipant)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 transition-colors p-1 rounded-full hover:bg-gray-700"
                          aria-label={`Send WhatsApp to ${selectedParticipant.full_name}`}
                          title="Send WhatsApp Message"
                        >
                          <MessageCircle size={20} />
                        </a>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">تاريخ التسجيل:</span>
                      <p className="text-white">{new Date(selectedParticipant.created_at).toLocaleDateString('ar')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    🚗 معلومات السيارة
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">الماركة:</span>
                      <p className="text-white font-medium text-lg">{selectedParticipant.car_make}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">الموديل:</span>
                      <p className="text-white font-medium text-lg">{selectedParticipant.car_model}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">سنة الصنع:</span>
                      <p className="text-white font-medium text-lg">{selectedParticipant.car_year}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">عدد الصور:</span>
                      <p className="text-cyan-400 font-medium">{selectedParticipant.car_images?.length || 0} صورة</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Car Images */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  📸 صور السيارة للمقارنة
                </h3>
                
                {selectedParticipant.car_images && selectedParticipant.car_images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedParticipant.car_images.map((image: any, index: number) => (
                      <div key={image.id} className="relative group">
                        <img 
                          src={image.image_url} 
                          alt={`صورة السيارة ${index + 1}`}
                          className="w-full h-64 object-cover rounded-xl border-2 border-gray-600 hover:border-cyan-500 transition-all transform hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                          صورة {index + 1}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 bg-black/70 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          قارن هذه الصورة مع السيارة الفعلية
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-red-900/30 border border-red-500 p-8 rounded-xl text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-red-400 text-xl font-bold mb-2">تحذير: لا توجد صور للسيارة!</p>
                    <p className="text-gray-300">
                      قد تحتاج للتحقق يدوياً من السيارة أو طلب المشارك عرض صور السيارة
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-6 border-t border-gray-700">
                <button
                  onClick={() => onSelectParticipant(null)}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 text-white px-8 py-3 rounded-xl font-semibold transition-opacity text-lg"
                >
                  ✅ تم التحقق - السماح بالدخول
                </button>
                <button
                  onClick={() => onSelectParticipant(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

export interface Event {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  event_date: string;
  location: string;
  location_ar?: string;
  location_en?: string;
  description?: string;
  description_ar?: string;
  description_en?: string;
  website_url?: string;
  status?: 'upcoming' | 'current' | 'ended' | 'paused';
  features?: string[];
  registration_fee?: number;
  max_participants?: number;
  is_active?: boolean;
  created_at: string;
}

// Events Tab Component
export function EventsTab({ 
  events, 
  onCreateEvent, 
  onEditEvent, 
  onDeleteEvent 
}: {
  events: Event[];
  onCreateEvent: () => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: number | string, name: string) => void;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    
    if (event.status === 'current') {
      return { status: 'current', label: 'جارية الآن', color: 'bg-green-600', icon: '🔴' };
    } else if (event.status === 'paused') {
      return { status: 'paused', label: 'موقوفة مؤقتاً', color: 'bg-yellow-600', icon: '⏸️' };
    } else if (event.status === 'ended') {
      return { status: 'ended', label: 'انتهت', color: 'bg-gray-600', icon: '⚫' };
    } else if (eventDate > now) {
      return { status: 'upcoming', label: 'قادمة', color: 'bg-blue-600', icon: '🔵' };
    } else {
      return { status: 'ended', label: 'انتهت', color: 'bg-gray-600', icon: '⚫' };
    }
  };

  const getCountdown = (eventDate: string) => {
    const now = currentTime.getTime();
    const target = new Date(eventDate).getTime();
    const diff = target - now;

    if (diff <= 0) {
      return 'انتهت الفعالية';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days} يوم، ${hours} ساعة`;
    } else if (hours > 0) {
      return `${hours} ساعة، ${minutes} دقيقة`;
    } else if (minutes > 0) {
      return `${minutes} دقيقة، ${seconds} ثانية`;
    } else {
      return `${seconds} ثانية`;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400 border-b border-purple-500 pb-2">
          🎉 إدارة الفعاليات ({events.length})
        </h2>
        <button
          onClick={onCreateEvent}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-opacity shadow-lg"
        >
          ➕ إضافة فعالية جديدة
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🎪</div>
          <p className="text-xl">لا توجد فعاليات</p>
          <p className="text-gray-500 mt-2">ابدأ بإضافة فعالية جديدة</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map(event => {
            const eventStatus = getEventStatus(event);
            const countdown = getCountdown(event.event_date);
            
            return (
              <div key={event.id} className="bg-gray-900 border border-gray-700 hover:border-purple-500 rounded-xl transition-colors overflow-hidden">
                {/* Event Header */}
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">                        <h3 className="text-2xl font-bold text-white">
                          {event.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs text-white ${eventStatus.color} flex items-center gap-1`}>
                          <span>{eventStatus.icon}</span>
                          {eventStatus.label}
                        </span>                        {/* Active status will be available after adding columns */}
                      </div>
                        {/* English name will be available after adding columns */}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <p className="text-purple-300 flex items-center gap-2">
                            📅 <span className="font-semibold">التاريخ:</span>
                            {new Date(event.event_date).toLocaleDateString('ar', {
                              year: 'numeric',
                              month: 'long', 
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-purple-300 flex items-center gap-2">
                            🕐 <span className="font-semibold">الوقت:</span>
                            {new Date(event.event_date).toLocaleTimeString('ar', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-gray-300 flex items-center gap-2">
                            📍 <span className="font-semibold">المكان:</span>
                            {event.location}
                          </p>
                        </div>
                        
                        <div className="space-y-2">                          {/* Additional fields will be available after running the SQL update */}
                        </div>
                      </div>

                      {/* Countdown */}
                      {eventStatus.status === 'upcoming' && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-600/30">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">⏰</span>
                            <div>
                              <p className="text-blue-300 font-semibold">العد التنازلي للفعالية:</p>
                              <p className="text-white text-xl font-mono">{countdown}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => onEditEvent(event)}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm transition-opacity font-semibold"
                      >
                        ✏️ تعديل
                      </button>                      <button
                        onClick={() => onDeleteEvent(String(event.id), event.name || event.name_ar || 'حدث غير معروف')}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm transition-opacity font-semibold"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6">                  {/* Description */}
                  {event.description && (
                    <div className="mb-4">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        📝 وصف الفعالية:
                      </h4>
                      <p className="text-gray-300 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}


export function EventForm({ 
  event, 
  onSubmit, 
  onCancel 
}: {
  event?: Event | null;
  onSubmit: (data: Omit<Event, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: event?.name || '',
    name_ar: event?.name_ar || '',
    name_en: event?.name_en || '',
    event_date: event?.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    location_ar: event?.location_ar || '',
    location_en: event?.location_en || '',
    description: event?.description || '',
    description_ar: event?.description_ar || '',
    description_en: event?.description_en || '',
    website_url: event?.website_url || '',
    status: event?.status || 'upcoming' as 'upcoming' | 'current' | 'ended' | 'paused',
    features: event?.features?.join('\n') || '',
    registration_fee: event?.registration_fee || 0,
    max_participants: event?.max_participants || 100,
    is_active: event?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      name_ar: formData.name_ar || formData.name,
      name_en: formData.name_en || formData.name,
      location_ar: formData.location_ar || formData.location,
      location_en: formData.location_en || formData.location,
      description_ar: formData.description_ar || formData.description,
      description_en: formData.description_en || formData.description,
      features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
      event_date: new Date(formData.event_date).toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-purple-500 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-400">
              {event ? '✏️ تعديل الفعالية' : '➕ إضافة فعالية جديدة'}
            </h2>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-white text-3xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* أسماء الفعالية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">اسم الفعالية (عربي) *</label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({...formData, name_ar: e.target.value, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                  required
                  placeholder="مثال: معرض السيارات الفاخرة 2025"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Event Name (English) *</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                  required
                  placeholder="e.g., Luxury Car Show 2025"
                />
              </div>
            </div>

            {/* معلومات أساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">تاريخ ووقت الفعالية *</label>
                <input
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">حالة الفعالية *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'upcoming' | 'current' | 'ended' | 'paused'})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                >
                  <option value="upcoming">قادمة</option>
                  <option value="current">جارية</option>
                  <option value="paused">موقوفة مؤقتاً</option>
                  <option value="ended">منتهية</option>
                </select>
              </div>
            </div>

            {/* أماكن الفعالية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">المكان (عربي) *</label>
                <input
                  type="text"
                  value={formData.location_ar}
                  onChange={(e) => setFormData({...formData, location_ar: e.target.value, location: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                  required
                  placeholder="مثال: مركز البحرين الدولي للمعارض"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Location (English) *</label>
                <input
                  type="text"
                  value={formData.location_en}
                  onChange={(e) => setFormData({...formData, location_en: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                  required
                  placeholder="e.g., Bahrain International Exhibition Center"
                />
              </div>
            </div>

            {/* رابط الموقع */}
            <div>
              <label className="block text-white font-semibold mb-2">رابط موقع الفعالية</label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                placeholder="https://example.com"
              />
            </div>

            {/* الأوصاف */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">الوصف (عربي)</label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({...formData, description_ar: e.target.value, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                  rows={4}
                  placeholder="وصف الفعالية والتفاصيل..."
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Description (English)</label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                  rows={4}
                  placeholder="Event description and details..."
                />
              </div>
            </div>

            {/* مميزات الفعالية */}
            <div>
              <label className="block text-white font-semibold mb-2">مميزات الفعالية (كل مميزة في سطر منفصل)</label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({...formData, features: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                rows={4}
                placeholder={`عروض خاصة للسيارات\nمسابقات وجوائز\nمأكولات ومشروبات\nعروض مباشرة`}
              />
            </div>

            {/* معلومات إضافية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">رسوم التسجيل (دينار)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.registration_fee}
                  onChange={(e) => setFormData({...formData, registration_fee: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">أقصى عدد مشاركين</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value) || 100})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-3 text-white">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span>الفعالية نشطة</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-semibold transition-colors"
              >
                {event ? '💾 حفظ التعديلات' : '➕ إضافة الفعالية'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded font-semibold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

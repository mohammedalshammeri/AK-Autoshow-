'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    name_en: '',
    description: '',
    description_ar: '',
    description_en: '',
    event_date: '',
    location: '',
    location_ar: '',
    location_en: '',
    status: 'active'
  });

  useEffect(() => {
    // Fetch current event data
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/admin/events/${id}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        const data = await res.json();
        
        let dateStr = '';
        if (data.event_date) {
            const d = new Date(data.event_date);
            // Adjust for timezone offset if necessary, or just use ISO for now
            dateStr = d.toISOString().slice(0, 16); 
        }

        setFormData({
          name: data.name || '',
          name_ar: data.name_ar || '',
          name_en: data.name_en || '',
          description: data.description || '',
          description_ar: data.description_ar || '',
          description_en: data.description_en || '',
          event_date: dateStr,
          location: data.location || '',
          location_ar: data.location_ar || '',
          location_en: data.location_en || '',
          status: data.status || 'upcoming'
        });
      } catch (error) {
        console.error(error);
        alert('Failed to load event data');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update event');
      }

      alert('Event updated successfully!');
      router.push('/admin/events'); 
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6" dir="rtl">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl p-8 border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-yellow-500">تعديل الفعالية</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">اسم الفعالية (عام)</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">اسم الفعالية (En)</label>
              <input type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" placeholder="English Name" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">اسم الفعالية (Ar)</label>
              <input type="text" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" placeholder="الاسم العربي" dir="rtl" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">الوصف (عام)</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">الوصف (En)</label>
              <textarea rows={3} value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" placeholder="English Description" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">الوصف (Ar)</label>
              <textarea rows={3} value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" placeholder="الوصف العربي" dir="rtl" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">الموقع (عام)</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">الموقع (En)</label>
              <input type="text" value={formData.location_en} onChange={e => setFormData({...formData, location_en: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" placeholder="English Location" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">الموقع (Ar)</label>
              <input type="text" value={formData.location_ar} onChange={e => setFormData({...formData, location_ar: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" placeholder="الموقع العربي" dir="rtl" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">الحالة</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-yellow-500"
              >
                <option value="upcoming">قادم (Upcoming)</option>
                <option value="active">نشط (Active)</option>
                <option value="completed">منتهي (Completed)</option>
                <option value="cancelled">ملغي (Cancelled)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
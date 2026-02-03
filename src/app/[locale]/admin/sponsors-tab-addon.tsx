'use client';

import { useState } from 'react';
import { ImageUpload } from '../../../components/admin/ImageUpload';

// Sponsors Tab Component
export function SponsorsTab({ 
  sponsors, 
  onCreateSponsor, 
  onEditSponsor, 
  onDeleteSponsor 
}: {
  sponsors: any[];
  onCreateSponsor: () => void;
  onEditSponsor: (sponsor: any) => void;
  onDeleteSponsor: (id: number, name: string) => void;
}) {
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'diamond': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      default: return '🤝';
    }
  };

  const getTierText = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'ماسي';
      case 'gold': return 'ذهبي';
      case 'silver': return 'فضي';
      default: return 'عادي';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'text-blue-400 bg-blue-900/20 border-blue-500';
      case 'gold': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
      case 'silver': return 'text-gray-400 bg-gray-700/50 border-gray-500';
      default: return 'text-gray-400 bg-gray-800/50 border-gray-600';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-400 border-b border-orange-500 pb-2">
          🤝 إدارة الرعاة ({sponsors.length})
        </h2>
        <button
          onClick={onCreateSponsor}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white px-6 py-2 rounded-lg font-semibold transition-opacity shadow-lg"
        >
          ➕ إضافة راعي جديد
        </button>
      </div>

      {sponsors.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🤝</div>
          <p className="text-xl">لا يوجد رعاة</p>
          <p className="text-gray-500 mt-2">ابدأ بإضافة راعي جديد</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sponsors.map(sponsor => (
            <div key={sponsor.id} className="bg-gray-900 border border-gray-700 hover:border-orange-500 p-6 rounded-lg transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4 flex-1">
                  {/* Logo */}
                  <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden border border-gray-600">
                    {sponsor.logo_url ? (
                      <img 
                        src={sponsor.logo_url} 
                        alt={sponsor.name}
                        className="w-full h-full object-cover"                        onError={(e) => {
                          // إخفاء الصورة المعطلة وإظهار الأيقونة البديلة
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500 text-2xl">🏢</div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">
                        🏢
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{sponsor.name}</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(sponsor.tier)}`}>
                        {getTierIcon(sponsor.tier)} {getTierText(sponsor.tier)}
                      </div>
                    </div>
                    
                    {sponsor.description && (
                      <p className="text-gray-300 mb-2 text-sm">
                        📝 {sponsor.description}
                      </p>
                    )}
                    
                    {sponsor.website_url && (
                      <p className="text-blue-400 mb-2 text-sm">
                        🌐 <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {sponsor.website_url}
                        </a>
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>ترتيب العرض: {sponsor.display_order || 0}</span>
                      <div className={`px-2 py-1 rounded text-xs ${
                        sponsor.is_active 
                          ? 'bg-green-600/20 text-green-400 border border-green-600' 
                          : 'bg-red-600/20 text-red-400 border border-red-600'
                      }`}>
                        {sponsor.is_active ? 'نشط ✓' : 'غير نشط ✗'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onEditSponsor(sponsor)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    ✏️ تعديل
                  </button>
                  <button
                    onClick={() => onDeleteSponsor(sponsor.id, sponsor.name)}
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
    </>
  );
}

// Sponsor Form Component
export function SponsorForm({ 
  sponsor, 
  onSubmit, 
  onCancel 
}: {
  sponsor?: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: sponsor?.name || '',
    logo_url: sponsor?.logo_url || '',
    website_url: sponsor?.website_url || '',
    description: sponsor?.description || '',
    tier: sponsor?.tier || 'gold',
    display_order: sponsor?.display_order || 0,
    is_active: sponsor?.is_active !== undefined ? sponsor.is_active : true
  });
  
  const [uploadedImageUrl, setUploadedImageUrl] = useState(sponsor?.logo_url || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التأكد من وجود صورة مرفوعة
    if (!uploadedImageUrl) {
      alert('يرجى رفع شعار الراعي');
      return;
    }
    
    // استخدام URL الصورة المرفوعة
    const submissionData = {
      ...formData,
      logo_url: uploadedImageUrl
    };
    onSubmit(submissionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-orange-500 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-orange-400">
              {sponsor ? '✏️ تعديل الراعي' : '➕ إضافة راعي جديد'}
            </h2>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-white text-3xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">اسم الراعي *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-orange-500 focus:outline-none"
                required
                placeholder="مثال: شركة البحرين للسيارات"
              />
            </div>            <div>
              <label className="block text-white font-semibold mb-2">شعار الراعي *</label>
              <ImageUpload
                currentImageUrl={uploadedImageUrl}
                onImageUploadedAction={(url: string) => setUploadedImageUrl(url)}
                bucket="sponsors-logos"
                folder="logos"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">الموقع الإلكتروني (اختياري)</label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-orange-500 focus:outline-none"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">الوصف (اختياري)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-orange-500 focus:outline-none"
                rows={3}
                placeholder="وصف الراعي وخدماته..."
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">نوع الرعاية *</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({...formData, tier: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-orange-500 focus:outline-none"
                required
              >
                <option value="diamond">💎 ماسي</option>
                <option value="gold">🥇 ذهبي</option>
                <option value="silver">🥈 فضي</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">ترتيب العرض</label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-orange-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">الحالة</label>
                <select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({...formData, is_active: e.target.value === 'active'})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded focus:border-orange-500 focus:outline-none"
                >
                  <option value="active">نشط ✓</option>
                  <option value="inactive">غير نشط ✗</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white py-3 rounded-lg font-semibold transition-opacity"
              >
                {sponsor ? '💾 حفظ التعديلات' : '➕ إضافة الراعي'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
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
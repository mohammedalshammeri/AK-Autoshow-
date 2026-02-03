'use client';

import { useState } from 'react';

// Gallery Tab Component
export function GalleryTab({ 
  images, 
  onCreateImageAction, 
  onEditImageAction, 
  onDeleteImageAction 
}: {
  images: any[];
  onCreateImageAction: () => void;
  onEditImageAction: (image: any) => void;
  onDeleteImageAction: (id: number, title: string) => void;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400 border-b border-purple-500 pb-2">
          🖼️ إدارة معرض الصور ({images.length})
        </h2>
        <button
          onClick={onCreateImageAction}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-opacity shadow-lg"
        >
          ➕ إضافة صورة جديدة
        </button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-xl">لا توجد صور في المعرض</p>
          <p className="text-gray-500 mt-2">ابدأ بإضافة صور جديدة للمعرض</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images
              .sort((a, b) => (a.display_order || 999) - (b.display_order || 999))
              .map((image) => (
              <div 
                key={image.id} 
                className="bg-gray-900 border border-gray-700 hover:border-purple-500 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
              >
                {/* Image */}
                <div className="relative aspect-video">
                  <img 
                    src={image.image_url} 
                    alt={image.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-hero.jpg';
                    }}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      image.is_active 
                        ? 'bg-green-600/80 text-green-100' 
                        : 'bg-gray-600/80 text-gray-200'
                    }`}>
                      {image.is_active ? '🟢 نشط' : '🔴 غير نشط'}
                    </span>
                  </div>

                  {/* Display Order */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-purple-600/80 text-white px-2 py-1 rounded-full text-xs font-medium">
                      #{image.display_order || 999}
                    </span>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 truncate">
                    {image.title}
                  </h3>
                  
                  {image.description && (
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {image.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-400 mb-3">
                    <p>📅 {new Date(image.created_at).toLocaleDateString('ar')}</p>
                    <p>📁 {image.file_name}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditImageAction(image)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      ✏️ تعديل
                    </button>
                    <button
                      onClick={() => onDeleteImageAction(image.id, image.title)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 p-6 rounded-xl mt-8">
            <h3 className="text-lg font-bold text-purple-300 mb-4">📊 إحصائيات المعرض</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{images.length}</div>
                <div className="text-sm text-gray-300">إجمالي الصور</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {images.filter(img => img.is_active).length}
                </div>
                <div className="text-sm text-gray-300">صور نشطة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">
                  {images.filter(img => !img.is_active).length}
                </div>
                <div className="text-sm text-gray-300">صور غير نشطة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.max(...images.map(img => img.display_order || 0), 0)}
                </div>
                <div className="text-sm text-gray-300">أعلى ترتيب</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Gallery Form Component
export function GalleryForm({ 
  image, 
  onSubmitAction, 
  onCancelAction 
}: {
  image?: any;
  onSubmitAction: (data: any) => void;
  onCancelAction: () => void;
}) {
  const [formData, setFormData] = useState({
    title: image?.title || '',
    description: image?.description || '',
    displayOrder: image?.display_order || 1,
    isActive: image?.is_active !== false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(image?.image_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('يجب اختيار ملف صورة صحيح');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image && !selectedFile) {
      alert('يجب اختيار صورة');
      return;
    }

    setIsSubmitting(true);

    try {
      if (image) {
        // Update existing image (no file upload needed)
        await onSubmitAction({
          title: formData.title,
          description: formData.description,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive
        });
      } else {
        // Create new image (with file)
        await onSubmitAction({
          title: formData.title,
          description: formData.description,
          displayOrder: formData.displayOrder,
          image: selectedFile
        });
      }
    } catch (error) {
      console.error('خطأ في إرسال النموذج:', error);
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-purple-500 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-purple-500">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🖼️</span>
              <h2 className="text-2xl font-bold text-purple-400">
                {image ? '✏️ تعديل صورة المعرض' : '➕ إضافة صورة جديدة'}
              </h2>
            </div>
            <button 
              onClick={onCancelAction}
              className="text-gray-400 hover:text-white text-3xl transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Preview & Upload */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Preview */}
              <div>
                <label className="block text-white font-semibold mb-3">معاينة الصورة</label>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 aspect-video bg-gray-800">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="معاينة" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🖼️</div>
                        <p>لا توجد صورة محددة</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  {image ? 'تغيير الصورة (اختياري)' : 'اختيار الصورة *'}
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:border-purple-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    required={!image}
                  />
                  
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>📋 متطلبات الصورة:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>أنواع مدعومة: JPG, PNG, GIF, WebP</li>
                      <li>الحد الأقصى للحجم: 5 ميجابايت</li>
                      <li>الأبعاد المثلى: 1920x1080 أو أعلى</li>
                      <li>نسبة العرض إلى الارتفاع: 16:9 مفضلة</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-white font-semibold mb-2">عنوان الصورة *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="مثال: سيارة فيراري 488 GTB"
                  required
                  maxLength={100}
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-white font-semibold mb-2">ترتيب العرض</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 1})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="1"
                  min="1"
                  max="999"
                />
                <p className="text-xs text-gray-400 mt-1">
                  الصور ذات الترتيب الأقل تظهر أولاً (1 = الأول)
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-semibold mb-2">وصف الصورة (اختياري)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                rows={3}
                placeholder="وصف مختصر للصورة..."
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.description.length}/500 حرف
              </p>
            </div>

            {/* Active Status (for editing only) */}
            {image && (
              <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-white font-medium">
                  🟢 عرض الصورة في المعرض العام
                </label>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-opacity shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </span>
                ) : (
                  image ? '💾 حفظ التعديلات' : '➕ إضافة للمعرض'
                )}
              </button>
              <button
                type="button"
                onClick={onCancelAction}
                disabled={isSubmitting}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
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

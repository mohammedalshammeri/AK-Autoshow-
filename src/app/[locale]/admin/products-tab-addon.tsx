'use client';

import { useState } from 'react';

// Products Tab Component
export function ProductsTab({
  products,
  onCreateProductAction,
  onEditProductAction,
  onDeleteProductAction
}: {
  products: any[];
  onCreateProductAction: () => void;
  onEditProductAction: (product: any) => void;
  onDeleteProductAction: (id: number, name: string) => void;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-400 border-b border-green-500 pb-2">
          🛍️ إدارة المنتجات ({products.length})
        </h2>
        <button
          onClick={onCreateProductAction}
          className="bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-opacity shadow-lg"
        >
          ➕ إضافة منتج جديد
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="text-xl">لا توجد منتجات</p>
          <p className="text-gray-500 mt-2">ابدأ بإضافة منتجات جديدة</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">            {products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-600 hover:border-green-400 rounded-2xl overflow-hidden transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/25"
              >
                {/* Glassmorphism Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={product.image_url || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.jpg';
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  
                  {/* Video Indicator */}
                  {product.video_url && (
                    <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      🎥 فيديو
                    </div>
                  )}

                  {/* Status & Quantity */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      product.is_active
                        ? 'bg-green-500/90 text-white shadow-lg shadow-green-500/25'
                        : 'bg-gray-500/90 text-gray-200'
                    }`}>
                      {product.is_active ? '✨ نشط' : '⏸️ معطل'}
                    </span>
                    <span className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      📦 {product.quantity}
                    </span>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute bottom-4 left-4 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-xl">
                    {product.price} <span className="text-sm font-medium">د.ب</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
                      {product.name_ar || product.name_en || product.name || 'منتج'}
                    </h3>
                    {(product.name_en && product.name_ar && product.name_ar !== product.name_en) && (
                      <p className="text-sm text-gray-400 font-medium">
                        {product.name_en}
                      </p>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                      {product.description_ar || product.description_en || product.description}
                    </p>
                  )}

                  {/* Tags & Sizes */}
                  <div className="flex flex-wrap gap-2">
                    {product.sizes && product.sizes.length > 0 && (
                      <>
                        {product.sizes.slice(0, 3).map((size: string) => (
                          <span key={size} className="bg-gray-700/50 border border-gray-600 text-gray-300 px-2 py-1 rounded-md text-xs">
                            {size}
                          </span>
                        ))}
                        {product.sizes.length > 3 && (
                          <span className="text-gray-400 text-xs">+{product.sizes.length - 3}</span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 border-t border-gray-700 pt-3">
                    📅 {new Date(product.created_at).toLocaleDateString('ar-BH', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => onEditProductAction(product)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                    >
                      <span>✏️</span>
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => onDeleteProductAction(product.id, (product.name_ar || product.name_en || product.name || 'منتج'))}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2"
                    >
                      <span>🗑️</span>
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// Product Form Component
export function ProductForm({
  product,
  onSaveAction,
  onCancelAction
}: {
  product: any | null;
  onSaveAction: (productData: any) => void;
  onCancelAction: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    name_ar: product?.name_ar || '',
    name_en: product?.name_en || '',
    description: product?.description || '',
    description_ar: product?.description_ar || '',
    description_en: product?.description_en || '',
    price: product?.price || '',
    quantity: product?.quantity || '',
    sizes: product?.sizes || [],
    image_url: product?.image_url || '',    video_url: product?.video_url || '',
    is_active: product?.is_active ?? true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // إنشاء FormData لإرسال الملفات
    const form = new FormData();
    
    // إضافة ID للتحديث
    const payload = product ? { ...formData, id: product.id } : formData;
    form.append('payload', JSON.stringify(payload));
    
    if (imageFile) {
      form.append('image', imageFile);
    }
    
    if (videoFile) {
      form.append('video', videoFile);
    }
    
    // إرسال البيانات مع الملفات
    try {
      const response = await fetch('/api/products', {
        method: product ? 'PUT' : 'POST',
        body: form, // FormData بدل JSON
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        alert(product ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!');
        onSaveAction(result.data); // إرسال البيانات المحدثة
      } else {
        alert(`خطأ: ${result.error}`);
      }
    } catch (error) {
      console.error('خطأ في إرسال البيانات:', error);
      alert('حدث خطأ في إرسال البيانات');
    }
  };

  const addSize = () => {
    if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, sizeInput.trim()]
      }));
      setSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((s: string) => s !== size)
    }));
  };

  const [sizeInput, setSizeInput] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-green-500 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-400">
              {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h2>
            <button
              onClick={onCancelAction}
              className="text-gray-400 hover:text-white text-3xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-white font-medium mb-2">الاسم (إنجليزي)</label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">الاسم (عربي)</label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2">الوصف (إنجليزي)</label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none h-24"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">الوصف (عربي)</label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none h-24"
              />
            </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">السعر (BHD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">الكمية</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-white font-medium mb-2">المقاسات</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="أضف مقاس (مثل: S, M, L)"
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ➕
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size: string) => (
                  <span
                    key={size}
                    className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-white font-medium mb-2">صورة المنتج (PNG/JPG اختياري)</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-300"
              />
              {imageFile && (
                <p className="text-xs text-green-400 mt-1">سيتم رفع: {imageFile.name}</p>
              )}
              {formData.image_url && !imageFile && (
                <div className="mt-3">
                  <img src={formData.image_url} alt="Product image" className="w-full max-h-48 object-cover rounded-lg border border-gray-700" />
                </div>
              )}
              {uploadingImage && (
                <p className="text-xs text-yellow-400 mt-1">جاري رفع الصورة...</p>
              )}
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-white font-medium mb-2">فيديو المنتج (MP4/WebM اختياري)</label>
              <input
                type="file"
                accept="video/mp4,video/webm"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-300"
              />
              {videoFile && (
                <p className="text-xs text-green-400 mt-1">سيتم رفع: {videoFile.name}</p>
              )}
              {formData.video_url && !videoFile && (
                <div className="mt-3">
                  <video src={formData.video_url} controls className="w-full max-h-48 rounded-lg border border-gray-700" />
                </div>
              )}
              {uploadingVideo && (
                <p className="text-xs text-yellow-400 mt-1">جاري رفع الفيديو...</p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-white font-medium">نشط</label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90 text-white py-3 rounded-lg font-semibold transition-opacity"
              >
                {product ? '💾 حفظ التغييرات' : '➕ إضافة المنتج'}
              </button>
              <button
                type="button"
                onClick={onCancelAction}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
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

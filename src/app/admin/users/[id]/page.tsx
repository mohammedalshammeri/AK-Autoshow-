'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'admin',
    password: '', // Optional for edit
  });

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users?id=${userId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          const user = data.user;
          setFormData({
            full_name: user?.full_name || '',
            email: user?.email || '',
            role: user?.role || 'admin',
            password: '', // Don't fill password
          });
        } else {
          setError('لم يتم العثور على المستخدم');
        }
      } catch (err) {
        setError('حدث خطأ في تحميل بيانات المستخدم');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // NOTE: We probably need a PUT/PATCH endpoint for updates. 
      // The current route.ts only has GET, POST (create), DELETE.
      // I will need to implement PUT in the API route immediately after this.
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          ...formData
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('تم تحديث بيانات المستخدم بنجاح');
        router.push('/admin/users');
      } else {
        setError(result.error || 'فشل تحديث البيانات');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError('حدث خطأ في النظام');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 text-white" dir="rtl">
      <div className="max-w-2xl mx-auto pt-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">✏️ تعديل بيانات المستخدم</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← إلغاء وعودة
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-8 shadow-xl">
          
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الاسم الكامل
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Email - Read Only usually, but let's allow edit if needed */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                كلمة المرور الجديدة (اختياري)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="اتركه فارغاً للاحتفاظ بكلمة المرور الحالية"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الصلاحية / الدور
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="admin">مدير (Admin)</option>
                <option value="super_admin">مدير عام (Super Admin)</option>
                <option value="viewer">مشاهد فقط (Viewer)</option>
                <option value="editor">محرر (Editor)</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3 px-4 rounded-lg font-bold text-lg text-white transition-all
                  ${saving 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                  }`}
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

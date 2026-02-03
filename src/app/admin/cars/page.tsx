'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  status: string;
  created_at: string;
  images?: string[];
}

export default function CarManagement() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/check', {
          credentials: 'include'
        });

        if (!response.ok) {
          router.replace('/admin/login');
          return;
        }

        const data = await response.json();
        if (!data.authenticated) {
          router.replace('/admin/login');
          return;
        }

        // Load cars
        await loadCars();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cars', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCars(data.cars || []);
      } else {
        setError('Failed to load cars');
      }
    } catch (error) {
      setError('Network error loading cars');
    } finally {
      setLoading(false);
    }
  };
  const handleBackToDashboard = () => {
    router.push('/admin/dashboard');
  };

  const handleStatusChange = async (carId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/cars/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          carId,
          status: newStatus
        }),
      });

      if (response.ok) {
        await loadCars(); // Reload cars
        alert(`تم ${newStatus === 'approved' ? 'الموافقة على' : 'رفض'} الطلب بنجاح`);
      } else {
        alert('حدث خطأ في تحديث حالة السيارة');
      }
    } catch (error) {
      console.error('Error updating car status:', error);
      alert('حدث خطأ في الاتصال');
    }
  };

  const filteredCars = cars.filter(car => {
    if (filter === 'all') return true;
    return car.status === filter;
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">جاري تحميل السيارات...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🚗 إدارة السيارات</h1>
            <p className="text-gray-400">إدارة طلبات تسجيل السيارات والموافقة عليها</p>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← العودة للوحة الرئيسية
            </button>
            <button
              onClick={() => router.push('/admin/cars/add')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + إضافة سيارة جديدة
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 space-x-reverse mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            الكل ({cars.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            معلقة ({cars.filter(c => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'approved' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            موافق عليها ({cars.filter(c => c.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            مرفوضة ({cars.filter(c => c.status === 'rejected').length})
          </button>
        </div>        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Cars Table */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">📋 طلبات تسجيل السيارات</h2>
          </div>
          
          {filteredCars.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🚗</div>
              <div className="text-gray-400 text-lg">لا توجد سيارات</div>
              <p className="text-gray-500 mt-2">لا توجد حالياً أي طلبات تسجيل سيارات في النظام.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="text-right p-4 text-gray-300 font-medium">تفاصيل السيارة</th>
                    <th className="text-right p-4 text-gray-300 font-medium">المالك</th>
                    <th className="text-right p-4 text-gray-300 font-medium">البريد الإلكتروني</th>
                    <th className="text-right p-4 text-gray-300 font-medium">رقم الهاتف</th>
                    <th className="text-right p-4 text-gray-300 font-medium">الحالة</th>
                    <th className="text-right p-4 text-gray-300 font-medium">تاريخ التسجيل</th>
                    <th className="text-right p-4 text-gray-300 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredCars.map((car) => (                    <tr key={car.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 text-white text-right">
                        <div className="font-medium">🚗 {car.make} {car.model}</div>
                        <div className="text-gray-400 text-sm">سنة الصنع: {car.year}</div>
                      </td>
                      <td className="p-4 text-gray-300 text-right">{car.owner_name}</td>
                      <td className="p-4 text-gray-300 text-right">{car.owner_email}</td>
                      <td className="p-4 text-gray-300 text-right">{car.owner_phone || 'غير متوفر'}</td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          car.status === 'approved' 
                            ? 'bg-green-900/50 text-green-400' 
                            : car.status === 'pending'
                            ? 'bg-yellow-900/50 text-yellow-400'
                            : 'bg-red-900/50 text-red-400'
                        }`}>
                          {car.status === 'approved' ? '✅ موافق عليها' 
                           : car.status === 'pending' ? '⏳ معلقة'
                           : '❌ مرفوضة'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 text-right">
                        {new Date(car.created_at).toLocaleDateString('ar-BH')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center space-x-2 space-x-reverse justify-end">
                          <button 
                            onClick={() => router.push(`/admin/cars/${car.id}`)}
                            className="text-blue-400 hover:text-blue-300 text-sm bg-blue-900/30 px-2 py-1 rounded"
                          >
                            👁️ عرض
                          </button>
                          {car.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleStatusChange(car.id, 'approved')}
                                className="text-green-400 hover:text-green-300 text-sm bg-green-900/30 px-2 py-1 rounded"
                              >
                                ✅ موافقة
                              </button>
                              <button 
                                onClick={() => handleStatusChange(car.id, 'rejected')}
                                className="text-red-400 hover:text-red-300 text-sm bg-red-900/30 px-2 py-1 rounded"
                              >
                                ❌ رفض
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-gray-400 text-sm">إجمالي السيارات</p>
                <p className="text-white text-2xl font-bold">{cars.length}</p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <span className="text-2xl">🚗</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-gray-400 text-sm">طلبات معلقة</p>
                <p className="text-white text-2xl font-bold">
                  {cars.filter(c => c.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-600/20 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-gray-400 text-sm">طلبات موافق عليها</p>
                <p className="text-white text-2xl font-bold">
                  {cars.filter(c => c.status === 'approved').length}
                </p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-gray-400 text-sm">طلبات مرفوضة</p>
                <p className="text-white text-2xl font-bold">
                  {cars.filter(c => c.status === 'rejected').length}
                </p>
              </div>
              <div className="p-3 bg-red-600/20 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

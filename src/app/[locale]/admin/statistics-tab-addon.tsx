'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface StatisticsTabProps { 
  registrations: any[], 
  sponsors: any[] 
}

export function StatisticsTab({ registrations, sponsors }: StatisticsTabProps) {
  const totalParticipants = registrations.length;
  const pendingCount = registrations.filter((r) => r.status === 'pending').length;
  const approvedCount = registrations.filter((r) => r.status === 'approved').length;
  const rejectedCount = registrations.filter((r) => r.status === 'rejected').length;

  // إحصائيات الماركات
  const makesMap = new Map<string, number>();
  registrations.forEach((r) => {
    const make = r.car_make || 'غير معروف';
    makesMap.set(make, (makesMap.get(make) || 0) + 1);
  });
  const carMakes = Array.from(makesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // إحصائيات الموديلات
  const modelsMap = new Map<string, number>();
  registrations.forEach((r) => {
    const model = r.car_model || 'غير معروف';
    modelsMap.set(model, (modelsMap.get(model) || 0) + 1);
  });
  const carModels = Array.from(modelsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // إحصائيات السنوات
  const yearsMap = new Map<string, number>();
  registrations.forEach((r) => {
    const year = r.car_year?.toString() || 'غير معروف';
    yearsMap.set(year, (yearsMap.get(year) || 0) + 1);
  });
  const carYears = Array.from(yearsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // إحصائيات الدول (استخراج من رقم الهاتف)
  const countriesMap = new Map<string, number>();
  registrations.forEach((r) => {
    let country = 'غير معروف';
    const phone = r.phone_number;
    if (phone) {
      if (phone.startsWith('+966')) country = '🇸🇦 السعودية';
      else if (phone.startsWith('+971')) country = '🇦🇪 الإمارات';
      else if (phone.startsWith('+974')) country = '🇶🇦 قطر';
      else if (phone.startsWith('+973')) country = '🇧🇭 البحرين';
      else if (phone.startsWith('+965')) country = '🇰🇼 الكويت';
      else if (phone.startsWith('+968')) country = '🇴🇲 عمان';
      else if (phone.startsWith('+20')) country = '🇪🇬 مصر';
      else if (phone.startsWith('+962')) country = '🇯🇴 الأردن';
      else if (phone.startsWith('+961')) country = '🇱🇧 لبنان';
      else if (phone.startsWith('+963')) country = '🇸🇾 سوريا';
      else if (phone.startsWith('+964')) country = '🇮🇶 العراق';
      else if (phone.startsWith('+967')) country = '🇾🇪 اليمن';
      else if (phone.startsWith('+216')) country = '🇹🇳 تونس';
      else if (phone.startsWith('+213')) country = '🇩🇿 الجزائر';
      else if (phone.startsWith('+212')) country = '🇲🇦 المغرب';
      else if (phone.startsWith('+218')) country = '🇱🇾 ليبيا';
      else if (phone.startsWith('+222')) country = '🇲🇷 موريتانيا';
      else if (phone.startsWith('+249')) country = '🇸🇩 السودان';
      else if (phone.startsWith('+252')) country = '🇸🇴 الصومال';
      else if (phone.startsWith('+253')) country = '🇩🇯 جيبوتي';
      else country = '🌍 دولة أخرى';
    }
    countriesMap.set(country, (countriesMap.get(country) || 0) + 1);
  });
  const countries = Array.from(countriesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // بيانات الرسوم البيانية
  const carMakesData = {
    labels: carMakes.map(([make]) => make),
    datasets: [{
      label: 'عدد المشاركين',
      data: carMakes.map(([, count]) => count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)',
        'rgba(14, 165, 233, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(251, 146, 60, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)', 'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)', 'rgba(139, 92, 246, 1)', 'rgba(236, 72, 153, 1)',
        'rgba(14, 165, 233, 1)', 'rgba(34, 197, 94, 1)', 'rgba(251, 146, 60, 1)',
        'rgba(168, 85, 247, 1)'
      ],
      borderWidth: 2,
    }],
  };

  const carModelsData = {
    labels: carModels.map(([model]) => model),
    datasets: [{
      label: 'عدد المشاركين',
      data: carModels.map(([, count]) => count),
      backgroundColor: 'rgba(139, 92, 246, 0.7)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 1,
    }],
  };

  const countriesData = {
    labels: countries.map(([country]) => country),
    datasets: [{
      label: 'عدد المشاركين',
      data: countries.map(([, count]) => count),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)', 'rgba(83, 102, 255, 0.8)', 'rgba(255, 99, 255, 0.8)',
        'rgba(99, 255, 132, 0.8)'
      ],
      borderWidth: 1,
    }],
  };

  const statusData = {
    labels: ['معلقة', 'مقبولة', 'مرفوضة'],
    datasets: [{
      label: 'عدد الطلبات',
      data: [pendingCount, approvedCount, rejectedCount],
      backgroundColor: [
        'rgba(251, 191, 36, 0.8)', // yellow
        'rgba(34, 197, 94, 0.8)',  // green
        'rgba(248, 113, 113, 0.8)', // red
      ],
      borderColor: [
        'rgba(251, 191, 36, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(248, 113, 113, 1)',
      ],
      borderWidth: 2,
    }],
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          📊 إحصائيات معرض AK Auto Show
        </h1>
        <p className="text-gray-400 text-lg">تحليل شامل للمشاركين والفعاليات</p>
      </div>

      {/* Summary Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-500/40 rounded-xl p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-blue-400 text-sm font-semibold">المجموع</span>
          </div>
          <h3 className="text-3xl font-bold text-blue-300 mb-1">{totalParticipants}</h3>
          <p className="text-blue-200/70 text-sm">مشارك مسجل</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border border-yellow-500/40 rounded-xl p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <span className="text-yellow-400 text-sm font-semibold">معلقة</span>
          </div>
          <h3 className="text-3xl font-bold text-yellow-300 mb-1">{pendingCount}</h3>
          <p className="text-yellow-200/70 text-sm">بانتظار المراجعة</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-500/40 rounded-xl p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <span className="text-green-400 text-sm font-semibold">مقبولة</span>
          </div>
          <h3 className="text-3xl font-bold text-green-300 mb-1">{approvedCount}</h3>
          <p className="text-green-200/70 text-sm">مشارك مؤكد</p>
        </div>

        <div className="bg-gradient-to-br from-red-900/50 to-red-800/50 border border-red-500/40 rounded-xl p-6 hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
            <span className="text-red-400 text-sm font-semibold">مرفوضة</span>
          </div>
          <h3 className="text-3xl font-bold text-red-300 mb-1">{rejectedCount}</h3>
          <p className="text-red-200/70 text-sm">طلب مرفوض</p>
        </div>
      </div>

      {/* Sponsors Statistics */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <span className="text-3xl mr-3">🤝</span>
          <div>
            <h2 className="text-2xl font-bold text-white">إحصائيات الرعاة</h2>
            <p className="text-purple-300 text-sm">شركاء النجاح في المعرض</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{sponsors.length}</div>
            <div className="text-sm text-gray-300">إجمالي الرعاة</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-pink-400 mb-1">{sponsors.filter(s => s.is_active).length}</div>
            <div className="text-sm text-gray-300">رعاة نشطين</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">{sponsors.filter(s => s.logo_url).length}</div>
            <div className="text-sm text-gray-300">مع شعارات</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">📈</span>
            <div>
              <h2 className="text-xl font-semibold text-white">توزيع حالات الطلبات</h2>
              <p className="text-gray-400 text-sm">نظرة عامة على حالة المشاركات</p>
            </div>
          </div>
          <div className="h-80">
            <Bar
              data={statusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { ticks: { color: '#e5e7eb' } },
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, color: '#e5e7eb' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Countries Distribution */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">🌍</span>
            <div>
              <h2 className="text-xl font-semibold text-white">توزيع المشاركين حسب الدولة</h2>
              <p className="text-gray-400 text-sm">المشاركة الدولية في المعرض</p>
            </div>
          </div>
          {countries.length === 0 ? (
            <p className="text-gray-400 text-center py-12">لا توجد بيانات كافية لعرض الإحصائيات.</p>
          ) : (
            <div className="h-80">
              <Bar
                data={countriesData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { beginAtZero: true, ticks: { stepSize: 1, color: '#e5e7eb' } },
                    y: { ticks: { color: '#e5e7eb' } },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          )}
        </div>

        {/* Car Makes */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">🚗</span>
            <div>
              <h2 className="text-xl font-semibold text-white">أكثر الماركات مشاركة</h2>
              <p className="text-gray-400 text-sm">الماركات الأكثر حضوراً</p>
            </div>
          </div>
          {carMakes.length === 0 ? (
            <p className="text-gray-400 text-center py-12">لا توجد بيانات كافية لعرض الإحصائيات.</p>
          ) : (
            <div className="h-80">
              <Bar
                data={carMakesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { beginAtZero: true, ticks: { stepSize: 1, color: '#e5e7eb' } },
                    y: { ticks: { color: '#e5e7eb' } },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          )}
        </div>

        {/* Car Models */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">🏎️</span>
            <div>
              <h2 className="text-xl font-semibold text-white">أكثر الموديلات مشاركة</h2>
              <p className="text-gray-400 text-sm">الموديلات الأكثر شعبية</p>
            </div>
          </div>
          {carModels.length === 0 ? (
            <p className="text-gray-400 text-center py-12">لا توجد بيانات كافية لعرض الإحصائيات.</p>
          ) : (
            <div className="h-80">
              <Bar
                data={carModelsData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { beginAtZero: true, ticks: { stepSize: 1, color: '#e5e7eb' } },
                    y: { ticks: { color: '#e5e7eb' } },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

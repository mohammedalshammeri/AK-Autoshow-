'use client';

import { useState, useEffect, use } from 'react';
import { getEventLeaderboard } from '@/actions/racer-actions';
import { getEventDetails } from '@/actions/event-admin-actions';
import Link from 'next/link';

export default function EventLeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadData();

    // Auto-refresh every 30 seconds
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [eventId, autoRefresh]);

  const loadData = async () => {
    const [leaderboardRes, eventRes] = await Promise.all([
      getEventLeaderboard(eventId, 50),
      getEventDetails(eventId)
    ]);

    if (leaderboardRes.success) setLeaderboard(leaderboardRes.data);
    if (eventRes.success) setEvent(eventRes.data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-8" dir="rtl">
      {/* Header */}
      <header className="text-center mb-8 pb-6 border-b border-gray-800">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 mb-3">
          🏁 النتائج المباشرة
        </h1>
        <h2 className="text-2xl text-white mb-2">{event?.name}</h2>
        <p className="text-gray-400">{event?.location} • {event?.date ? new Date(event.date).toLocaleDateString('ar') : ''}</p>
        
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              autoRefresh 
                ? 'bg-green-900/30 text-green-400 border border-green-800' 
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            {autoRefresh ? '🔄 التحديث التلقائي مفعّل' : '⏸️ التحديث التلقائي متوقف'}
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-900/30 text-blue-400 border border-blue-800 hover:bg-blue-900/50 transition"
          >
            🔄 تحديث يدوي
          </button>
        </div>
      </header>

      {/* Podium - Top 3 */}
      {leaderboard.length >= 3 && (
        <div className="mb-12 flex justify-center items-end gap-4 max-w-4xl mx-auto">
          {/* 2nd Place */}
          <div className="flex-1 text-center">
            <div className="bg-gradient-to-br from-gray-500 to-gray-700 rounded-t-3xl p-6 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-2xl font-bold text-black border-4 border-gray-900">
                2
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-white mb-1">{leaderboard[1].full_name}</div>
                <div className="text-sm text-gray-300 mb-2">{leaderboard[1].car_make} {leaderboard[1].car_model}</div>
                <div className="text-3xl font-bold text-yellow-300">{leaderboard[1].best_score}</div>
              </div>
            </div>
            <div className="bg-gray-600 h-24 rounded-b-xl"></div>
          </div>

          {/* 1st Place */}
          <div className="flex-1 text-center">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-t-3xl p-8 relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-3xl font-bold text-black border-4 border-gray-900 shadow-lg shadow-yellow-500/50">
                👑
              </div>
              <div className="mt-6">
                <div className="text-3xl font-bold text-black mb-1">{leaderboard[0].full_name}</div>
                <div className="text-sm text-yellow-900 mb-3">{leaderboard[0].car_make} {leaderboard[0].car_model}</div>
                <div className="text-4xl font-bold text-black">{leaderboard[0].best_score}</div>
              </div>
            </div>
            <div className="bg-yellow-600 h-32 rounded-b-xl"></div>
          </div>

          {/* 3rd Place */}
          <div className="flex-1 text-center">
            <div className="bg-gradient-to-br from-amber-700 to-amber-900 rounded-t-3xl p-6 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center text-2xl font-bold text-white border-4 border-gray-900">
                3
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-white mb-1">{leaderboard[2].full_name}</div>
                <div className="text-sm text-amber-300 mb-2">{leaderboard[2].car_make} {leaderboard[2].car_model}</div>
                <div className="text-3xl font-bold text-yellow-300">{leaderboard[2].best_score}</div>
              </div>
            </div>
            <div className="bg-amber-800 h-20 rounded-b-xl"></div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="max-w-5xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">الترتيب الكامل</h3>
        
        <div className="bg-gray-900/80 backdrop-blur rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-800/80 text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
                  <th className="p-4 font-medium w-16">الترتيب</th>
                  <th className="p-4 font-medium">المتسابق</th>
                  <th className="p-4 font-medium">السيارة</th>
                  <th className="p-4 font-medium">الفئة</th>
                  <th className="p-4 font-medium text-center">أفضل نقطة</th>
                  <th className="p-4 font-medium text-center">التأهلات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leaderboard.map((racer, idx) => (
                  <tr 
                    key={idx} 
                    className={`hover:bg-gray-800/40 transition-colors ${
                      idx < 3 ? 'bg-yellow-900/10' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-yellow-500 text-black' :
                        idx === 1 ? 'bg-gray-400 text-black' :
                        idx === 2 ? 'bg-amber-700 text-white' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-lg">{racer.full_name}</div>
                      {racer.username && (
                        <div className="text-xs text-gray-500">@{racer.username}</div>
                      )}
                    </td>
                    <td className="p-4 text-gray-300">
                      {racer.car_make} {racer.car_model}
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-900">
                        {racer.car_category}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-400">{racer.best_score}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-xl font-bold text-green-400">{racer.qualified_count}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-3">🏁</div>
              <p>لا توجد نتائج حتى الآن. السباق لم يبدأ بعد!</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-gray-500 text-sm">
        <p>يتم تحديث النتائج تلقائياً كل 30 ثانية</p>
      </div>
    </div>
  );
}

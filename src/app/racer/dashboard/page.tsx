'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { getRacerRounds, getRacerStats, getEventLeaderboard } from '@/actions/racer-actions';

interface RacerUser {
  id: string;
  username: string;
  fullName: string;
  carMake: string;
  carModel: string;
  carCategory: string;
  eventId: string;
  registrationStatus: string;
}

export default function RacerDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<RacerUser | null>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const basePrefix = pathname?.startsWith('/ar') ? '/ar' : pathname?.startsWith('/en') ? '/en' : '';

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const res = await fetch('/api/racer/auth/check');
      if (!res.ok) {
        router.replace(`${basePrefix}/racer/login`);
        return;
      }

      const data = await res.json();
      if (!data.authenticated) {
        router.replace(`${basePrefix}/racer/login`);
        return;
      }

      setUser(data.user);
      
      // Load racer data
      const registrationId = await getRegistrationId(data.user.id);
      if (registrationId) {
        await loadRacerData(registrationId, data.user.eventId);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Auth error:', error);
      router.replace(`${basePrefix}/racer/login`);
    }
  };

  const getRegistrationId = async (userId: string) => {
    try {
      const res = await fetch(`/api/racer/registration?userId=${userId}`);
      const data = await res.json();
      return data.success ? data.registrationId : null;
    } catch {
      return null;
    }
  };

  const loadRacerData = async (registrationId: string, eventId: string) => {
    const [roundsRes, statsRes, leaderboardRes] = await Promise.all([
      getRacerRounds(registrationId),
      getRacerStats(eventId, registrationId),
      getEventLeaderboard(eventId, 10)
    ]);

    if (roundsRes.success) setRounds(roundsRes.data);
    if (statsRes.success) setStats(statsRes.data);
    if (leaderboardRes.success) setLeaderboard(leaderboardRes.data);
  };

  const handleLogout = async () => {
    await fetch('/api/racer/auth/logout', { method: 'POST' });
    router.push(`${basePrefix}/racer/login`);
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
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-600">
            🏁 لوحة التحكم - المتسابق
          </h1>
          <p className="text-gray-400 mt-1">مرحباً {user?.fullName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 md:mt-0 bg-red-900/30 hover:bg-red-900/50 text-red-400 px-5 py-2 rounded-xl transition border border-red-900/50"
        >
          تسجيل الخروج
        </button>
      </header>

      {/* Profile */}
      <section className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <h2 className="text-2xl font-bold">📌 بياناتي</h2>
          {user?.registrationStatus && (
            <span
              className={`text-xs px-3 py-1 rounded-full border font-bold ${
                user.registrationStatus === 'approved'
                  ? 'bg-green-900/30 text-green-400 border-green-900/60'
                  : user.registrationStatus === 'pending'
                    ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900/60'
                    : user.registrationStatus === 'rejected'
                      ? 'bg-red-900/30 text-red-400 border-red-900/60'
                      : 'bg-gray-800 text-gray-300 border-gray-700'
              }`}
            >
              الحالة: {user.registrationStatus}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">الاسم</div>
            <div className="text-lg font-bold text-white truncate">{user?.fullName || '-'}</div>
          </div>

          <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">اسم المستخدم</div>
            <div className="text-lg font-bold text-white truncate" dir="ltr">{user?.username || '-'}</div>
          </div>

          <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">الفئة</div>
            <div className="text-lg font-bold text-white truncate">{user?.carCategory || '-'}</div>
          </div>

          <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">السيارة</div>
            <div className="text-lg font-bold text-white truncate">{user?.carMake || '-'} {user?.carModel || ''}</div>
          </div>

          <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">رقم الحدث</div>
            <div className="text-lg font-bold text-white" dir="ltr">{user?.eventId || '-'}</div>
          </div>

          <div className="bg-black/30 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">ملاحظة</div>
            <div className="text-sm text-gray-300 leading-relaxed">
              بيانات الدخول وصلت لك بالإيميل بعد القبول.
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">أفضل نقطة</div>
          <div className="text-3xl font-bold text-yellow-400">{stats?.bestScore || 0}</div>
        </div>
        <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">الترتيب</div>
          <div className="text-3xl font-bold text-green-400">
            #{stats?.rank || '-'} <span className="text-sm text-gray-500">/ {stats?.totalParticipants || 0}</span>
          </div>
        </div>
        <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">التأهلات</div>
          <div className="text-3xl font-bold text-blue-400">{stats?.qualifiedRounds || 0}</div>
        </div>
        <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">السيارة</div>
          <div className="text-sm font-bold text-white truncate">{user?.carMake} {user?.carModel}</div>
          <div className="text-xs text-gray-500 mt-1">{user?.carCategory}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Rounds */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🏆</span> جولاتي
          </h2>
          
          {rounds.length === 0 ? (
            <div className="bg-gray-900/50 p-12 rounded-2xl border border-gray-800 text-center text-gray-500">
              <div className="text-4xl mb-3">📭</div>
              <p>لم يتم إضافتك لأي جولة بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rounds.map((round) => (
                <div key={round.id} className="bg-gray-900/80 border border-gray-800 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{round.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                        round.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                        round.status === 'active' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {round.status === 'active' ? 'جاري السباق 🏁' : round.status === 'completed' ? 'مكتمل ✅' : 'قيد الانتظار ⏳'}
                      </span>
                    </div>
                    {round.is_qualified && (
                      <span className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm font-bold border border-green-800">
                        متأهل ✅
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/30 p-4 rounded-xl text-center">
                      <div className="text-xs text-gray-500 mb-1">المحاولة 1</div>
                      <div className="text-2xl font-bold text-yellow-400">{round.run_1_score || '-'}</div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-xl text-center">
                      <div className="text-xs text-gray-500 mb-1">المحاولة 2</div>
                      <div className="text-2xl font-bold text-yellow-400">{round.run_2_score || '-'}</div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-xl text-center border-2 border-green-900/50">
                      <div className="text-xs text-gray-500 mb-1">النهائي</div>
                      <div className="text-3xl font-bold text-green-400">{round.final_score || '-'}</div>
                    </div>
                  </div>

                  {round.notes && (
                    <div className="mt-4 bg-blue-900/20 border border-blue-900/30 p-3 rounded-xl">
                      <div className="text-xs text-blue-400 mb-1">ملاحظات الحكم</div>
                      <div className="text-sm text-gray-300">{round.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📊</span> الترتيب العام
          </h2>
          
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm">لا توجد نتائج بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {leaderboard.map((racer, idx) => (
                  <div
                    key={idx}
                    className={`p-4 flex items-center gap-3 ${
                      racer.username === user?.username ? 'bg-yellow-900/20 border-l-4 border-yellow-500' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx === 0 ? 'bg-yellow-500 text-black' :
                      idx === 1 ? 'bg-gray-400 text-black' :
                      idx === 2 ? 'bg-amber-700 text-white' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm truncate">{racer.full_name}</div>
                      <div className="text-xs text-gray-500">{racer.car_make} {racer.car_model}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-400">{racer.best_score}</div>
                      <div className="text-xs text-gray-500">{racer.qualified_count} تأهل</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

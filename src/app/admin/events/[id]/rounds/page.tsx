'use client';

import { useState, useEffect, use } from 'react';
import { getRounds, createRound, deleteRound } from '@/actions/rounds-actions';
import { getEventDetails } from '@/actions/event-admin-actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoundsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [rounds, setRounds] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    const [roundsRes, eventRes] = await Promise.all([
        getRounds(id),
        getEventDetails(id)
    ]);
    
    if (roundsRes.success) setRounds(roundsRes.data);
    if (eventRes.success) setEvent(eventRes.data);
    setLoading(false);
  };

  const handleCreate = async (name: string, order: number) => {
      if (!confirm(`إنشاء جولة جديدة: ${name}؟`)) return;
      setIsCreating(true);
      const res = await createRound(id, name, order);
      if (res.success) {
          loadData();
      } else {
          alert('خطأ: ' + res.error);
      }
      setIsCreating(false);
  };

  const handleDelete = async (roundId: string) => {
      if(!confirm('هل أنت متأكد من حذف هذه الجولة؟ سيتم حذف جميع النتائج المرتبطة بها.')) return;
      await deleteRound(roundId, id);
      loadData();
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-8" dir="rtl">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-800 pb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-yellow-400 to-yellow-600">
                    🏆 جولات السباق: {event?.name}
                </h1>
                <p className="text-gray-400 mt-1">
                    إدارة مراحل البطولة والتحكيم
                </p>
            </div>
            <Link href={`/admin/events/${id}`} className="bg-gray-800 text-gray-300 px-5 py-2 rounded-xl hover:bg-gray-700 transition font-medium border border-gray-700">
                عودة للوحة التحكم
            </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rounds List */}
            <div className="lg:col-span-2 space-y-4">
                {rounds.length === 0 ? (
                    <div className="bg-gray-900/50 p-12 rounded-2xl border border-gray-800 text-center text-gray-500">
                        <div className="text-4xl mb-4">🔕</div>
                        <p>لا توجد جولات حتى الآن. ابدأ بإضافة جولة التأهيل.</p>
                    </div>
                ) : (
                    rounds.map((round) => (
                        <div key={round.id} className="group bg-gray-900 border border-gray-800 p-6 rounded-2xl flex justify-between items-center hover:border-yellow-600/50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-900/20 text-yellow-500 flex items-center justify-center font-bold text-xl border border-yellow-900/50">
                                    {round.round_order}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition">{round.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                        round.status === 'completed' ? 'bg-green-900 text-green-400' : 
                                        round.status === 'active' ? 'bg-yellow-900 text-yellow-400 animate-pulse' : 
                                        'bg-gray-800 text-gray-400'
                                    }`}>
                                        {round.status === 'active' ? 'جاري السباق 🏁' : round.status === 'completed' ? 'مكتمل ✅' : 'قيد الانتظار ⏳'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <Link 
                                    href={`/admin/events/${id}/rounds/${round.id}`}
                                    className="bg-yellow-600 hover:bg-yellow-500 text-black px-6 py-2 rounded-xl font-bold transition shadow-lg shadow-yellow-900/20"
                                >
                                    إدارة / تحكيم
                                </Link>
                                <button 
                                    onClick={() => handleDelete(round.id)}
                                    className="bg-red-900/20 hover:bg-red-900/40 text-red-500 px-3 py-2 rounded-xl border border-red-900/30 transition"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Valid Actions Panel */}
            <div className="space-y-4">
                <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800">
                    <h3 className="font-bold text-lg mb-4 text-gray-300">إضافة جولة جديدة</h3>
                    <div className="space-y-3">
                        <button 
                            disabled={isCreating}
                            onClick={() => handleCreate('Qualification (التأهيل)', 1)}
                            className="w-full text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-700 transition flex justify-between group disabled:opacity-50"
                        >
                            <span>🏁 جولة التأهيل (Qualify)</span>
                            <span className="text-gray-500 group-hover:text-white">+</span>
                        </button>

                        <button 
                            disabled={isCreating}
                            onClick={() => handleCreate('Top 32', 2)}
                            className="w-full text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-700 transition flex justify-between group disabled:opacity-50"
                        >
                            <span>🔥 أفضل 32 (Top 32)</span>
                            <span className="text-gray-500 group-hover:text-white">+</span>
                        </button>
                        
                         <button 
                            disabled={isCreating}
                            onClick={() => handleCreate('Top 16', 3)}
                            className="w-full text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-700 transition flex justify-between group disabled:opacity-50"
                        >
                            <span>🔥 أفضل 16 (Top 16)</span>
                            <span className="text-gray-500 group-hover:text-white">+</span>
                        </button>

                         <button 
                            disabled={isCreating}
                            onClick={() => handleCreate('Top 8', 4)}
                            className="w-full text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-700 transition flex justify-between group disabled:opacity-50"
                        >
                            <span>🔥 أفضل 8 (Top 8)</span>
                            <span className="text-gray-500 group-hover:text-white">+</span>
                        </button>

                         <button 
                            disabled={isCreating}
                            onClick={() => handleCreate('Final 4', 5)}
                            className="w-full text-right bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border border-gray-700 transition flex justify-between group disabled:opacity-50"
                        >
                            <span>🏆 النهائي (Final 4)</span>
                            <span className="text-gray-500 group-hover:text-white">+</span>
                        </button>
                    </div>
                </div>

                <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-900/30">
                    <h3 className="font-bold text-blue-400 mb-2">💡 تلميح</h3>
                    <p className="text-sm text-gray-400">
                        ابدأ دائماً بجولة "التأهيل". سيتم اختيار أفضل المتسابقين منها تلقائياً للجولات التالية (Top 32 أو Top 16).
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}
'use client';

import { useState, useEffect, use } from 'react';
import { getRoundParticipants, addParticipantToRound, updateParticipantScore, removeParticipantFromRound, getApprovedRegistrations, getRound, updateRoundStatus, promoteQualifiedToNextRound } from '@/actions/rounds-actions';
import { getEventDetails } from '@/actions/event-admin-actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoundManagementPage({ params }: { params: Promise<{ id: string, roundId: string }> }) {
  const { id: eventId, roundId } = use(params);
  const router = useRouter();
  const [participants, setParticipants] = useState<any[]>([]);
  const [approvedRegistrations, setApprovedRegistrations] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [round, setRound] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScore, setEditingScore] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [eventId, roundId]);

  const loadData = async () => {
    setLoading(true);
    const [participantsRes, approvedRes, eventRes, roundRes] = await Promise.all([
        getRoundParticipants(roundId),
        getApprovedRegistrations(eventId),
        getEventDetails(eventId),
        getRound(roundId)
    ]);
    
    if (participantsRes.success) setParticipants(participantsRes.data);
    if (approvedRes.success) setApprovedRegistrations(approvedRes.data);
    if (eventRes.success) setEvent(eventRes.data);
    if (roundRes.success) setRound(roundRes.data);
    
    setLoading(false);
  };

  const handleAddParticipant = async (registrationId: string) => {
      const res = await addParticipantToRound(roundId, registrationId);
      if (res.success) {
          loadData();
          setShowAddModal(false);
      } else {
          alert('خطأ: ' + res.error);
      }
  };

  const handleUpdateScore = async (participantId: string, run1: number, run2: number, final: number, qualified: boolean) => {
      const res = await updateParticipantScore(participantId, run1, run2, final, qualified);
      if (res.success) {
          loadData();
          setEditingScore(null);
      } else {
          alert('خطأ: ' + res.error);
      }
  };

  const handleRemoveParticipant = async (participantId: string) => {
      if(!confirm('هل أنت متأكد من إزالة هذا المتسابق من الجولة؟')) return;
      await removeParticipantFromRound(participantId);
      loadData();
  };

  const handleUpdateStatus = async (newStatus: string) => {
      if(!confirm(`هل أنت متأكد من تغيير حالة الجولة إلى "${newStatus === 'active' ? 'جاري السباق' : newStatus === 'completed' ? 'مكتمل' : 'قيد الانتظار'}"؟`)) return;
      const res = await updateRoundStatus(roundId, newStatus, eventId);
      if (res.success) {
          loadData();
      } else {
          alert('خطأ: ' + res.error);
      }
  };

  const handlePromote = async () => {
      if(!confirm('هل أنت متأكد من نقل جميع المتأهلين إلى الجولة التالية؟')) return;
      const res = await promoteQualifiedToNextRound(eventId, roundId);
      if (res.success) {
          alert(`تم نقل ${res.promoted} متسابق إلى الجولة التالية!`);
          loadData();
      } else {
          alert('خطأ: ' + res.error);
      }
  };

  const availableRegistrations = approvedRegistrations.filter(reg => 
    !participants.some(p => p.registration_id === reg.id)
  );

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-8" dir="rtl">
        
        {/* Add Participant Modal */}
        {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur p-4">
                <div className="bg-gray-900 border border-yellow-500/50 p-8 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <button onClick={() => setShowAddModal(false)} className="absolute top-4 left-4 text-gray-500 hover:text-white">✕</button>
                    
                    <h3 className="text-2xl font-bold text-center text-white mb-6">إضافة متسابق للجولة</h3>
                    
                    <div className="space-y-3">
                        {availableRegistrations.length === 0 ? (
                            <p className="text-center text-gray-500">لا توجد تسجيلات مقبولة متاحة</p>
                        ) : (
                            availableRegistrations.map(reg => (
                                <div key={reg.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700">
                                    <div>
                                        <span className="font-bold">{reg.full_name}</span>
                                        <span className="text-gray-400 mr-2">({reg.car_make} {reg.car_model})</span>
                                    </div>
                                    <button 
                                        onClick={() => handleAddParticipant(reg.id)}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-bold transition"
                                    >
                                        إضافة +
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-800 pb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-yellow-400 to-yellow-600">
                    🏁 إدارة الجولة: {round?.name || 'جولة'}
                </h1>
                <p className="text-gray-400 mt-1">
                    تحكيم المتسابقين وتسجيل النقاط - {event?.name}
                </p>
            </div>
            <div className="flex gap-3">
                {round?.status === 'completed' && (
                    <button 
                        onClick={handlePromote}
                        className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-xl font-bold transition shadow-lg shadow-green-900/20"
                    >
                        🚀 نقل المتأهلين للجولة التالية
                    </button>
                )}
                <select 
                    value={round?.status || 'pending'}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="bg-gray-800 text-white border border-gray-700 rounded-xl p-3 outline-none focus:border-yellow-500"
                >
                    <option value="pending">⏳ قيد الانتظار</option>
                    <option value="active">🏁 جاري السباق</option>
                    <option value="completed">✅ مكتمل</option>
                </select>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-yellow-600 hover:bg-yellow-500 text-black px-5 py-2 rounded-xl font-bold transition shadow-lg shadow-yellow-900/20"
                >
                    ➕ إضافة متسابق
                </button>
                <Link href={`/admin/events/${eventId}/rounds`} className="bg-gray-800 text-gray-300 px-5 py-2 rounded-xl hover:bg-gray-700 transition font-medium border border-gray-700">
                    عودة للجولات
                </Link>
            </div>
        </header>

        <div className="bg-gray-900/80 backdrop-blur rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-right" style={{ minWidth: '800px' }}>
                    <thead>
                        <tr className="bg-gray-800/80 text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
                            <th className="p-5 font-medium">#</th>
                            <th className="p-5 font-medium">المتسابق</th>
                            <th className="p-5 font-medium">السيارة</th>
                            <th className="p-5 font-medium">المحاولة 1</th>
                            <th className="p-5 font-medium">المحاولة 2</th>
                            <th className="p-5 font-medium">النهائي</th>
                            <th className="p-5 font-medium">التأهل</th>
                            <th className="p-5 font-medium text-left">الإجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {participants.map((participant, idx) => (
                            <tr key={participant.id} className="hover:bg-gray-800/40 transition-colors">
                                <td className="p-5 text-gray-500 font-mono text-sm">
                                    {String(idx + 1).padStart(2, '0')}
                                </td>
                                
                                <td className="p-5">
                                    <div className="font-bold text-white">{participant.registrations?.full_name}</div>
                                    <div className="text-gray-500 text-sm">{participant.registrations?.username}</div>
                                </td>

                                <td className="p-5">
                                    <div className="text-gray-200">{participant.registrations?.car_make} {participant.registrations?.car_model}</div>
                                    <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-900">
                                        {participant.registrations?.car_category}
                                    </span>
                                </td>

                                <td className="p-5">
                                    {editingScore === participant.id ? (
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            defaultValue={participant.run_1_score || 0}
                                            className="w-20 bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-center"
                                            onBlur={(e) => {
                                                const run1 = parseFloat(e.target.value) || 0;
                                                const run2 = participant.run_2_score || 0;
                                                const final = Math.max(run1, run2);
                                                handleUpdateScore(participant.id, run1, run2, final, participant.is_qualified);
                                            }}
                                        />
                                    ) : (
                                        <span className="text-yellow-400 font-mono">{participant.run_1_score || 0}</span>
                                    )}
                                </td>

                                <td className="p-5">
                                    {editingScore === participant.id ? (
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            defaultValue={participant.run_2_score || 0}
                                            className="w-20 bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-center"
                                            onBlur={(e) => {
                                                const run2 = parseFloat(e.target.value) || 0;
                                                const run1 = participant.run_1_score || 0;
                                                const final = Math.max(run1, run2);
                                                handleUpdateScore(participant.id, run1, run2, final, participant.is_qualified);
                                            }}
                                        />
                                    ) : (
                                        <span className="text-yellow-400 font-mono">{participant.run_2_score || 0}</span>
                                    )}
                                </td>

                                <td className="p-5">
                                    <span className="text-2xl font-bold text-green-400 font-mono">{participant.final_score || 0}</span>
                                </td>

                                <td className="p-5">
                                    <button 
                                        onClick={() => handleUpdateScore(participant.id, participant.run_1_score || 0, participant.run_2_score || 0, participant.final_score || 0, !participant.is_qualified)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                                            participant.is_qualified ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-red-900/30 border-red-800 text-red-400'
                                        }`}
                                    >
                                        {participant.is_qualified ? 'متأهل ✅' : 'غير متأهل ❌'}
                                    </button>
                                </td>

                                <td className="p-5 text-left">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setEditingScore(editingScore === participant.id ? null : participant.id)}
                                            className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-lg text-sm hover:bg-blue-900/60 transition"
                                        >
                                            ✏️ تعديل
                                        </button>
                                        <button 
                                            onClick={() => handleRemoveParticipant(participant.id)}
                                            className="bg-red-900/20 text-red-500 px-3 py-1 rounded-lg text-sm border border-red-900/30 hover:bg-red-900/40 transition"
                                        >
                                            🗑️ إزالة
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {participants.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                    <div className="text-4xl mb-3">🏁</div>
                    <p>لا يوجد متسابقون في هذه الجولة بعد. اضغط "إضافة متسابق" لبدء التحكيم.</p>
                </div>
            )}
        </div>
    </div>
  );
}
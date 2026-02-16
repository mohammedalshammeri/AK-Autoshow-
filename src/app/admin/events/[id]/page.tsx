'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Users, CheckCircle, XCircle, Clock, Trophy, Flag } from 'lucide-react';

interface EventStats {
  eventName: string;
  eventDate: string;
  location: string;
  totalRegistrations: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export default function EventDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/events/${id}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-red-600 mb-2">
            {stats?.eventName || 'لوحة تحكم الفعالية'}
          </h1>
          <div className="flex gap-6 text-gray-400 text-sm">
            <span>📅 {stats?.eventDate}</span>
            <span>📍 {stats?.location}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-700/50 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-4xl font-black text-blue-400">{stats?.totalRegistrations || 0}</span>
            </div>
            <p className="text-gray-300 font-bold">إجمالي التسجيلات</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-700/50 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-400" />
              <span className="text-4xl font-black text-yellow-400">{stats?.pendingCount || 0}</span>
            </div>
            <p className="text-gray-300 font-bold">قيد المراجعة</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-700/50 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-4xl font-black text-green-400">{stats?.approvedCount || 0}</span>
            </div>
            <p className="text-gray-300 font-bold">مقبول</p>
          </div>

          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-700/50 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-400" />
              <span className="text-4xl font-black text-red-400">{stats?.rejectedCount || 0}</span>
            </div>
            <p className="text-gray-300 font-bold">مرفوض</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link 
            href={`/admin/events/${id}/registrations`}
            className="bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col items-center gap-3 transition group"
          >
            <div className="text-5xl group-hover:scale-110 transition-transform">📋</div>
            <h3 className="font-black text-lg text-center">إدارة المشاركين</h3>
            <p className="text-gray-400 text-sm text-center">مراجعة + تعديل بيانات التسجيل</p>
          </Link>

          <Link 
            href={`/admin/events/${id}/rounds`}
            className="bg-gradient-to-br from-red-600/20 to-red-800/20 hover:from-red-600/30 hover:to-red-800/30 border border-red-700/50 rounded-xl p-6 flex flex-col items-center gap-3 transition group"
          >
            <Trophy className="w-12 h-12 text-red-400 group-hover:scale-110 transition" />
            <h3 className="font-black text-lg text-center">إدارة الجولات</h3>
            <p className="text-gray-400 text-sm text-center">الإقصاءات والنتائج</p>
          </Link>

          <Link 
            href={`/admin/events/${id}/gate-scan`}
            className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 hover:from-purple-600/30 hover:to-purple-800/30 border border-purple-700/50 rounded-xl p-6 flex flex-col items-center gap-3 transition group"
          >
            <Flag className="w-12 h-12 text-purple-400 group-hover:scale-110 transition" />
            <h3 className="font-black text-lg text-center">فحص البوابة</h3>
            <p className="text-gray-400 text-sm text-center">مسح QR كود</p>
          </Link>

          <Link 
            href={`/admin/events/${id}/sponsors`}
            className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 hover:from-purple-600/30 hover:to-purple-800/30 border border-purple-700/50 rounded-xl p-6 flex flex-col items-center gap-3 transition group"
          >
            <div className="text-5xl group-hover:scale-110 transition-transform">🤝</div>
            <h3 className="font-black text-lg text-center">الرعاة</h3>
            <p className="text-gray-400 text-sm text-center">داخل لوحة الفعالية فقط</p>
          </Link>
        </div>

      </div>
    </div>
  );
}
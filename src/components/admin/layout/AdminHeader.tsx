'use client';

import { Bell, Search, Menu } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  userEmail?: string;
  onMenuClick: () => void;
}

export function AdminHeader({ title, userEmail, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="h-20 bg-[#1a1c23] border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-gray-400 hidden sm:block">
            {new Date().toLocaleDateString('ar-BH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar - Hidden on mobile */}
        {/* <div className="hidden md:flex items-center bg-gray-900 rounded-full px-4 py-2 border border-gray-700 w-64 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <Search className="w-4 h-4 text-gray-500 ml-2" />
          <input 
            type="text" 
            placeholder="بحث سريع..." 
            className="bg-transparent border-none focus:outline-none text-sm text-white w-full placeholder-gray-600"
          />
        </div> */}

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a1c23]"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-r border-gray-800 pr-4 mr-2">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-white line-clamp-1">{userEmail?.split('@')[0] || 'Admin'}</p>
            <p className="text-xs text-indigo-400">مدير النظام</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-gray-800">
            {userEmail?.[0].toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}

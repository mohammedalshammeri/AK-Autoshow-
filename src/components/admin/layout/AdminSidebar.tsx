'use client';

import { 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Menu,
  PieChart,
  ClipboardList,
  Store,
  Image as ImageIcon,
  Shield,
  CalendarDays
} from 'lucide-react';
import { useState } from 'react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  counts: {
    pending: number;
    approved: number;
    rejected: number;
    orders: number;
  };
  className?: string;
  onLogout: () => void;
}

export function AdminSidebar({ activeTab, setActiveTab, counts, className = '', onLogout }: AdminSidebarProps) {
  const menuItems = [
    { label: 'لوحة التحكم', id: 'statistics', icon: PieChart, section: 'main' },
    
    { label: 'الطلبات المعلقة', id: 'pending', icon: ClipboardList, count: counts.pending, section: 'regs', color: 'text-yellow-400' },
    { label: 'مقبولة', id: 'approved', icon: Users, count: counts.approved, section: 'regs', color: 'text-green-400' },
    { label: 'مرفوضة', id: 'rejected', icon: Users, count: counts.rejected, section: 'regs', color: 'text-red-400' },
    
    { label: 'الفعاليات', id: 'events', icon: CalendarDays, section: 'content' },
    { label: 'المنتجات', id: 'products', icon: Store, section: 'shop' },
    { label: 'طلبات للمتجر', id: 'orders', icon: ClipboardList, count: counts.orders, section: 'shop' },
    { label: 'معرض الصور', id: 'gallery', icon: ImageIcon, section: 'content' },
    { label: 'الرعاة', id: 'sponsors', icon: Shield, section: 'content' },
    { label: 'بوابة التحقق', id: 'gate', icon: Shield, section: 'tools' },
    { label: 'المسؤولين', id: 'admins', icon: Settings, section: 'admin' },
  ];

  return (
    <div className={`bg-[#0f1115] w-72 min-h-screen flex flex-col border-l border-gray-800 ${className} z-50 shadow-2xl`}>
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-800/50 bg-[#0f1115]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
             <span className="font-bold text-white text-xl">AK</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">AK Auto</h1>
            <p className="text-xs text-indigo-400 font-medium tracking-wide">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
        
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">الرئيسية</div>
        <NavItem item={menuItems.find(i => i.id === 'statistics')!} activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="my-4 border-t border-gray-800/50 mx-3"></div>
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">التسجيلات</div>
        {menuItems.filter(i => i.section === 'regs').map(item => (
          <NavItem key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
        ))}
        <NavItem item={menuItems.find(i => i.id === 'gate')!} activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="my-4 border-t border-gray-800/50 mx-3"></div>
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">إدارة المحتوى</div>
        {menuItems.filter(i => i.section === 'content').map(item => (
          <NavItem key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
        ))}

        <div className="my-4 border-t border-gray-800/50 mx-3"></div>
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">المتجر</div>
        {menuItems.filter(i => i.section === 'shop').map(item => (
          <NavItem key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
        ))}

        <div className="my-4 border-t border-gray-800/50 mx-3"></div>
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">النظام</div>
        {menuItems.filter(i => i.section === 'admin').map(item => (
          <NavItem key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
        ))}

      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800/50 bg-[#0f1115]">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
          <span className="font-medium text-sm">تسجيل خروج</span>
        </button>
      </div>
    </div>
  );
}

function NavItem({ item, activeTab, setActiveTab }: { item: any, activeTab: string, setActiveTab: (id: string) => void }) {
  const Icon = item.icon;
  const isActive = activeTab === item.id;
  
  return (
    <button
      onClick={() => setActiveTab(item.id)}
      className={`
        w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group
        ${isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
          : 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-100'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : (item.color || 'text-gray-500')} ${!isActive && 'group-hover:text-white'} transition-colors`} />
        <span className="font-medium text-sm">{item.label}</span>
      </div>
      
      {item.count !== undefined && item.count > 0 && (
        <span className={`
          text-[10px] px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center
          ${isActive 
            ? 'bg-white/20 text-white' 
            : 'bg-gray-800 text-gray-300 border border-gray-700'
          }
        `}>
          {item.count}
        </span>
      )}
    </button>
  );
}

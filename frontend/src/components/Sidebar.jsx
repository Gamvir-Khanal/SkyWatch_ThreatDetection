import React, { useState } from 'react';
import { Radar, LayoutDashboard, Plane, Box, Map as MapIcon, Settings, User, ChevronLeft, ChevronRight } from 'lucide-react';
export default function Sidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);
  const tabs = [
    { id: 'tactical', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assets', label: 'Fleet Manager', icon: Plane },
    { id: 'evidence', label: 'Incident Vault', icon: Box },
    { id: 'network', label: 'Sector Map', icon: MapIcon },
    { id: 'logs', label: 'Settings', icon: Settings }
  ];
  return (
    <aside className={`relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} z-40 h-full`}>
      {}
      <div className={`flex items-center h-16 border-b border-slate-200 dark:border-slate-800 ${collapsed ? 'justify-center' : 'px-6'} transition-all`}>
        <Radar className="text-emerald-500 shrink-0" size={24} />
        {!collapsed && (
          <span className="ml-3 font-bold text-lg tracking-widest text-slate-900 dark:text-slate-100">
            SKYWATCH
          </span>
        )}
      </div>
      {}
      <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center rounded-xl transition-all duration-200 group ${collapsed ? 'justify-center h-12' : 'px-4 py-3'}
                ${isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'}
              `}
              title={collapsed ? tab.label : ''}
            >
              <Icon size={20} className={`shrink-0 ${isActive ? 'text-emerald-500' : 'group-hover:text-slate-900 dark:group-hover:text-slate-200'}`} />
              {!collapsed && (
                <span className={`ml-3 font-medium text-sm whitespace-nowrap ${isActive ? 'text-emerald-700 dark:text-emerald-300' : 'group-hover:text-slate-900 dark:group-hover:text-slate-200'}`}>
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Bottom Profile */}
      <div className={`p-4 border-t border-slate-200 dark:border-slate-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center shrink-0 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700">
            <User size={16} className="text-slate-600 dark:text-slate-400" />
          </div>
          {!collapsed && (
            <div className="ml-3 flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">Command Admin</span>
              <span className="text-xs text-emerald-500 flex items-center truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                Online
              </span>
            </div>
          )}
        </div>
      </div>
      {}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 z-50 transition-transform"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}


import { BookOpen, Briefcase, Code, Compass, Globe, LayoutDashboard, LogOut, MessageSquare, Trash2, TrendingUp } from 'lucide-react';
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  onSwitchTrack: () => void;
  onReset?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout, onSwitchTrack, onReset }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.PLAN, label: 'Learning Plan', icon: BookOpen },
    { id: AppView.PROJECTS, label: 'Build Portfolio', icon: Code },
    { id: AppView.TRENDS, label: 'Market Insights', icon: Globe },
    { id: AppView.INTERVIEW, label: 'Interview Prep', icon: MessageSquare },
    { id: AppView.JOBS, label: 'Market Scanner', icon: Briefcase },
  ];

  return (
    <div className="w-64 bg-slate-950 h-screen border-r border-slate-800 flex flex-col hidden md:flex fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-100 tracking-tight">CareerForge</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 pb-2">
         <button
            onClick={onSwitchTrack}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-900/50 text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-300 transition-colors border border-dashed border-emerald-500/30"
          >
            <Compass className="w-5 h-5" />
            <span className="font-medium text-sm">Explore New Role</span>
          </button>
      </div>

      <div className="p-4 border-t border-slate-800">
        {onReset && (
          <button
            onClick={onReset}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-900/10 hover:text-red-400 transition-colors mb-2"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-xs">Reset My Progress</span>
          </button>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-900/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

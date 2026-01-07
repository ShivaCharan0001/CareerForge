import { BookOpen, Briefcase, Code, Compass, Globe, LayoutDashboard, LogOut, MessageSquare, Trash2, TrendingUp, User } from 'lucide-react';
import React from 'react';
import { AppView } from '../types';

interface TopNavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  onSwitchTrack: () => void;
  onReset?: () => void;
  userName: string;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  currentView,
  onChangeView,
  onLogout,
  onSwitchTrack,
  onReset,
  userName
}) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.PLAN, label: 'Learning Plan', icon: BookOpen },
    { id: AppView.PROJECTS, label: 'Build Portfolio', icon: Code },
    { id: AppView.TRENDS, label: 'Market Insights', icon: Globe },
    { id: AppView.INTERVIEW, label: 'Interview Prep', icon: MessageSquare },
    { id: AppView.JOBS, label: 'Market Scanner', icon: Briefcase },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-2xl shadow-slate-900/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-100 tracking-tight">CareerForge</span>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-1 ml-12">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl transition-all duration-300 group relative ${
                  currentView === item.id
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:shadow-lg hover:shadow-slate-800/20'
                }`}
              >
                <item.icon className={`w-4 h-4 ${
                  currentView === item.id
                    ? 'text-white'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                <span className="font-medium text-sm">{item.label}</span>
                {currentView === item.id && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-600/20 to-red-600/20 blur-xl -z-10"></div>
                )}
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* Switch Track Button */}
            <button
              onClick={onSwitchTrack}
              className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all border border-emerald-500/20 text-sm font-medium"
            >
              <Compass className="w-4 h-4" />
              <span>Explore New Role</span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                {userName?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-slate-300 font-medium hidden lg:block">{userName}</span>
            </div>

            {/* Dropdown Menu */}
            <div className="relative group">
              <button className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all">
                <User className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Content */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-slate-900/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                {onReset && (
                  <button
                    onClick={onReset}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Reset Progress</span>
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-slate-800/50">
          <div className="flex flex-wrap gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all text-xs font-medium ${
                  currentView === item.id
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
                }`}
              >
                <item.icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={onSwitchTrack}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium border border-emerald-500/20"
            >
              <Compass className="w-3 h-3" />
              <span>Explore New Role</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
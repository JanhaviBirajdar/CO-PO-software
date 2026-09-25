import React from 'react';
import { ShieldCheck, Bell, Search, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user } = useAuth();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'ADMIN':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'HOD':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'FACULTY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <header className="h-16 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="flex items-center space-x-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses, COs, POs, students..."
            className="w-full bg-slate-800/60 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-700/60 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Right Header Status & Actions */}
      <div className="flex items-center space-x-4">
        {/* System Status Indicator */}
        <div className="flex items-center space-x-2 text-xs bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300 font-medium">DB: Connected</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* Role Badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1.5 ${getRoleBadgeColor(user?.role)}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{user?.role || 'User'}</span>
        </div>

        {/* Notifications Icon */}
        <button className="p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-sky-400 rounded-full absolute top-1.5 right-1.5"></span>
        </button>
      </div>
    </header>
  );
};

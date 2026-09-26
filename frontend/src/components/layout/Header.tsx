import React, { useState } from 'react';
import { ShieldCheck, Bell, Search, Database, ChevronDown, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import { ROLE_LABELS } from '../../utils/rbac';

export const Header: React.FC = () => {
  const { user, switchRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'ADMIN':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'OBE_COORDINATOR':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'HOD':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'FACULTY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleSelectRole = (r: Role) => {
    switchRole(r);
    setShowRoleMenu(false);
  };

  const roleTitle = user?.role ? (ROLE_LABELS[user.role] || user.role) : 'Guest';

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
        {/* Offline Preview / DB Indicator */}
        <div className="flex items-center space-x-2 text-xs bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-300 font-medium">Demo Mode</span>
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer shadow-sm ${getRoleBadgeColor(user?.role)}`}
            title="Click to switch user role (Admin, HOD, OBE Coordinator, Faculty)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Role: {roleTitle}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-xl">
              <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Role Persona (RBAC Testing)
              </div>
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => handleSelectRole('ADMIN')}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    user?.role === 'ADMIN'
                      ? 'bg-indigo-500/20 text-indigo-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold">Academic Admin</p>
                    <p className="text-[10px] text-slate-400">System Admin & Academic Setup</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] bg-indigo-500/20 text-indigo-300 rounded font-mono">ADMIN</span>
                </button>

                <button
                  onClick={() => handleSelectRole('HOD')}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    user?.role === 'HOD'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold">HOD (Head of Dept)</p>
                    <p className="text-[10px] text-slate-400">Dr. Ramesh Patil (CSE Dept)</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 text-amber-300 rounded font-mono">HOD</span>
                </button>

                <button
                  onClick={() => handleSelectRole('OBE_COORDINATOR')}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    user?.role === 'OBE_COORDINATOR'
                      ? 'bg-sky-500/20 text-sky-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold">OBE Coordinator / IQAC</p>
                    <p className="text-[10px] text-slate-400">Prof. S. K. Verma (OBE Cell)</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] bg-sky-500/20 text-sky-300 rounded font-mono">COORDINATOR</span>
                </button>

                <button
                  onClick={() => handleSelectRole('FACULTY')}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    user?.role === 'FACULTY'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold">Faculty / Instructor</p>
                    <p className="text-[10px] text-slate-400">Prof. Anjali Sharma (Course Lead)</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 rounded font-mono">FACULTY</span>
                </button>

                <button
                  onClick={() => handleSelectRole('SUPER_ADMIN')}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    user?.role === 'SUPER_ADMIN'
                      ? 'bg-purple-500/20 text-purple-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold">Super Administrator</p>
                    <p className="text-[10px] text-slate-400">Dr. Omkar (Full System Override)</p>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] bg-purple-500/20 text-purple-300 rounded font-mono">SUPER</span>
                </button>
              </div>
            </div>
          )}
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

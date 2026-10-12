import React from 'react';
import { Bell, Search, Database, UserCheck, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/rbac';
import { ThemeToggle } from '../common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const getRoleBadgeColor = (role?: string) => {
    if (isLight) {
      switch (role) {
        case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-700 border-purple-300';
        case 'ADMIN':       return 'bg-indigo-100 text-indigo-700 border-indigo-300';
        case 'HOD':         return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'FACULTY':     return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        default:            return 'bg-slate-100 text-slate-700 border-slate-300';
      }
    } else {
      switch (role) {
        case 'SUPER_ADMIN': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
        case 'ADMIN':       return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
        case 'HOD':         return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
        case 'FACULTY':     return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
        default:            return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
      }
    }
  };

  const roleTitle = user?.role ? (ROLE_LABELS[user.role] || user.role) : 'Guest';

  return (
    <header className={`h-16 border-b backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 gap-2 transition-colors duration-300 shadow-sm ${
      isLight
        ? 'bg-white/95 border-slate-200 text-slate-900'
        : 'bg-slate-900/80 border-slate-800/80 text-slate-100'
    }`}>
      {/* Mobile Menu Button + Search Input */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className={`p-2 -ml-1 rounded-xl lg:hidden cursor-pointer shrink-0 transition-colors ${
            isLight
              ? 'text-slate-500 hover:text-sky-600 hover:bg-slate-100'
              : 'text-slate-400 hover:text-sky-400 hover:bg-slate-800/80'
          }`}
          aria-label="Open Navigation"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-[110px] xs:max-w-[160px] sm:max-w-xs md:max-w-sm">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search..."
            className={`w-full text-xs rounded-xl pl-9 pr-3 sm:pr-4 py-2 border focus:outline-none transition-colors ${
              isLight
                ? 'bg-slate-100 text-slate-900 placeholder-slate-400 border-slate-200 focus:border-sky-500'
                : 'bg-slate-800/80 text-slate-100 placeholder-slate-400 border-slate-700/80 focus:border-sky-500/70'
            }`}
          />
        </div>
      </div>

      {/* Right Header Status & Actions */}
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 shrink-0">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* System Status Indicator */}
        <div className={`hidden sm:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg border ${
          isLight
            ? 'bg-slate-100 text-slate-700 border-slate-200'
            : 'bg-slate-800/60 text-slate-300 border-slate-700/50'
        }`}>
          <Database className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <span className="font-semibold hidden md:inline">DB: Connected</span>
          <span className={`w-2 h-2 rounded-full animate-pulse ${isLight ? 'bg-emerald-500' : 'bg-emerald-400'}`}></span>
        </div>

        {/* Authenticated Role Badge */}
        <div
          className={`px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold border flex items-center space-x-1 sm:space-x-2 shadow-sm ${getRoleBadgeColor(user?.role)}`}
          title={`Logged in as ${roleTitle}`}
        >
          <UserCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Role: </span>
          <span className="truncate max-w-[70px] xs:max-w-[110px] sm:max-w-none">{roleTitle}</span>
        </div>

        {/* Notifications Icon */}
        <button className={`p-1.5 sm:p-2 rounded-lg border relative shrink-0 cursor-pointer ${
          isLight
            ? 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border-slate-200'
            : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/50'
        }`}>
          <Bell className="w-4 h-4" />
          <span className={`w-2 h-2 rounded-full absolute top-1.5 right-1.5 ${isLight ? 'bg-sky-500' : 'bg-sky-400'}`}></span>
        </button>
      </div>
    </header>
  );
};

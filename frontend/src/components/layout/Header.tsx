import React from 'react';
import { Bell, Search, Database, UserCheck, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/rbac';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30';
      case 'ADMIN':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30';
      case 'HOD':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30';
      case 'FACULTY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/30';
    }
  };

  const roleTitle = user?.role ? (ROLE_LABELS[user.role] || user.role) : 'Guest';

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 gap-2 transition-colors shadow-sm">
      {/* Mobile Menu Button + Search Input */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800/80 rounded-xl lg:hidden cursor-pointer shrink-0 transition-colors"
          aria-label="Open Navigation"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-[110px] xs:max-w-[160px] sm:max-w-xs md:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-slate-100 text-slate-900 placeholder-slate-400 text-xs rounded-xl pl-9 pr-3 sm:pr-4 py-2 border border-slate-200 focus:outline-none focus:border-sky-500 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder-slate-400 dark:border-slate-700/80 dark:focus:border-sky-500/70 transition-colors"
          />
        </div>
      </div>

      {/* Right Header Status & Actions */}
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 shrink-0">
        {/* Theme Toggle (Dark / Light White Mode) */}
        <ThemeToggle />

        {/* System Status Indicator */}
        <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/50">
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold hidden md:inline">DB: Connected</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
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
        <button className="p-1.5 sm:p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 dark:border-slate-700/50 relative shrink-0 cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-sky-500 dark:bg-sky-400 rounded-full absolute top-1.5 right-1.5"></span>
        </button>
      </div>
    </header>
  );
};

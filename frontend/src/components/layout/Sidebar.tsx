import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Target,
  BookOpen,
  ClipboardList,
  Calculator,
  Activity,
  FileCheck,
  FileSpreadsheet,
  Users,
  LogOut,
  Sparkles,
  Eye,
  ShieldCheck,
  Brain,
  Layers,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAccessLevel, type FeatureKey, ROLE_LABELS } from '../../utils/rbac';
import { RbacMatrixModal } from '../common/RbacMatrixModal';

interface SidebarItem {
  title: string;
  path: string;
  key: FeatureKey;
  icon: React.ElementType;
  badge?: string;
}

const navItems: { section: string; items: SidebarItem[] }[] = [
  {
    section: 'MAIN',
    items: [
      { title: 'Dashboard', path: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'ACADEMICS & OUTCOMES',
    items: [
      { title: 'Academic Setup', path: '/academic-setup', key: 'academic-setup', icon: Building2 },
      { title: 'POs & PSOs', path: '/outcomes', key: 'outcomes', icon: Target },
      { title: 'Courses & COs', path: '/courses', key: 'courses', icon: BookOpen },
      { title: 'Bloom\'s Taxonomy', path: '/blooms', key: 'blooms', icon: Brain, badge: 'L1-L6' },
      { title: 'CO-PO Mappings', path: '/mappings', key: 'mappings', icon: FileCheck },
    ],
  },
  {
    section: 'ASSESSMENTS & ATTAINMENT',
    items: [
      { title: 'Question Bank & Paper', path: '/question-bank', key: 'question-bank', icon: Layers },
      { title: 'Assessments & Marks', path: '/assessments', key: 'assessments', icon: ClipboardList },
      { title: 'Attainment Engine', path: '/attainment', key: 'attainment', icon: Calculator, badge: 'Formula' },
      { title: 'CCA & ECA Activities', path: '/activities', key: 'activities', icon: Activity },
      { title: 'Surveys & Feedback', path: '/surveys', key: 'surveys', icon: GraduationCap },
    ],
  },
  {
    section: 'REPORTS & ADMIN',
    items: [
      { title: 'Reports & Export', path: '/reports', key: 'reports', icon: FileSpreadsheet },
      { title: 'User Management', path: '/users', key: 'users', icon: Users },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate('/login');
  };

  const userRole = user?.role;
  const roleLabel = userRole ? (ROLE_LABELS[userRole] || userRole) : 'Guest';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-72 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col backdrop-blur-xl select-none transition-transform duration-300 ease-in-out shadow-sm ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/60 dark:bg-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-tight text-slate-900 dark:text-white">OBE System</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">CO-PO Attainment Hub</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Role Indicator Card */}
        <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-slate-100/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Role Navigation</p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{roleLabel}</p>
            </div>
          </div>
          {userRole === 'SUPER_ADMIN' && (
            <button
              onClick={() => setShowMatrixModal(true)}
              className="p-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:hover:bg-sky-500/20 border border-sky-300 dark:border-sky-500/20 transition-all text-[10px] font-bold flex items-center space-x-1 shrink-0 cursor-pointer"
              title="View RBAC Matrix"
            >
              <span>RBAC Matrix</span>
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navItems.map((group, groupIdx) => {
            // Filter items based on RBAC matrix permissions (Hide items with AccessLevel === 'NONE')
            const visibleItems = group.items.filter((item) => {
              const access = getAccessLevel(item.key, userRole);
              return access !== 'NONE';
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-2">
                <h2 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase px-3">
                  {group.section}
                </h2>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const accessLevel = getAccessLevel(item.key, userRole);
                    const isReadOnlyMode = accessLevel === 'READ_ONLY';

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose?.()}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                            isActive
                              ? 'bg-sky-50 text-sky-700 border border-sky-300 font-bold dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30 dark:shadow-sm dark:shadow-sky-500/10'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                          }`
                        }
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4 opacity-80" />
                          <span>{item.title}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {isReadOnlyMode && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center space-x-1"
                              title="Read-Only Mode for your role"
                            >
                              <Eye className="w-2.5 h-2.5" />
                              <span>View</span>
                            </span>
                          )}
                          {item.badge && !isReadOnlyMode && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer User Info & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 border border-sky-300 dark:bg-sky-500/20 dark:text-sky-400 font-bold text-xs dark:border-sky-500/30 flex items-center justify-center shrink-0">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate uppercase font-semibold">{roleLabel}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* RBAC Matrix Modal */}
      {userRole === 'SUPER_ADMIN' && (
        <RbacMatrixModal
          isOpen={showMatrixModal}
          onClose={() => setShowMatrixModal(false)}
          currentRole={userRole}
        />
      )}
    </>
  );
};

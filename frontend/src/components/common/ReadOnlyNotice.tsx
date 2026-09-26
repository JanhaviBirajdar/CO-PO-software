import React from 'react';
import { Eye, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/rbac';

interface ReadOnlyNoticeProps {
  featureName: string;
}

export const ReadOnlyNotice: React.FC<ReadOnlyNoticeProps> = ({ featureName }) => {
  const { user } = useAuth();
  const roleName = user?.role ? (ROLE_LABELS[user.role] || user.role) : 'Guest';

  return (
    <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between shadow-lg shadow-amber-500/5 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-amber-300 text-sm">Read-Only Mode</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold border border-amber-500/30">
              {roleName} View
            </span>
          </div>
          <p className="text-xs text-amber-200/80 mt-0.5">
            You have read-only access to {featureName}. Data modification forms and action buttons are disabled for your role.
          </p>
        </div>
      </div>
      <div className="hidden sm:flex items-center space-x-1 text-amber-400 text-xs font-medium bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>View Only</span>
      </div>
    </div>
  );
};

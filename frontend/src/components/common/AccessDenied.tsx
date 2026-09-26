import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, type FeatureKey, FEATURES } from '../../utils/rbac';

interface AccessDeniedProps {
  featureKey: FeatureKey;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ featureKey }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const featureMeta = FEATURES.find((f) => f.key === featureKey);
  const roleName = user?.role ? (ROLE_LABELS[user.role] || user.role) : 'Guest';

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 select-none">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Access Restricted (HTTP 403)</span>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          {featureMeta?.name || 'Restricted Module'}
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Your active role (<strong className="text-slate-200">{roleName}</strong>) does not have access permissions for this module according to the OBE Role-Based Access Control policy.
        </p>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

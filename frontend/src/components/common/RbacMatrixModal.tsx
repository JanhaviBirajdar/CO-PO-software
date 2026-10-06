import React from 'react';
import { X, ShieldCheck, CheckCircle2, Eye, XCircle } from 'lucide-react';
import type { Role } from '../../types';
import { RBAC_MATRIX, FEATURES, ROLE_LABELS, type AccessLevel } from '../../utils/rbac';

interface RbacMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: Role;
}

export const RbacMatrixModal: React.FC<RbacMatrixModalProps> = ({
  isOpen,
  onClose,
  currentRole,
}) => {
  if (!isOpen) return null;

  const roles: Role[] = ['ADMIN', 'HOD', 'FACULTY'];

  const renderAccessIcon = (level: AccessLevel) => {
    switch (level) {
      case 'FULL':
        return (
          <div className="flex items-center justify-center space-x-1 text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 py-1.5 px-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold">Full Access</span>
          </div>
        );
      case 'READ_ONLY':
        return (
          <div className="flex items-center justify-center space-x-1 text-amber-400 bg-amber-500/15 border border-amber-500/30 py-1.5 px-3 rounded-xl">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-semibold">View Only</span>
          </div>
        );
      case 'NONE':
        return (
          <div className="flex items-center justify-center space-x-1 text-rose-400 bg-rose-500/15 border border-rose-500/30 py-1.5 px-3 rounded-xl">
            <XCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">No Access</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Role-Based Access Control (RBAC) Matrix
              </h2>
              <p className="text-xs text-slate-400">
                OBE System Security & Responsibility Assignment Matrix
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-300">
          <span className="font-semibold text-slate-400">Legend:</span>
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Full Access</span>
          </div>
          <div className="flex items-center space-x-1.5 text-amber-400 font-medium">
            <Eye className="w-4 h-4" />
            <span>View Only</span>
          </div>
          <div className="flex items-center space-x-1.5 text-rose-400 font-medium">
            <XCircle className="w-4 h-4" />
            <span>No Access</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/30">
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3 sm:p-4">Feature / Module</th>
                  {roles.map((role) => (
                    <th
                      key={role}
                      className={`p-3 sm:p-4 text-center ${
                        currentRole === role ? 'bg-sky-500/10 text-sky-400' : ''
                      }`}
                    >
                      {ROLE_LABELS[role]}
                      {currentRole === role && (
                        <span className="block text-[9px] text-sky-400 font-normal uppercase tracking-normal mt-0.5">
                          (Your Active Role)
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {FEATURES.map((feature) => (
                  <tr key={feature.key} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 sm:p-4 font-semibold text-slate-200">
                      <div>{feature.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{feature.path}</span>
                    </td>
                    {roles.map((role) => {
                      const level = RBAC_MATRIX[feature.key][role];
                      return (
                        <td
                          key={role}
                          className={`p-3 sm:p-4 text-center align-middle ${
                            currentRole === role ? 'bg-sky-500/5' : ''
                          }`}
                        >
                          {renderAccessIcon(level)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 text-xs text-slate-400">
          <span>Note: Super Administrator has full operational override across all system modules.</span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};

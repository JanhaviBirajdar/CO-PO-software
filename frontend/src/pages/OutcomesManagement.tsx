import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle2, BookOpen, Sparkles, X, Trash2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { isReadOnly } from '../utils/rbac';
import { ReadOnlyNotice } from '../components/common/ReadOnlyNotice';
import { superAdminStorage, type ProgramOutcomeExtended, type ProgramSpecificOutcomeExtended } from '../utils/superAdminData';

export const OutcomesManagement: React.FC = () => {
  const { user } = useAuth();
  const readOnly = isReadOnly('outcomes', user?.role);
  const [activeTab, setActiveTab] = useState<'pos' | 'psos'>('pos');
  const [pos, setPos] = useState<ProgramOutcomeExtended[]>([]);
  const [psos, setPsos] = useState<ProgramSpecificOutcomeExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    code: '',
    number: 1,
    title: '',
    description: '',
    streamCode: 'ENG',
    targetLevel: 2.4,
  });

  const fetchOutcomes = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pos') {
        const res = await apiClient.get('/courses/pos');
        if (res.data.data && res.data.data.length > 0) {
          setPos(res.data.data);
          return;
        }
      } else {
        const res = await apiClient.get('/courses/psos');
        if (res.data.data && res.data.data.length > 0) {
          setPsos(res.data.data);
          return;
        }
      }
    } catch {
      // Fallback to superAdminStorage
    } finally {
      if (activeTab === 'pos') {
        setPos(superAdminStorage.getPOs());
      } else {
        setPsos(superAdminStorage.getPSOs());
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomes();
  }, [activeTab]);

  const handleOpenModal = () => {
    if (activeTab === 'pos') {
      const nextNum = pos.length + 1;
      setForm({
        code: `PO${nextNum}`,
        number: nextNum,
        title: '',
        description: '',
        streamCode: 'ENG',
        targetLevel: 2.4,
      });
    } else {
      const nextNum = psos.length + 1;
      setForm({
        code: `PSO${nextNum}`,
        number: nextNum,
        title: '',
        description: '',
        streamCode: 'ENG',
        targetLevel: 2.5,
      });
    }
    setShowModal(true);
  };

  const handleCreateOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.description) return;

    if (activeTab === 'pos') {
      superAdminStorage.savePO({
        code: form.code.toUpperCase().trim(),
        number: Number(form.number) || 1,
        title: form.title || form.code,
        description: form.description,
        streamCode: form.streamCode,
        targetLevel: Number(form.targetLevel) || 2.4,
        programId: 1,
        isActive: true,
      });
      try {
        await apiClient.post('/pos', {
          code: form.code.toUpperCase().trim(),
          number: Number(form.number) || 1,
          description: form.description,
          programId: 1,
        });
      } catch {
        // persisted locally
      }
    } else {
      superAdminStorage.savePSO({
        code: form.code.toUpperCase().trim(),
        number: Number(form.number) || 1,
        title: form.title || form.code,
        description: form.description,
        streamCode: form.streamCode,
        targetLevel: Number(form.targetLevel) || 2.5,
        programId: 1,
        isActive: true,
      });
      try {
        await apiClient.post('/psos', {
          code: form.code.toUpperCase().trim(),
          number: Number(form.number) || 1,
          description: form.description,
          programId: 1,
        });
      } catch {
        // persisted locally
      }
    }

    setShowModal(false);
    fetchOutcomes();
  };

  const handleDeleteOutcome = (id: number) => {
    if (activeTab === 'pos') {
      superAdminStorage.deletePO(id);
    } else {
      superAdminStorage.deletePSO(id);
    }
    fetchOutcomes();
  };

  return (
    <div className="space-y-6">
      {readOnly && <ReadOnlyNotice featureName="Program Outcomes (POs & PSOs)" />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Program Outcomes (POs & PSOs)</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Manage standard NBA graduate attributes (PO1 - PO12) and Program Specific Outcomes</p>
        </div>
        {!readOnly && (
          <button
            onClick={handleOpenModal}
            className={`px-4 py-2.5 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer transition-all self-start sm:self-auto ${
              activeTab === 'pos'
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-sky-500/20'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'pos' ? 'Add Program Outcome (PO)' : 'Add Specific Outcome (PSO)'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('pos')}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'pos'
              ? 'border-sky-600 text-sky-800 bg-sky-50 dark:border-sky-400 dark:text-sky-300 dark:bg-sky-500/15'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Target className={`w-4 h-4 ${activeTab === 'pos' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`} />
          <span>Program Outcomes (PO1 - PO12)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-200/60 dark:bg-sky-500/20">{pos.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('psos')}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'psos'
              ? 'border-purple-600 text-purple-800 bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:bg-purple-500/15'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'psos' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`} />
          <span>Program Specific Outcomes (PSOs)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-200/60 dark:bg-purple-500/20">{psos.length}</span>
        </button>
      </div>

      {/* Grid of Outcome Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTab === 'pos' ? (
          pos.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-500 dark:text-slate-400 text-xs bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              No Program Outcomes found in database. Click &ldquo;Add Program Outcome&rdquo; to define POs.
            </div>
          ) : (
            pos.map((po) => (
              <div
                key={po.id}
                className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-sky-500/40 shadow-xs dark:shadow-none transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 font-mono font-bold text-xs border border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30">
                      {po.code}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">PO #{po.number}</span>
                  </div>
                  {po.title && (
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">{po.title}</h4>
                  )}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">{po.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Target: {po.targetLevel || 2.4}/3.0
                  </span>
                  {!readOnly && (
                    <button
                      onClick={() => handleDeleteOutcome(po.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                      title="Delete Outcome"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        ) : (
          psos.map((pso) => (
            <div
              key={pso.id}
              className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-purple-500/40 shadow-xs dark:shadow-none transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-mono font-bold text-xs border border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30">
                    {pso.code}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">PSO #{pso.number}</span>
                </div>
                {pso.title && (
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">{pso.title}</h4>
                )}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">{pso.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-semibold">
                  <BookOpen className="w-3.5 h-3.5" /> Target: {pso.targetLevel || 2.5}/3.0
                </span>
                {!readOnly && (
                  <button
                    onClick={() => handleDeleteOutcome(pso.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                    title="Delete PSO"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>{activeTab === 'pos' ? 'Create Program Outcome (PO)' : 'Create Program Specific Outcome (PSO)'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOutcome} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Attainment (out of 3.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="3.0"
                    value={form.targetLevel}
                    onChange={(e) => setForm({ ...form, targetLevel: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Title / Heading</label>
                <input
                  type="text"
                  placeholder="e.g. Problem Analysis, Modern Tool Usage"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Statement Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Official graduate attribute statement..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

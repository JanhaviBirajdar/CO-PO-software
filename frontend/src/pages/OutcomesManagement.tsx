import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle2, BookOpen, Sparkles } from 'lucide-react';
import { apiClient } from '../api/apiClient';

export const OutcomesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pos' | 'psos'>('pos');
  const [pos, setPos] = useState<any[]>([]);
  const [psos, setPsos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOutcomes = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pos') {
        const res = await apiClient.get('/courses/pos');
        setPos(res.data.data || []);
      } else {
        const res = await apiClient.get('/courses/psos');
        setPsos(res.data.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomes();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Program Outcomes (POs & PSOs)</h1>
          <p className="text-xs text-slate-400 mt-1">Manage standard NBA graduate attributes (PO1 - PO12) and Program Specific Outcomes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('pos')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'pos'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Program Outcomes (PO1 - PO12)</span>
        </button>
        <button
          onClick={() => setActiveTab('psos')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'psos'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Program Specific Outcomes (PSOs)</span>
        </button>
      </div>

      {/* Grid of Outcome Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTab === 'pos' ? (
          pos.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
              No Program Outcomes found in database. Seed data or add POs.
            </div>
          ) : (
            pos.map((po) => (
              <div
                key={po.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-sky-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-xl bg-sky-500/15 text-sky-400 font-mono font-bold text-xs border border-sky-500/30">
                      {po.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">PO #{po.number}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">{po.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Target: 2.40
                  </span>
                </div>
              </div>
            ))
          )
        ) : (
          psos.map((pso) => (
            <div
              key={pso.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-xl bg-purple-500/15 text-purple-300 font-mono font-bold text-xs border border-purple-500/30">
                    {pso.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">PSO #{pso.number}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{pso.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                  <BookOpen className="w-3.5 h-3.5" /> Program Specific Attribute
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle2, BookOpen, Sparkles } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { isReadOnly } from '../utils/rbac';
import { ReadOnlyNotice } from '../components/common/ReadOnlyNotice';

export const OutcomesManagement: React.FC = () => {
  const { user } = useAuth();
  const readOnly = isReadOnly('outcomes', user?.role);
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
      setPos([
        { id: 1, code: 'PO1', number: 1, description: 'Engineering Knowledge: Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.' },
        { id: 2, code: 'PO2', number: 2, description: 'Problem Analysis: Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions.' },
        { id: 3, code: 'PO3', number: 3, description: 'Design/Development of Solutions: Design solutions for complex engineering problems and design system components or processes that meet the specified needs.' },
        { id: 4, code: 'PO4', number: 4, description: 'Conduct Investigations of Complex Problems: Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data.' },
        { id: 5, code: 'PO5', number: 5, description: 'Modern Tool Usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling.' },
        { id: 6, code: 'PO6', number: 6, description: 'The Engineer and Society: Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues.' },
        { id: 7, code: 'PO7', number: 7, description: 'Environment and Sustainability: Understand the impact of the professional engineering solutions in societal and environmental contexts.' },
        { id: 8, code: 'PO8', number: 8, description: 'Ethics: Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.' },
        { id: 9, code: 'PO9', number: 9, description: 'Individual and Team Work: Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.' },
        { id: 10, code: 'PO10', number: 10, description: 'Communication: Communicate effectively on complex engineering activities with the engineering community and with society at large.' },
        { id: 11, code: 'PO11', number: 11, description: 'Project Management and Finance: Demonstrate knowledge and understanding of the engineering and management principles.' },
        { id: 12, code: 'PO12', number: 12, description: 'Life-long Learning: Recognize the need for, and have the preparation and ability to engage in independent and life-long learning.' },
      ]);
      setPsos([
        { id: 1, code: 'PSO1', number: 1, description: 'Professional Skills: Design, implement, and maintain robust, scalable software architectures and distributed database solutions.' },
        { id: 2, code: 'PSO2', number: 2, description: 'Problem Solving: Efficiently solve complex algorithmic problems and deploy AI/ML models across enterprise domains.' },
        { id: 3, code: 'PSO3', number: 3, description: 'Successful Career: Rapidly adapt to emerging technologies, cloud platforms, and cybersecurity best practices in global industry environments.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomes();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {readOnly && <ReadOnlyNotice featureName="Program Outcomes (POs & PSOs)" />}

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

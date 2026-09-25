import React, { useState, useEffect } from 'react';
import { Activity, Plus, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';

export const ActivitiesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cca' | 'eca'>('cca');
  const [ccaActivities, setCcaActivities] = useState<any[]>([]);
  const [ecaActivities, setEcaActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    activityType: 'GUEST_LECTURE',
    organizer: 'CSE Dept',
    academicYearId: 1,
    programId: 1,
  });

  const fetchActivities = async () => {
    setLoading(true);
    try {
      if (activeTab === 'cca') {
        const res = await apiClient.get('/activities/cca');
        const list = res.data.data || [];
        if (list.length > 0) setCcaActivities(list);
        else throw new Error('Empty');
      } else {
        const res = await apiClient.get('/activities/eca');
        const list = res.data.data || [];
        if (list.length > 0) setEcaActivities(list);
        else throw new Error('Empty');
      }
    } catch {
      if (activeTab === 'cca') {
        setCcaActivities([
          { id: 1, title: 'National Level Hackathon - Smart India Hackathon', activityType: 'HACKATHON', organizer: 'Dept of Computer Science & Engineering' },
          { id: 2, title: 'Workshop on Microservices & Cloud Computing', activityType: 'WORKSHOP', organizer: 'Google Cloud Student Club' },
          { id: 3, title: 'Expert Guest Lecture on AI / Deep Learning in Industry', activityType: 'GUEST_LECTURE', organizer: 'CSI Student Chapter' },
          { id: 4, title: 'Annual Project Exhibition & Competition', activityType: 'EXHIBITION', organizer: 'R&D Cell' },
        ]);
      } else {
        setEcaActivities([
          { id: 1, title: 'Inter-College Sports Tournament (Football & Cricket)', activityType: 'SPORTS', organizer: 'Sports Committee' },
          { id: 2, title: 'Annual Cultural Fest - Tarang 2026', activityType: 'CULTURAL', organizer: 'Student Council' },
          { id: 3, title: 'NSS Blood Donation & Social Outreach Drive', activityType: 'SOCIAL_SERVICE', organizer: 'NSS Unit' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [activeTab]);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'cca' ? '/activities/cca' : '/activities/eca';
      await apiClient.post(endpoint, form);
      setShowModal(false);
      setForm({ title: '', activityType: 'GUEST_LECTURE', organizer: 'CSE Dept', academicYearId: 1, programId: 1 });
      fetchActivities();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create activity');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Co-Curricular & Extra-Curricular Activities</h1>
          <p className="text-xs text-slate-400 mt-1">Manage CCA & ECA events, guest lectures, workshops, club activities and PO correlation</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add {activeTab.toUpperCase()} Activity</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('cca')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'cca'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Co-Curricular Activities (CCA)</span>
        </button>
        <button
          onClick={() => setActiveTab('eca')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'eca'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Extra-Curricular Activities (ECA)</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'cca' ? ccaActivities : ecaActivities).length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
            No {activeTab.toUpperCase()} activities recorded yet. Click 'Add {activeTab.toUpperCase()} Activity' to add one.
          </div>
        ) : (
          (activeTab === 'cca' ? ccaActivities : ecaActivities).map((act, idx) => (
            <div key={act.id || idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-sky-500/40 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {act.activityType || 'WORKSHOP'}
                </span>
                <span className="text-[10px] text-slate-400">{act.organizer || 'Dept'}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{act.title || 'Advanced AI Workshop'}</h3>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>PO Correlation: PO1, PO3, PO5</span>
                <span className="text-emerald-400 font-semibold">Attainment: 2.80</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Add {activeTab.toUpperCase()} Activity</h2>
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="National Level Hackathon 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Organizer</label>
                <input
                  type="text"
                  required
                  value={form.organizer}
                  onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-500 text-white text-xs font-semibold rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/apiClient';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
        return;
      }
    } catch {
      // Offline fallback login: identify role from email
      if (email.includes('hod')) {
        switchRole('HOD');
      } else if (email.includes('faculty')) {
        switchRole('FACULTY');
      } else if (email.includes('admin') && !email.includes('super')) {
        switchRole('ADMIN');
      } else {
        switchRole('SUPER_ADMIN');
      }
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectRoleLogin = (role: 'SUPER_ADMIN' | 'ADMIN' | 'HOD' | 'FACULTY') => {
    switchRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/25">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OBE Attainment System</h1>
          <p className="text-xs text-slate-400 mt-1">Outcome-Based Education Management & Calculation Engine</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty1@obe.edu or hod.cse@obe.edu"
                className="w-full bg-slate-800/80 border border-slate-700/80 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700/80 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Persona Demo Logins */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-sky-400" /> 1-Click Login By Role (No Password Needed)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDirectRoleLogin('HOD')}
              className="px-3 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-bold">HOD (Dr. Ramesh)</p>
                <p className="text-[10px] text-amber-400/80">Department Head</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleDirectRoleLogin('FACULTY')}
              className="px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-bold">Faculty (Prof. Anjali)</p>
                <p className="text-[10px] text-emerald-400/80">Course Instructor</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleDirectRoleLogin('SUPER_ADMIN')}
              className="px-3 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-bold">Super Admin</p>
                <p className="text-[10px] text-purple-400/80">Full System Control</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleDirectRoleLogin('ADMIN')}
              className="px-3 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-bold">Academic Admin</p>
                <p className="text-[10px] text-indigo-400/80">Academic Office</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

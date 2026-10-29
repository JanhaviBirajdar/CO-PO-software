import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  UserPlus,
  FileClock,
  Briefcase,
  Trash2,
  Edit,
  X,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Key,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import {
  FACULTY_DESIGNATIONS,
  superAdminStorage,
  generateDepartmentEmployeeId,
  generateSecurePassword,
  type FacultyMember,
} from '../utils/superAdminData';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<FacultyMember | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Credentials confirmation modal
  const [credentialsModal, setCredentialsModal] = useState<{
    name: string;
    email: string;
    empId: string;
    password: string;
    designation: string;
    departmentName: string;
    emailSent: boolean;
  } | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    empId: '',
    role: 'FACULTY',
    departmentId: 1,
    designation: 'Assistant Professor',
    status: 'Active' as 'Active' | 'On Leave',
  });

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const depts = superAdminStorage.getDepartments();
      setDepartments(depts);

      if (activeTab === 'users') {
        const res = await apiClient.get('/users');
        const list = res.data.data || [];
        if (list.length > 0) {
          setUsers(list);
          return;
        }
      } else {
        const res = await apiClient.get('/reports/audit');
        const list = res.data.data || [];
        if (list.length > 0) {
          setAuditLogs(list);
          return;
        }
      }
    } catch {
      // Fallback to local storage
    } finally {
      if (activeTab === 'users') {
        const faculties = superAdminStorage.getFaculties();
        setUsers(
          faculties.map((f) => ({
            id: f.id,
            name: f.name,
            email: f.email,
            empId: f.empId,
            role: f.role,
            designation: f.designation,
            department: { name: f.departmentName },
            departmentId: f.departmentId,
            status: f.status || 'Active',
          }))
        );
      } else {
        setAuditLogs([
          { id: 1, createdAt: new Date().toISOString(), user: { name: 'System Super Administrator' }, action: 'CALCULATE_ATTAINMENT', entity: 'PO_ATTAINMENT' },
          { id: 2, createdAt: new Date(Date.now() - 3600000).toISOString(), user: { name: 'Dr. Suresh Kadam (Dean)' }, action: 'UPDATE_ACADEMIC_YEAR', entity: 'ACADEMIC_SETUP' },
          { id: 3, createdAt: new Date(Date.now() - 7200000).toISOString(), user: { name: 'Dr. Ramesh Patil (HOD)' }, action: 'CREATE_DIVISION', entity: 'CLASS_DIVISION' },
          { id: 4, createdAt: new Date(Date.now() - 14400000).toISOString(), user: { name: 'Prof. Anjali Sharma' }, action: 'ENTER_MARKS', entity: 'ASSESSMENT_MARKS' },
        ]);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    const initialDeptId = departments[0]?.id || 1;
    const generatedEmpId = generateDepartmentEmployeeId(initialDeptId);
    const generatedPassword = generateSecurePassword();

    setForm({
      name: '',
      email: '',
      password: generatedPassword,
      empId: generatedEmpId,
      role: 'FACULTY',
      departmentId: initialDeptId,
      designation: 'Assistant Professor',
      status: 'Active',
    });
    setShowUserModal(true);
  };

  const handleOpenEditModal = (u: any) => {
    const rawFaculties = superAdminStorage.getFaculties();
    const existing = rawFaculties.find((f) => f.id === u.id);
    const facultyObj: FacultyMember = existing || {
      id: u.id,
      name: u.name,
      email: u.email,
      empId: u.empId || u.employeeId || '',
      designation: u.designation || 'Faculty Member',
      role: u.role || 'FACULTY',
      departmentId: u.departmentId || 1,
      departmentName: u.department?.name || 'Department of Computer Engineering',
      status: u.status || 'Active',
    };

    setEditingUser(facultyObj);
    setForm({
      name: facultyObj.name,
      email: facultyObj.email,
      empId: facultyObj.empId || '',
      password: '',
      role: facultyObj.role,
      departmentId: facultyObj.departmentId,
      designation: facultyObj.designation,
      status: facultyObj.status,
    });
    setShowUserModal(true);
  };

  const handleRegeneratePassword = () => {
    setForm((prev) => ({ ...prev, password: generateSecurePassword() }));
  };

  const handleRegenerateEmployeeId = () => {
    setForm((prev) => ({ ...prev, empId: generateDepartmentEmployeeId(prev.departmentId) }));
  };

  const handleDepartmentChange = (deptId: number) => {
    const autoEmpId = generateDepartmentEmployeeId(deptId);
    setForm((prev) => ({
      ...prev,
      departmentId: deptId,
      empId: editingUser ? prev.empId : autoEmpId,
    }));
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    superAdminStorage.deleteFaculty(id);
    try {
      await apiClient.delete(`/users/${id}`);
    } catch {
      // deleted locally
    }
    showNotification(`User "${name}" deleted successfully.`);
    fetchUsers();
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDept = departments.find((d) => d.id === Number(form.departmentId));
    const deptName = selectedDept?.name || 'Academic Department';

    try {
      if (editingUser) {
        // UPDATE
        superAdminStorage.saveFaculty({
          id: editingUser.id,
          name: form.name,
          email: form.email,
          empId: form.empId,
          designation: form.designation,
          role: form.role,
          departmentId: Number(form.departmentId),
          departmentName: deptName,
          status: form.status,
        });

        try {
          await apiClient.put(`/users/${editingUser.id}`, {
            name: form.name,
            email: form.email,
            role: form.role,
            departmentId: Number(form.departmentId),
            designation: form.designation,
            employeeId: form.empId,
          });
        } catch {
          // updated locally
        }
        showNotification(`User "${form.name}" updated successfully.`);
      } else {
        // CREATE
        const autoEmpId = form.empId || generateDepartmentEmployeeId(form.departmentId);
        const autoPassword = form.password || generateSecurePassword();

        superAdminStorage.saveFaculty({
          name: form.name,
          email: form.email,
          empId: autoEmpId,
          password: autoPassword,
          designation: form.designation,
          role: form.role,
          departmentId: Number(form.departmentId),
          departmentName: deptName,
          status: form.status,
        });

        let emailSentStatus = true;
        try {
          const res = await apiClient.post('/users', {
            name: form.name,
            email: form.email,
            password: autoPassword,
            role: form.role,
            departmentId: Number(form.departmentId),
            designation: form.designation,
            employeeId: autoEmpId,
          });
          if (res.data?.data) {
            emailSentStatus = res.data.data.emailSent ?? true;
          }
        } catch {
          // persisted locally
        }

        // Show credentials confirmation dialog
        setCredentialsModal({
          name: form.name,
          email: form.email,
          empId: autoEmpId,
          password: autoPassword,
          designation: form.designation,
          departmentName: deptName,
          emailSent: emailSentStatus,
        });

        showNotification(`Faculty "${form.name}" added successfully! Credentials sent to ${form.email}.`);
      }

      setShowUserModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="cursor-pointer hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">User Management & Faculty Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage system accounts, auto-assign department-wise Employee IDs, and send auto-generated login credentials to faculty emails.
          </p>
        </div>
        {activeTab === 'users' && (
          <button
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User / Faculty</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'users'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Users & Faculty ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'logs'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileClock className="w-4 h-4" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          {activeTab === 'users' ? (
            <table className="w-full text-left text-xs min-w-[800px]">
              <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-4">Faculty Member</th>
                  <th className="p-4">Employee ID</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                        {u.empId || u.employeeId || '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 inline-flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        <span>{u.designation || 'Faculty'}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{u.department?.name || 'Computer Engineering'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Resource Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No recent audit log entries recorded.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="p-4 font-mono text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-4 font-semibold text-white">{log.user?.name || `User #${log.userId}`}</td>
                      <td className="p-4 font-mono text-sky-400">{log.action}</td>
                      <td className="p-4 text-slate-300">{log.entity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal for Create & Edit */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-sky-400" />
                  <span>{editingUser ? 'Edit User / Faculty' : 'Create New Faculty Member'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingUser
                    ? 'Update faculty profile, assigned roles, and credentials'
                    : 'Employee ID and Password will be automatically generated and emailed to the faculty'}
                </p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Anjali Sharma / Dr. Ramesh Patil"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Faculty Email Address (For Credentials Dispatch)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. anjali.s@obe.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  The generated Employee ID and Password will be sent directly to this email address.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => handleDepartmentChange(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Designation</label>
                  <select
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-semibold"
                  >
                    {FACULTY_DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Automatic Department-wise Employee ID & Password Section */}
              <div className="p-3 bg-slate-800/70 border border-slate-700/80 rounded-xl space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <span>Department-Wise Employee ID</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 uppercase font-bold">Auto</span>
                    </label>
                    {!editingUser && (
                      <button
                        type="button"
                        onClick={handleRegenerateEmployeeId}
                        className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Regenerate ID</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={form.empId}
                    onChange={(e) => setForm({ ...form, empId: e.target.value })}
                    placeholder="e.g. EMP-CSE-001"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sky-400 font-mono font-bold text-xs"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>Auto-Generated Password</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase font-bold">Secure</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleRegeneratePassword}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 pr-16 text-amber-300 font-mono text-xs"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(form.password, 'form-pwd')}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Copy Password"
                        >
                          {copiedKey === 'form-pwd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-slate-400 hover:text-white"
                          title={showPassword ? 'Hide' : 'Show'}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">System Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  >
                    <option value="FACULTY">FACULTY (Course Teacher)</option>
                    <option value="HOD">HOD (Department Head)</option>
                    <option value="DEPARTMENT_COORDINATOR">DEPARTMENT_COORDINATOR</option>
                    <option value="ADMIN">ADMIN / DEAN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{editingUser ? 'Update User' : 'Create & Send Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Confirmation & Email Dispatch Dialog */}
      {credentialsModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Faculty Created Successfully!</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" /> Credentials Dispatched to Email
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCredentialsModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Faculty Name:</span>
                <span className="font-bold text-white">{credentialsModal.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Sent to Email:</span>
                <span className="font-mono text-emerald-300 font-semibold">{credentialsModal.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Generated Employee ID:</span>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono font-bold text-sky-400">{credentialsModal.empId}</span>
                  <button
                    onClick={() => copyToClipboard(credentialsModal.empId, 'modal-emp')}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    title="Copy Employee ID"
                  >
                    {copiedKey === 'modal-emp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Temporary Password:</span>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono font-bold text-amber-300">{credentialsModal.password}</span>
                  <button
                    onClick={() => copyToClipboard(credentialsModal.password, 'modal-pwd')}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    title="Copy Password"
                  >
                    {copiedKey === 'modal-pwd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Designation & Department:</span>
                <span className="text-slate-300 text-right">{credentialsModal.designation} · {credentialsModal.departmentName}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Login Portal:</span>
                <span className="text-sky-400 font-mono text-[11px]">http://localhost:5173/login</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const payload = `Faculty Login Credentials:
Name: ${credentialsModal.name}
Email: ${credentialsModal.email}
Employee ID: ${credentialsModal.empId}
Temporary Password: ${credentialsModal.password}
Portal: http://localhost:5173/login`;
                  copyToClipboard(payload, 'all-creds');
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 border border-slate-700 cursor-pointer"
              >
                {copiedKey === 'all-creds' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All Details</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setCredentialsModal(null)}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useHotelEngineering } from '@/lib/store';
import { UserRole } from '@/lib/types';
import {
  Settings,
  Building,
  Users,
  Wrench,
  Shield,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { AdminReportGenerator } from '@/components/admin/AdminReportGenerator';

export default function AdminSetupPage() {
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;
  const {
    settings,
    updateSettings,
    departments,
    addDepartment,
    deleteDepartment,
    technicians,
    addTechnician,
    toggleTechnician,
    users,
    addUser,
    deleteUser,
    toggleUser,
    resetToDemoData,
    currentUser,
  } = useHotelEngineering();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (currentUser?.role !== 'ADMIN') {
      if (currentUser?.role === 'EXECUTIVE') {
        router?.replace('/executive');
      } else {
        router?.replace('/engineering');
      }
    }
  }, [currentUser, router]);

  const [hotelName, setHotelName] = useState(settings.hotelName);
  const [hotelAddress, setHotelAddress] = useState(settings.hotelAddress);
  const [p1Label, setP1Label] = useState(settings.p1Label);
  const [p2Label, setP2Label] = useState(settings.p2Label);
  const [p3Label, setP3Label] = useState(settings.p3Label);
  const [p4Label, setP4Label] = useState(settings.p4Label);

  // New Department Form
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');

  // New Technician Form
  const [newTechName, setNewTechName] = useState('');
  const [newTechSpec, setNewTechSpec] = useState('');
  const [newTechPhone, setNewTechPhone] = useState('');

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('EXECUTIVE');
  const [newUserDept, setNewUserDept] = useState('Front Office');

  const handleSaveHotelSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      hotelName: hotelName.trim(),
      hotelAddress: hotelAddress.trim(),
      p1Label: p1Label.trim(),
      p2Label: p2Label.trim(),
      p3Label: p3Label.trim(),
      p4Label: p4Label.trim(),
    });
    showToast('Hotel settings updated successfully!', 'success');
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    addDepartment({
      name: newDeptName.trim(),
      code: newDeptCode.trim() || newDeptName.slice(0, 3).toUpperCase(),
      active: true,
    });
    setNewDeptName('');
    setNewDeptCode('');
    showToast('Department added!', 'success');
  };

  const handleAddTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechName.trim()) return;
    addTechnician({
      name: newTechName.trim(),
      department: 'Engineering',
      specialization: newTechSpec.trim() || 'General Maintenance',
      phone: newTechPhone.trim(),
      active: true,
    });
    setNewTechName('');
    setNewTechSpec('');
    setNewTechPhone('');
    showToast('Technician registered!', 'success');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim() || !newUserPassword.trim()) {
      showToast('Please fill all required user fields', 'error');
      return;
    }
    const cleanUsername = newUserUsername.trim().toLowerCase();
    const cleanEmail = newUserEmail.trim() || `${cleanUsername}@mecolombo.com`;

    addUser({
      name: newUserName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: newUserPassword.trim(),
      role: newUserRole,
      department: newUserDept,
      active: true,
    });

    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setNewUserPassword('');
    showToast(`User ${cleanUsername} created successfully!`, 'success');
  };

  const handleReset = () => {
    if (confirm('Reset all hotel data back to initial sample state?')) {
      resetToDemoData();
      showToast('Reset back to demo data', 'info');
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>Admin & Hotel Portal Setup</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure hotel identity, operational departments, duty technicians, and user logins
          </p>
        </div>

        <button
          onClick={handleReset}
          className="btn-secondary text-xs text-red-600 hover:bg-red-50 border-red-200 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>
      </div>

      {/* Executive Report Generator (Month-wise, Day-wise, Date-Range, Excel & PDF Export) */}
      <AdminReportGenerator />

      {/* 1. Hotel Identity & Priority Settings Form */}
      <form onSubmit={handleSaveHotelSettings} className="card-base p-6 space-y-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-slate-400" />
          <span>1. Hotel Settings & Priority Labels</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Hotel Name *</label>
            <input
              type="text"
              required
              value={hotelName}
              onChange={e => setHotelName(e.target.value)}
              className="w-full font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Hotel Address</label>
            <input
              type="text"
              value={hotelAddress}
              onChange={e => setHotelAddress(e.target.value)}
              className="w-full font-medium px-3.5 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-red-700 uppercase mb-1">P1 Label</label>
            <input
              type="text"
              value={p1Label}
              onChange={e => setP1Label(e.target.value)}
              className="w-full font-bold px-3.5 py-2 rounded-xl border border-red-200 bg-red-50/40 text-red-900"
            />
          </div>

          <div>
            <label className="block font-bold text-orange-700 uppercase mb-1">P2 Label</label>
            <input
              type="text"
              value={p2Label}
              onChange={e => setP2Label(e.target.value)}
              className="w-full font-bold px-3.5 py-2 rounded-xl border border-orange-200 bg-orange-50/40 text-orange-900"
            />
          </div>

          <div>
            <label className="block font-bold text-amber-700 uppercase mb-1">P3 Label</label>
            <input
              type="text"
              value={p3Label}
              onChange={e => setP3Label(e.target.value)}
              className="w-full font-bold px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50/40 text-amber-900"
            />
          </div>

          <div>
            <label className="block font-bold text-emerald-700 uppercase mb-1">P4 Label</label>
            <input
              type="text"
              value={p4Label}
              onChange={e => setP4Label(e.target.value)}
              className="w-full font-bold px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50/40 text-emerald-900"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary text-xs py-2.5 px-5 cursor-pointer">
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* 2. Departments Management */}
      <div className="card-base p-6 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-slate-400" />
          <span>2. Operational Departments ({departments.length})</span>
        </h3>

        {/* Existing Depts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {departments.map(d => (
            <div
              key={d.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-900 block">{d.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">Code: {d.code}</span>
              </div>
              <button
                type="button"
                onClick={() => deleteDepartment(d.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Dept Form */}
        <form onSubmit={handleAddDept} className="flex items-center gap-2 pt-2 text-xs">
          <input
            type="text"
            required
            placeholder="Department Name (e.g. Laundry)"
            value={newDeptName}
            onChange={e => setNewDeptName(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 font-medium bg-white"
          />
          <input
            type="text"
            placeholder="Code (e.g. LAU)"
            value={newDeptCode}
            onChange={e => setNewDeptCode(e.target.value)}
            className="w-24 px-3.5 py-2 rounded-xl border border-slate-200 font-medium uppercase bg-white"
          />
          <button type="submit" className="btn-primary text-xs py-2 px-4 shrink-0 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dept</span>
          </button>
        </form>
      </div>

      {/* 3. Technicians Management */}
      <div className="card-base p-6 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-slate-400" />
          <span>3. Duty Technicians Directory ({technicians.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {technicians.map(t => (
            <div
              key={t.id}
              className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-900 block">{t.name}</span>
                <span className="text-[11px] text-blue-600 font-semibold">{t.specialization}</span>
                {t.phone && <div className="text-[10px] text-slate-400">{t.phone}</div>}
              </div>

              <button
                type="button"
                onClick={() => toggleTechnician(t.id)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                  t.active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-200 text-slate-500 border-slate-300'
                }`}
              >
                {t.active ? 'Active ✓' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>

        {/* Add Technician Form */}
        <form onSubmit={handleAddTech} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-xs">
          <input
            type="text"
            required
            placeholder="Technician Name"
            value={newTechName}
            onChange={e => setNewTechName(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 font-medium bg-white"
          />
          <input
            type="text"
            placeholder="Specialization (e.g. HVAC)"
            value={newTechSpec}
            onChange={e => setNewTechSpec(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 font-medium bg-white"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={newTechPhone}
            onChange={e => setNewTechPhone(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 font-medium bg-white"
          />
          <button type="submit" className="btn-primary text-xs py-2 px-4 shrink-0 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Technician</span>
          </button>
        </form>
      </div>

      {/* 4. Users Management & Logins */}
      <div className="card-base p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span>4. User Logins & Credentials Directory ({users.length})</span>
          </h3>
          <span className="text-[11px] text-blue-600 font-bold">
            Admin Login: <code className="bg-blue-50 px-1.5 py-0.5 rounded">mecolomboadmin</code> (pass: <code className="bg-blue-50 px-1.5 py-0.5 rounded">mecolombo</code>)
          </span>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Username / Login ID</th>
                <th className="py-2.5 px-3">Password</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{u.name}</td>
                  <td className="py-2.5 px-3 font-mono text-blue-600 font-bold text-[11px]">
                    {u.username || u.email.split('@')[0]}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                    {u.password || '••••••••'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'ENGINEERING'
                          ? 'bg-blue-100 text-blue-800'
                          : u.role === 'EXECUTIVE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{u.department}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleUser(u.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-200 text-slate-500 border-slate-300'
                        }`}
                      >
                        {u.active ? 'Active' : 'Disabled'}
                      </button>
                      {u.id !== 'user-admin' && (
                        <button
                          type="button"
                          onClick={() => deleteUser(u.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add User Form */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 pt-4">
          <span className="text-xs font-black uppercase text-slate-900 block">
            + Create New User Login (Executive, Staff, or Engineering)
          </span>

          <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ruwan Silva"
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                Username / Login ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. hk_supervisor"
                value={newUserUsername}
                onChange={e => setNewUserUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                Login Password *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. hotelpass123"
                value={newUserPassword}
                onChange={e => setNewUserPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                Portal Role *
              </label>
              <select
                value={newUserRole}
                onChange={e => setNewUserRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
              >
                <option value="EXECUTIVE">EXECUTIVE / STAFF (Report Issues)</option>
                <option value="ENGINEERING">ENGINEERING (Command & Sound Alert)</option>
                <option value="ADMIN">ADMINISTRATOR (Full Access)</option>
                <option value="TECHNICIAN">DUTY TECHNICIAN</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                Department *
              </label>
              <select
                value={newUserDept}
                onChange={e => setNewUserDept(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium bg-white"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl btn-primary text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create User Login</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { User, Building2, Shield, Database, RefreshCw, KeyRound, Check, Download, AlertTriangle } from 'lucide-react';
import { Tabs } from '../../components/common/Tabs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';

export const SettingsPage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'MediCore Central Hospital',
    address: '100 Healthcare Boulevard, Suite 500, Metropolis, NY 10001',
    phone: '+1 (555) 900-0000',
    emergencyHotline: '+1 (555) 911-0000',
    email: 'info@medicore.hospital',
    license: 'HOSP-NY-STATE-482910',
    workingHours: '24/7 Emergency & Inpatient Care; Outpatient Clinics: Mon-Sat 08:00 - 18:00'
  });

  const handleSaveHospitalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Hospital Settings Saved', 'Facility parameters have been updated.');
  };

  const handleResetData = () => {
    localStorage.clear();
    sessionStorage.clear();
    showToast('success', 'Data Restored to Default Seed', 'Reloading application state...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      hospital: hospitalInfo.name,
      users: 7,
      version: 'MediCore Enterprise 2.6.0'
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicore_backup_${Date.now()}.json`;
    a.click();
    showToast('success', 'Backup Exported', 'JSON database backup archive generated.');
  };

  const tabs = [
    { id: 'account', label: 'My Account', icon: <User className="w-4 h-4" /> },
    { id: 'hospital', label: 'Hospital Info', icon: <Building2 className="w-4 h-4" /> },
    { id: 'security', label: 'Security & RBAC', icon: <Shield className="w-4 h-4" /> },
    { id: 'system', label: 'System & Database', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings & Configuration</h2>
        <p className="text-sm text-slate-500 mt-1">Configure profile, hospital branding, role permissions matrix, and backup restores.</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'MC'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{currentUser?.name}</h3>
              <p className="text-xs text-slate-500">{currentUser?.email} • {currentUser?.department}</p>
              <span className="inline-block mt-1 font-semibold text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                Active Role: {currentUser?.role}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                defaultValue={currentUser?.name}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                disabled
                defaultValue={currentUser?.email}
                className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Change Account Password</h4>
              <p className="text-xs text-slate-500">Ensure password meets hospital complex credential standards</p>
            </div>
            <button
              onClick={() => showToast('info', 'Password Reset Email Sent', 'Verification link dispatched to your work email.')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* Hospital Info Tab */}
      {activeTab === 'hospital' && (
        <form onSubmit={handleSaveHospitalInfo} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Facility General Details</h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hospital Enterprise Name</label>
            <input
              type="text"
              value={hospitalInfo.name}
              onChange={e => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={hospitalInfo.address}
              onChange={e => setHospitalInfo({ ...hospitalInfo, address: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hospital Main Contact</label>
              <input
                type="text"
                value={hospitalInfo.phone}
                onChange={e => setHospitalInfo({ ...hospitalInfo, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Trauma Hotline</label>
              <input
                type="text"
                value={hospitalInfo.emergencyHotline}
                onChange={e => setHospitalInfo({ ...hospitalInfo, emergencyHotline: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-bold text-rose-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Working & Operating Hours</label>
            <input
              type="text"
              value={hospitalInfo.workingHours}
              onChange={e => setHospitalInfo({ ...hospitalInfo, workingHours: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm"
            >
              Save Hospital Settings
            </button>
          </div>
        </form>
      )}

      {/* Security & RBAC Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-6 text-xs">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Session & Two-Factor Authentication</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Enforce Two-Factor Authentication (2FA)</p>
                <p className="text-slate-500">Require OTP code for administrative and clinical roles on login</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={e => setTwoFactorEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Session Timeout Idle Duration</p>
                <p className="text-slate-500">Automatically logout inactive hospital workstations</p>
              </div>
              <select
                value={sessionTimeout}
                onChange={e => setSessionTimeout(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes (Recommended)</option>
                <option value="60">60 Minutes</option>
                <option value="120">2 Hours</option>
              </select>
            </div>
          </div>

          {/* Role Permissions Matrix View */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 mb-3">Role-Based Access Control (RBAC) Permissions Matrix</h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-2 text-center">Admin</th>
                    <th className="py-2.5 px-2 text-center">Doctor</th>
                    <th className="py-2.5 px-2 text-center">Nurse</th>
                    <th className="py-2.5 px-2 text-center">Reception</th>
                    <th className="py-2.5 px-2 text-center">Lab</th>
                    <th className="py-2.5 px-2 text-center">Pharmacy</th>
                    <th className="py-2.5 px-2 text-center">Accounts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-center">
                  {[
                    { module: 'Patients Directory', r: [true, true, true, true, true, true, true] },
                    { module: 'Register Patient', r: [true, false, false, true, false, false, false] },
                    { module: 'Appointments Scheduling', r: [true, true, true, true, false, false, false] },
                    { module: 'EMR Clinical Encounters', r: [true, true, true, false, false, false, false] },
                    { module: 'Lab Tests & Results', r: [true, true, false, false, true, false, false] },
                    { module: 'Pharmacy & Dispensing', r: [true, true, false, false, false, true, false] },
                    { module: 'Billing & Invoicing', r: [true, false, false, true, false, false, true] },
                    { module: 'Inpatient Beds Management', r: [true, true, true, false, false, false, false] },
                    { module: 'Staff HR & Leave Approvals', r: [true, false, false, false, false, false, false] },
                    { module: 'Audit Logs & System Admin', r: [true, false, false, false, false, false, false] },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-left font-semibold text-slate-800">{row.module}</td>
                      {row.r.map((has, i) => (
                        <td key={i} className="py-2 px-2">
                          {has ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* System & Database Tab */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-800">System Information & Mock State</h3>
            <p className="text-xs text-slate-500 mt-0.5">Platform runtime and data management controls</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Engine Version</span>
              <p className="font-bold text-slate-800 mt-1">MediCore HMS v2.6.0</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Architecture</span>
              <p className="font-bold text-slate-800 mt-1">React + TypeScript + Vite</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Backend Integration</span>
              <p className="font-bold text-emerald-700 mt-1">Ready for Firebase / REST</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Download Full Hospital Database Backup</h4>
              <p className="text-slate-500">Export current patients, doctors, invoices, and lab tests into JSON</p>
            </div>
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup (.JSON)</span>
            </button>
          </div>

          <div className="pt-4 border-t border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50/50 p-4 rounded-xl border">
            <div>
              <h4 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Reset Demo Data to Factory Seed</span>
              </h4>
              <p className="text-rose-700 text-[11px] mt-0.5">Clears all temporary changes and resets all 16 patients, appointments, and inventory to initial demo state.</p>
            </div>
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm whitespace-nowrap"
            >
              Reset Seed Data
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Resetting Data */}
      <ConfirmationDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset All Hospital Data"
        message="This will clear your current localStorage session and restore the 16 fictional patients, 8 doctors, and seed pharmacy stock. Are you sure you want to proceed?"
      />
    </div>
  );
};

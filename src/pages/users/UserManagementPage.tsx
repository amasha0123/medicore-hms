
import React, { useState } from 'react';
import { UserCheck, Plus, Shield, RefreshCw, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';
import { User, UserRole } from '../../types/auth';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { getRoleDisplayName } from '../../utils/permissions';

export const UserManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(() => authService.getAllUsers());
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'DOCTOR' as UserRole,
    department: 'Cardiology',
    status: 'Active' as User['status']
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const created = authService.createUser(newUser);
    setUsers(authService.getAllUsers());
    setCreateModalOpen(false);
    showToast('success', 'User Created', `New account created for ${created.name} (${created.role})`);
  };

  const handleToggleStatus = (user: User) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    authService.updateUser(user.id, { status: nextStatus });
    setUsers(authService.getAllUsers());
    showToast('info', 'User Status Changed', `${user.name} is now ${nextStatus}`);
  };

  const handleResetPassword = (user: User) => {
    showToast('success', 'Temporary Password Generated', `Temporary login code emailed to ${user.email}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">User Account Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage system logins, role allocations, security access levels, and account status.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100 font-semibold">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-800">{u.name}</td>
                <td className="py-3 px-4 font-mono text-slate-500">{u.email}</td>
                <td className="py-3 px-4">
                  <span className="font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                    {getRoleDisplayName(u.role)}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">{u.department}</td>
                <td className="py-3 px-4"><StatusBadge status={u.status} size="sm" /></td>
                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{u.lastLogin || '--'}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleResetPassword(u)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      title="Reset Password"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      {u.status === 'Active' ? 'Disable' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create MediCore User Account">
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Arthur Conan"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
            <input
              type="email"
              required
              placeholder="user@medicore.hospital"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="ADMIN">Administrator</option>
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="LAB_STAFF">Laboratory Staff</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="ACCOUNTANT">Accountant</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={newUser.department}
                onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm">Save User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

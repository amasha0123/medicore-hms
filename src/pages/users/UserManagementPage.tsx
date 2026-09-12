import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Plus,
  KeyRound,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Building2,
  ShieldCheck,
  Phone,
  Mail,
  User as UserIcon
} from 'lucide-react';
import { userService, ApiUser, Department } from '../../services/userService';
import { authService } from '../../services/authService';
import { UserRole } from '../../types/auth';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { getRoleDisplayName } from '../../utils/permissions';
import { formatDate } from '../../utils/formatters';

export const UserManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'ACTIVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);

  // Approve Form State
  const [approveRole, setApproveRole] = useState<UserRole>('DOCTOR');
  const [approveDeptId, setApproveDeptId] = useState<string>('');
  const [submittingApprove, setSubmittingApprove] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'DOCTOR' as UserRole,
    department: 'Cardiology',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedUsers, fetchedDepts] = await Promise.all([
        userService.getUsers(),
        userService.getDepartments()
      ]);
      setUsers(fetchedUsers);
      setDepartments(fetchedDepts);
      if (fetchedDepts.length > 0 && !approveDeptId) {
        setApproveDeptId(fetchedDepts[0].id);
      }
    } catch {
      showToast('error', 'Error Loading Users', 'Failed to retrieve user accounts.');
    } finally {
      setLoading(false);
    }
  }, [approveDeptId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Approve Modal
  const handleOpenApproveModal = (user: ApiUser) => {
    setSelectedUser(user);
    setApproveRole('DOCTOR');
    if (departments.length > 0) {
      setApproveDeptId(departments[0].id);
    }
    setApproveModalOpen(true);
  };

  // Submit Approval
  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setSubmittingApprove(true);
      await userService.approveUser(selectedUser.id, {
        role: approveRole,
        departmentId: approveDeptId || undefined
      });

      showToast(
        'success',
        'Staff Account Approved',
        `${selectedUser.name} has been assigned the role ${getRoleDisplayName(approveRole)} and activated.`
      );
      setApproveModalOpen(false);
      setSelectedUser(null);
      await loadData();
    } catch (err: any) {
      showToast(
        'error',
        'Approval Failed',
        err?.message || 'Could not approve staff registration.'
      );
    } finally {
      setSubmittingApprove(false);
    }
  };

  // Open Reject Modal
  const handleOpenRejectModal = (user: ApiUser) => {
    setSelectedUser(user);
    setRejectModalOpen(true);
  };

  // Submit Rejection
  const handleConfirmRejection = async () => {
    if (!selectedUser) return;
    try {
      await userService.rejectUser(selectedUser.id);
      showToast('warning', 'Registration Rejected', `${selectedUser.name}'s registration was declined.`);
      setRejectModalOpen(false);
      setSelectedUser(null);
      await loadData();
    } catch (err: any) {
      showToast('error', 'Action Failed', err?.message || 'Failed to reject registration.');
    }
  };

  // Toggle Active/Inactive status
  const handleToggleStatus = async (user: ApiUser) => {
    const nextActive = user.status !== 'Active';
    try {
      await userService.toggleStatus(user.id, nextActive);
      showToast(
        'info',
        'User Status Changed',
        `${user.name} is now ${nextActive ? 'Active' : 'Inactive'}`
      );
      await loadData();
    } catch (err: any) {
      showToast('error', 'Status Change Failed', err?.message || 'Failed to change status.');
    }
  };

  // Reset Password
  const handleResetPassword = async (user: ApiUser) => {
    try {
      await userService.resetPassword(user.id);
      showToast(
        'success',
        'Password Reset',
        `Temporary login code emailed to ${user.email}`
      );
    } catch (err: any) {
      showToast('error', 'Reset Failed', err?.message || 'Could not reset password.');
    }
  };

  // Create User Manually
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = authService.createUser(newUser);
      showToast('success', 'User Created', `Account created for ${created.name} (${created.role})`);
      setCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast('error', 'Creation Failed', err?.message || 'Failed to create user account.');
    }
  };

  // Filtered list
  const pendingCount = users.filter(u => u.accountStatus === 'PENDING' || u.status === 'Inactive' && u.role === 'UNASSIGNED').length;

  const filteredUsers = users.filter(u => {
    const isPending = u.accountStatus === 'PENDING' || (u.status === 'Inactive' && u.role === 'UNASSIGNED');
    if (filterTab === 'PENDING' && !isPending) return false;
    if (filterTab === 'ACTIVE' && (isPending || u.status === 'Inactive')) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);
      return matchName || matchEmail || matchRole;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">User Account Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review pending registrations, assign clinical roles, and manage system security access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
            title="Refresh Users"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Accounts ({users.length})
          </button>

          <button
            onClick={() => setFilterTab('PENDING')}
            className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approvals</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filterTab === 'PENDING' ? 'bg-white text-amber-700' : 'bg-amber-600 text-white'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active Staff
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100 font-semibold">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4">Registered Date</th>
              <th className="py-3 px-4 text-right">Approval & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                  Loading accounts...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No accounts found matching the filter.
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => {
                const isPending = u.accountStatus === 'PENDING' || (u.status === 'Inactive' && u.role === 'UNASSIGNED');
                return (
                  <tr key={u.id} className={`hover:bg-slate-50 transition ${isPending ? 'bg-amber-50/30' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isPending ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-mono text-[11px]">{u.email}</p>
                      {u.phone && <p className="text-[10px] text-slate-400">{u.phone}</p>}
                    </td>

                    <td className="py-3 px-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 text-[11px]">
                          <Clock className="w-3 h-3" />
                          Pending Role
                        </span>
                      ) : (
                        <span className="font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-[11px]">
                          {u.role === 'UNASSIGNED' ? 'Unassigned' : getRoleDisplayName(u.role)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {u.department || 'General'}
                    </td>

                    <td className="py-3 px-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          PENDING APPROVAL
                        </span>
                      ) : (
                        <StatusBadge status={u.status} size="sm" />
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenApproveModal(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                            title="Approve registration and assign hospital role"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(u)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg text-xs font-semibold border border-slate-200 transition"
                            title="Reject registration"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResetPassword(u)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`text-xs font-semibold px-2 py-1 rounded transition ${
                              u.status === 'Active'
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.status === 'Active' ? 'Disable' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* APPROVE STAFF MODAL */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Approve Staff Registration"
      >
        {selectedUser && (
          <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs">
            {/* Applicant Summary Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Applicant Details</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Awaiting Approval
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px]">Full Name</p>
                  <p className="font-bold text-slate-800">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Username</p>
                  <p className="font-mono text-slate-700">@{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Email Address</p>
                  <p className="font-mono text-slate-700">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Phone Number</p>
                  <p className="text-slate-700">{selectedUser.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Role Assignment */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assign Hospital Role <span className="text-red-500">*</span>
              </label>
              <select
                value={approveRole}
                onChange={e => setApproveRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                required
              >
                <option value="DOCTOR">Medical Doctor (Clinical care & prescriptions)</option>
                <option value="NURSE">Registered Nurse (Inpatient wards & vitals)</option>
                <option value="RECEPTIONIST">Front Desk Receptionist (Appointments & Registration)</option>
                <option value="LAB_STAFF">Laboratory Technician (Sample analysis & lab tests)</option>
                <option value="PHARMACIST">Clinical Pharmacist (Dispensary & drug inventory)</option>
                <option value="ACCOUNTANT">Billing Accountant (Invoices, payments & claims)</option>
                <option value="ADMIN">System Administrator (Full hospital management)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                This determines the module permissions and dashboard access granted to this staff member.
              </p>
            </div>

            {/* Department Assignment */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assign Department <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={approveDeptId}
                onChange={e => setApproveDeptId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                <option value="">-- None / General Hospital --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-slate-700 transition"
                disabled={submittingApprove}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition disabled:opacity-50"
                disabled={submittingApprove}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submittingApprove ? 'Approving...' : 'Approve & Activate Account'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Staff Registration"
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to decline the registration for{' '}
              <strong className="text-slate-800">{selectedUser.name}</strong> ({selectedUser.email})?
            </p>
            <p className="text-slate-500 text-[11px]">
              This will set their account status to <strong>REJECTED</strong>. They will not be able to log in to MediCore.
            </p>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}
      </Modal>

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

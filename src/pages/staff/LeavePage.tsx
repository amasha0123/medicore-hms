
import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { LeaveRequest } from '../../types/staff';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

export const LeavePage: React.FC = () => {
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const loadLeaves = async () => {
    try {
      const data = await staffService.getLeaveRequests();
      setLeaves(data || []);
    } catch {
      setLeaves([]);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await staffService.updateLeaveStatus(id, status, currentUser?.name || 'Administrator');
      await loadLeaves();
      showToast(status === 'Approved' ? 'success' : 'warning', `Leave Request ${status}`, 'The employee schedule was updated.');
    } catch (err: any) {
      showToast('error', 'Update Failed', err?.message ?? 'Could not update leave request');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Staff Leave Applications</h3>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100 font-semibold">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Leave Type</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Days</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaves.map(lv => (
              <tr key={lv.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-800">
                  {lv.employeeName}
                  <span className="block text-[10px] text-slate-400 font-normal">{lv.department} ({lv.role})</span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-700">{lv.leaveType}</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(lv.startDate)} - {formatDate(lv.endDate)}</td>
                <td className="py-3 px-4 font-bold">{lv.daysCount} days</td>
                <td className="py-3 px-4 text-slate-600 max-w-xs">{lv.reason}</td>
                <td className="py-3 px-4"><StatusBadge status={lv.status} size="sm" /></td>
                <td className="py-3 px-4 text-right">
                  {lv.status === 'Pending' ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleAction(lv.id, 'Approved')}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded hover:bg-emerald-100"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(lv.id, 'Rejected')}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 rounded hover:bg-rose-100"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">By {lv.approvedBy}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

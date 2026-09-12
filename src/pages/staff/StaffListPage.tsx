
import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { StaffMember } from '../../types/staff';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Tabs } from '../../components/common/Tabs';
import { formatDate } from '../../utils/formatters';
import { AttendancePage } from './AttendancePage';
import { LeavePage } from './LeavePage';
import { Users, CalendarCheck, CalendarDays } from 'lucide-react';

export const StaffListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('directory');
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await staffService.getAllStaff();
        setStaff(data || []);
      } catch {
        setStaff([]);
      }
    };
    load();
  }, []);

  const tabs = [
    { id: 'directory', label: 'Employee Directory', badge: staff.length, icon: <Users className="w-4 h-4" /> },
    { id: 'attendance', label: 'Daily Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'leave', label: 'Leave Requests & Approvals', icon: <CalendarDays className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Staff & Human Resources</h2>
        <p className="text-sm text-slate-500 mt-1">Manage clinical staff members, duty shifts, daily attendance, and leave requests.</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'directory' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">{emp.employeeId}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{emp.name}</p>
                    <p className="text-[10px] text-slate-400">{emp.qualification}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{emp.department}</td>
                  <td className="py-3 px-4 text-slate-500">
                    <p>{emp.phone}</p>
                    <p className="text-[10px] text-slate-400">{emp.email}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{emp.shift}</td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(emp.joinDate)}</td>
                  <td className="py-3 px-4"><StatusBadge status={emp.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'attendance' && <AttendancePage />}
      {activeTab === 'leave' && <LeavePage />}
    </div>
  );
};

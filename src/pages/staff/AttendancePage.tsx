
import React, { useState } from 'react';
import { staffService } from '../../services/staffService';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AttendancePage: React.FC = () => {
  const attendance = staffService.getAttendance();
  const [selectedDept, setSelectedDept] = useState('ALL');

  const depts = ['ALL', 'Hospital Administration', 'Cardiology', 'Inpatient Care', 'Front Desk', 'Diagnostic Laboratory', 'Central Pharmacy', 'Finance & Billing', 'ICU & Emergency'];

  const filtered = attendance.filter(a => selectedDept === 'ALL' || a.department === selectedDept);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Hospital Duty Log — 2026-09-07</h3>
        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5"
        >
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100 font-semibold">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Check In</th>
              <th className="py-3 px-4">Check Out</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(att => (
              <tr key={att.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-800">
                  {att.employeeName}
                  <span className="block text-[10px] text-slate-400 font-normal">{att.employeeId}</span>
                </td>
                <td className="py-3 px-4 text-slate-600">{att.department}</td>
                <td className="py-3 px-4 font-mono">{att.checkInTime}</td>
                <td className="py-3 px-4 font-mono">{att.checkOutTime}</td>
                <td className="py-3 px-4"><StatusBadge status={att.status} size="sm" /></td>
                <td className="py-3 px-4 text-slate-500">{att.notes || '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

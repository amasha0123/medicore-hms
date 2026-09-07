
import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';

  const s = status.toLowerCase();

  // Green / Completed / Available / Paid / Active / Present
  if (['completed', 'available', 'paid', 'active', 'present', 'approved', 'successful', 'normal'].includes(s)) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  // Blue / Confirmed / Checked In / In Progress / Inpatient / Admitted
  else if (['confirmed', 'checked in', 'in progress', 'inpatient', 'admitted', 'under treatment', 'in stock', 'processing', 'in consultation'].includes(s)) {
    colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
  }
  // Amber / Yellow / Pending / Reserved / Low Stock / Late / Partially Paid / Urgent
  else if (['pending', 'reserved', 'low stock', 'late', 'partially paid', 'waiting', 'ready for discharge', 'urgent'].includes(s)) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
  }
  // Red / Cancelled / Critical / Out of Stock / Expiring Soon / Absent / Rejected / Discharged
  else if (['cancelled', 'critical', 'out of stock', 'expiring soon', 'absent', 'rejected', 'no show', 'inactive', 'terminated'].includes(s)) {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
  }
  // Purple / Maintenance / Rotating
  else if (['maintenance', 'discharged', 'scheduled', 'rotating'].includes(s)) {
    colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClass} ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
};

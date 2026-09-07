
import React, { useState } from 'react';
import { ShieldAlert, Search, Filter } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { AuditLog, AuditModule } from '../../types/audit';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable, Column } from '../../components/common/DataTable';

export const AuditLogsPage: React.FC = () => {
  const [logs] = useState<AuditLog[]>(() => auditService.getAll());

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: l => <span className="font-mono text-slate-500 text-[11px]">{l.timestamp}</span>
    },
    {
      key: 'userName',
      header: 'User & Role',
      render: l => (
        <div>
          <p className="font-bold text-slate-900">{l.userName}</p>
          <span className="text-[10px] font-semibold uppercase text-blue-600">{l.userRole}</span>
        </div>
      )
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: l => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
          {l.action}
        </span>
      )
    },
    {
      key: 'module',
      header: 'Module',
      sortable: true,
      render: l => <span className="text-xs font-medium text-slate-600">{l.module}</span>
    },
    {
      key: 'recordIdentifier',
      header: 'Record Ref',
      render: l => <span className="font-mono text-xs text-blue-600">{l.recordIdentifier}</span>
    },
    {
      key: 'details',
      header: 'Audit Event Details',
      render: l => <p className="text-xs text-slate-700 max-w-md">{l.details}</p>
    },
    {
      key: 'ipAddress',
      header: 'IP / Terminal',
      render: l => (
        <div className="text-[11px] text-slate-400 font-mono">
          <p>{l.ipAddress}</p>
          <p className="text-[10px]">{l.device}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: l => <StatusBadge status={l.status} size="sm" />
    }
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Security Audit Logs</h2>
        <p className="text-sm text-slate-500 mt-1">Immutable security compliance log tracking every clinical, financial, and authentication event.</p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Filter audit records by user, action, module, or details..."
        searchKeys={['userName', 'action', 'module', 'recordIdentifier', 'details']}
        filterOptions={[
          {
            label: 'Module',
            key: 'module',
            options: [
              { label: 'AUTH', value: 'AUTH' },
              { label: 'PATIENT', value: 'PATIENT' },
              { label: 'APPOINTMENT', value: 'APPOINTMENT' },
              { label: 'EMR', value: 'EMR' },
              { label: 'LABORATORY', value: 'LABORATORY' },
              { label: 'PHARMACY', value: 'PHARMACY' },
              { label: 'BILLING', value: 'BILLING' },
              { label: 'ADMISSIONS', value: 'ADMISSIONS' },
              { label: 'SETTINGS', value: 'SETTINGS' },
            ]
          }
        ]}
      />
    </div>
  );
};

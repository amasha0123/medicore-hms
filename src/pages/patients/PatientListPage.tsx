
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, Calendar, FileSpreadsheet, UserCheck, Phone } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { Patient } from '../../types/patient';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>(() => patientService.getAll());
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deletePatientId) {
      patientService.delete(deletePatientId);
      setPatients(patientService.getAll());
      showToast('success', 'Patient record deleted', 'The patient archive has been updated.');
      setDeletePatientId(null);
    }
  };

  const columns: Column<Patient>[] = [
    {
      key: 'patientNumber',
      header: 'Patient ID',
      sortable: true,
      render: p => <span className="font-mono font-semibold text-blue-600">{p.patientNumber}</span>
    },
    {
      key: 'fullName',
      header: 'Patient Name',
      sortable: true,
      render: p => (
        <div>
          <p className="font-bold text-slate-900">{p.fullName}</p>
          <p className="text-xs text-slate-400">{p.gender} • {p.age} years old</p>
        </div>
      )
    },
    {
      key: 'bloodGroup',
      header: 'Blood Group',
      sortable: true,
      render: p => (
        <span className="font-semibold text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
          {p.bloodGroup}
        </span>
      )
    },
    {
      key: 'phone',
      header: 'Contact',
      render: p => (
        <div className="text-xs">
          <p className="text-slate-800">{p.phone}</p>
          <p className="text-slate-400 truncate max-w-xs">{p.email}</p>
        </div>
      )
    },
    {
      key: 'primaryDepartment',
      header: 'Department',
      sortable: true,
      render: p => <span className="text-xs text-slate-600 font-medium">{p.primaryDepartment}</span>
    },
    {
      key: 'lastVisit',
      header: 'Last Visit',
      sortable: true,
      render: p => <span className="text-xs text-slate-500">{formatDate(p.lastVisit)}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: p => <StatusBadge status={p.status} size="sm" />
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: p => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/patients/${p.id}`)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="View Patient Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletePatientId(p.id)}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Patients</h2>
          <p className="text-sm text-slate-500 mt-1">Manage patient registration, information and medical history.</p>
        </div>
        <button
          onClick={() => navigate('/patients/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        searchPlaceholder="Search by name, ID, phone number or NIC..."
        searchKeys={['fullName', 'patientNumber', 'phone', 'nationalId', 'primaryDepartment']}
        filterOptions={[
          {
            label: 'Blood Groups',
            key: 'bloodGroup',
            options: [
              { label: 'A+', value: 'A+' },
              { label: 'A-', value: 'A-' },
              { label: 'B+', value: 'B+' },
              { label: 'B-', value: 'B-' },
              { label: 'O+', value: 'O+' },
              { label: 'O-', value: 'O-' },
              { label: 'AB+', value: 'AB+' },
              { label: 'AB-', value: 'AB-' },
            ]
          },
          {
            label: 'Status',
            key: 'status',
            options: [
              { label: 'Active', value: 'Active' },
              { label: 'Inpatient', value: 'Inpatient' },
              { label: 'Discharged', value: 'Discharged' },
            ]
          }
        ]}
      />

      <ConfirmationDialog
        isOpen={!!deletePatientId}
        onClose={() => setDeletePatientId(null)}
        onConfirm={handleDelete}
        title="Delete Patient Record"
        message="Are you sure you want to delete this patient record? This action will archive medical history and invoices."
      />
    </div>
  );
};


import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { NurseDashboard } from './NurseDashboard';
import { ReceptionistDashboard } from './ReceptionistDashboard';
import { LabDashboard } from './LabDashboard';
import { PharmacyDashboard } from './PharmacyDashboard';
import { AccountantDashboard } from './AccountantDashboard';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  switch (role) {
    case 'DOCTOR':
      return <DoctorDashboard />;
    case 'NURSE':
      return <NurseDashboard />;
    case 'RECEPTIONIST':
      return <ReceptionistDashboard />;
    case 'LAB_STAFF':
      return <LabDashboard />;
    case 'PHARMACIST':
      return <PharmacyDashboard />;
    case 'ACCOUNTANT':
      return <AccountantDashboard />;
    case 'ADMIN':
    default:
      return <AdminDashboard />;
  }
};

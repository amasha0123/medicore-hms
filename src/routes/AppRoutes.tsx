
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '../components/common/AppShell';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PatientListPage } from '../pages/patients/PatientListPage';
import { PatientNewPage } from '../pages/patients/PatientNewPage';
import { PatientDetailPage } from '../pages/patients/PatientDetailPage';
import { DoctorListPage } from '../pages/doctors/DoctorListPage';
import { AppointmentListPage } from '../pages/appointments/AppointmentListPage';
import { EMRListPage } from '../pages/emr/EMRListPage';
import { LaboratoryPage } from '../pages/laboratory/LaboratoryPage';
import { PharmacyPage } from '../pages/pharmacy/PharmacyPage';
import { BillingPage } from '../pages/billing/BillingPage';
import { AdmissionsPage } from '../pages/admissions/AdmissionsPage';
import { OutpatientsPage } from '../pages/outpatients/OutpatientsPage';
import { StaffListPage } from '../pages/staff/StaffListPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { UserManagementPage } from '../pages/users/UserManagementPage';
import { AuditLogsPage } from '../pages/audit/AuditLogsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes inside AppShell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Patients */}
          <Route path="/patients" element={<PatientListPage />} />
          <Route path="/patients/new" element={<PatientNewPage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />

          {/* Doctors */}
          <Route path="/doctors" element={<DoctorListPage />} />

          {/* Appointments */}
          <Route path="/appointments" element={<AppointmentListPage />} />

          {/* EMR */}
          <Route path="/medical-records" element={<EMRListPage />} />

          {/* Laboratory */}
          <Route path="/laboratory" element={<LaboratoryPage />} />

          {/* Pharmacy */}
          <Route path="/pharmacy" element={<PharmacyPage />} />

          {/* Billing */}
          <Route path="/billing" element={<BillingPage />} />

          {/* Admissions & Outpatients */}
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/outpatients" element={<OutpatientsPage />} />

          {/* Staff & HR */}
          <Route path="/staff" element={<StaffListPage />} />

          {/* Reports & Notifications */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Security & Admin Only */}
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

import { Router } from 'express';

import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import doctorRoutes from './doctor.routes';
import departmentRoutes from './department.routes';
import appointmentRoutes from './appointment.routes';
import emrRoutes from './emr.routes';
import labRoutes from './lab.routes';
import pharmacyRoutes from './pharmacy.routes';
import billingRoutes from './billing.routes';
import admissionRoutes from './admission.routes';
import outpatientRoutes from './outpatient.routes';
import staffRoutes from './staff.routes';
import dashboardRoutes from './dashboard.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import auditRoutes from './audit.routes';
import userRoutes from './user.routes';
import settingsRoutes from './settings.routes';
import searchRoutes from './search.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/departments', departmentRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medical-records', emrRoutes);
router.use('/laboratory', labRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/billing', billingRoutes);
router.use('/admissions', admissionRoutes);
router.use('/outpatients', outpatientRoutes);
router.use('/staff', staffRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/search', searchRoutes);

export default router;


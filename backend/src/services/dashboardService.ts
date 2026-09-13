import { prisma } from '../config/prisma';

export class DashboardService {
  public static async getAdminDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      todaysAppointments,
      availableDoctors,
      pendingLabTests,
      pharmacyAlerts,
      todaysPayments,
      departmentCounts,
      recentAppointments,
      recentActivities
    ] = await Promise.all([
      prisma.patient.count({ where: { deletedAt: null } }),
      prisma.appointment.count({ where: { appointmentDate: { gte: today } } }),
      prisma.doctor.count({ where: { status: 'Available', deletedAt: null } }),
      prisma.laboratoryRequest.count({ where: { sampleStatus: { in: ['Requested', 'Processing', 'Sample Collected'] } } }),
      prisma.medicine.count({ where: { status: { in: ['Low Stock', 'Out of Stock', 'Expiring Soon', 'Expired'] }, deletedAt: null } }),
      prisma.payment.aggregate({ where: { createdAt: { gte: today } }, _sum: { amount: true } }),
      prisma.department.findMany({ select: { name: true, _count: { select: { doctors: true } } } }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { patient: true, doctor: true }
      }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' }
      })
    ]);

    const todaysRevenue = Number(todaysPayments._sum.amount || 0);

    return {
      totalPatients,
      todaysAppointments,
      availableDoctors,
      pendingLaboratoryTests: pendingLabTests,
      pharmacyAlerts,
      todaysRevenue,
      departmentStatistics: departmentCounts.map((d: any) => ({ department: d.name, doctorCount: d._count.doctors })),
      recentAppointments: recentAppointments.map((a: any) => ({
        id: a.id,
        appointmentNumber: a.appointmentId,
        patientName: a.patient.fullName,
        doctorName: a.doctor.name,
        date: a.appointmentDate.toISOString().split('T')[0],
        time: a.startTime,
        status: a.status
      })),
      recentActivities: recentActivities.map((act: any) => ({
        id: act.id,
        user: act.userName,
        role: act.userRole,
        action: act.action,
        module: act.module,
        details: act.description,
        timestamp: act.timestamp.toISOString()
      }))
    };
  }

  public static async getDoctorDashboard(doctorId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const whereDoc = doctorId ? { doctorId } : {};

    const [myAppointmentsToday, totalAssignedPatients, pendingLabResults, completedConsultationsToday] = await Promise.all([
      prisma.appointment.count({ where: { ...whereDoc, appointmentDate: { gte: today } } }),
      prisma.patient.count({ where: { assignedDoctorId: doctorId, deletedAt: null } }),
      prisma.laboratoryRequest.count({ where: { ...whereDoc, sampleStatus: { in: ['Requested', 'Processing'] } } }),
      prisma.appointment.count({ where: { ...whereDoc, status: 'COMPLETED', appointmentDate: { gte: today } } })
    ]);

    return {
      myAppointmentsToday,
      totalAssignedPatients,
      pendingLabResults,
      completedConsultationsToday
    };
  }

  public static async getNurseDashboard() {
    const [activeInpatients, availableBeds, totalBeds, pendingMedications] = await Promise.all([
      prisma.patient.count({ where: { status: 'Inpatient', deletedAt: null } }),
      prisma.bed.count({ where: { status: 'Available' } }),
      prisma.bed.count(),
      prisma.prescription.count({ where: { status: 'PENDING' } })
    ]);

    return {
      activeInpatients,
      availableBeds,
      totalBeds,
      pendingMedications
    };
  }

  public static async getReceptionistDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todaysAppointments, waitingQueue, availableDoctors] = await Promise.all([
      prisma.appointment.count({ where: { appointmentDate: { gte: today } } }),
      prisma.outpatientQueue.count({ where: { status: 'Waiting', arrivalTime: { gte: today } } }),
      prisma.doctor.count({ where: { status: 'Available', deletedAt: null } })
    ]);

    return {
      todaysAppointments,
      waitingQueue,
      availableDoctors
    };
  }

  public static async getLabDashboard() {
    const [pendingRequests, sampleCollected, completedToday] = await Promise.all([
      prisma.laboratoryRequest.count({ where: { sampleStatus: 'Requested' } }),
      prisma.laboratoryRequest.count({ where: { sampleStatus: 'Sample Collected' } }),
      prisma.laboratoryRequest.count({ where: { sampleStatus: 'Completed' } })
    ]);

    return {
      pendingRequests,
      sampleCollected,
      completedToday
    };
  }

  public static async getPharmacyDashboard() {
    const [totalMedicines, lowStockCount, expiringCount, pendingPrescriptions] = await Promise.all([
      prisma.medicine.count({ where: { deletedAt: null } }),
      prisma.medicine.count({ where: { status: 'Low Stock', deletedAt: null } }),
      prisma.medicine.count({ where: { status: 'Expiring Soon', deletedAt: null } }),
      prisma.prescription.count({ where: { status: 'PENDING' } })
    ]);

    return {
      totalMedicines,
      lowStockCount,
      expiringCount,
      pendingPrescriptions
    };
  }

  public static async getAccountantDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todaysPayments, pendingInvoices, totalUnpaid] = await Promise.all([
      prisma.payment.aggregate({ where: { createdAt: { gte: today } }, _sum: { amount: true } }),
      prisma.invoice.count({ where: { status: 'PENDING' } }),
      prisma.invoice.aggregate({ where: { status: { in: ['PENDING', 'PARTIALLY_PAID'] } }, _sum: { balanceDue: true } })
    ]);

    return {
      todaysRevenue: Number(todaysPayments._sum.amount || 0),
      pendingInvoicesCount: pendingInvoices,
      unpaidInvoicesTotal: Number(totalUnpaid._sum.balanceDue || 0)
    };
  }
}

import { prisma } from '../config/prisma';

export class SearchService {
  public static async globalSearch(query: string) {
    if (!query || query.trim().length === 0) {
      return {
        patients: [],
        doctors: [],
        appointments: [],
        medicines: [],
        invoices: []
      };
    }

    const q = query.trim();

    const [patients, doctors, appointments, medicines, invoices] = await Promise.all([
      prisma.patient.findMany({
        where: {
          deletedAt: null,
          OR: [
            { fullName: { contains: q } },
            { patientId: { contains: q } },
            { NIC: { contains: q } },
            { phone: { contains: q } }
          ]
        },
        take: 5
      }),
      prisma.doctor.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: q } },
            { doctorId: { contains: q } },
            { specialization: { contains: q } }
          ]
        },
        take: 5
      }),
      prisma.appointment.findMany({
        where: {
          OR: [
            { appointmentId: { contains: q } },
            { patient: { fullName: { contains: q } } }
          ]
        },
        take: 5,
        include: { patient: true, doctor: true }
      }),
      prisma.medicine.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: q } },
            { genericName: { contains: q } },
            { medicineId: { contains: q } }
          ]
        },
        take: 5
      }),
      prisma.invoice.findMany({
        where: {
          OR: [
            { invoiceNumber: { contains: q } },
            { patient: { fullName: { contains: q } } }
          ]
        },
        take: 5,
        include: { patient: true }
      })
    ]);

    return {
      patients: patients.map((p: any) => ({
        id: p.id,
        title: p.fullName,
        subtitle: `ID: ${p.patientId} | Phone: ${p.phone}`,
        category: 'Patients',
        url: `/patients/${p.id}`
      })),
      doctors: doctors.map((d: any) => ({
        id: d.id,
        title: d.name,
        subtitle: `${d.specialization} (${d.doctorId})`,
        category: 'Doctors',
        url: `/doctors`
      })),
      appointments: appointments.map((a: any) => ({
        id: a.id,
        title: `Appointment ${a.appointmentId}`,
        subtitle: `${a.patient.fullName} with ${a.doctor.name}`,
        category: 'Appointments',
        url: `/appointments`
      })),
      medicines: medicines.map((m: any) => ({
        id: m.id,
        title: m.name,
        subtitle: `${m.genericName} (${m.medicineId})`,
        category: 'Medicines',
        url: `/pharmacy`
      })),
      invoices: invoices.map((i: any) => ({
        id: i.id,
        title: `Invoice ${i.invoiceNumber}`,
        subtitle: `${i.patient.fullName} - $${Number(i.totalAmount).toFixed(2)} (${i.status})`,
        category: 'Invoices',
        url: `/billing`
      }))
    };
  }
}

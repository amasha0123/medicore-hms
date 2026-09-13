import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';

export class PharmacyService {
  private static computeStockStatus(quantity: number, reorderLevel: number, expiryDate: Date): string {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (expiryDate < now) return 'Expired';
    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= reorderLevel) return 'Low Stock';
    if (expiryDate <= thirtyDaysFromNow) return 'Expiring Soon';
    return 'In Stock';
  }

  private static async generateMedicineCode(): Promise<string> {
    const count = await prisma.medicine.count();
    const nextNum = (count + 124).toString().padStart(4, '0');
    return `MED-${nextNum}`;
  }

  public static async getMedicines(query: { category?: string; status?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (query.category) where.categoryName = query.category;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { genericName: { contains: query.search } },
        { medicineId: { contains: query.search } },
        { batchNumber: { contains: query.search } }
      ];
    }

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return medicines.map((m: any) => {
      const computedStatus = this.computeStockStatus(m.quantityInStock, m.reorderLevel, m.expiryDate);
      return {
        id: m.id,
        code: m.medicineId,
        name: m.name,
        genericName: m.genericName,
        category: m.categoryName,
        dosageForm: m.dosageForm,
        strength: m.strength,
        manufacturer: m.manufacturer,
        batchNumber: m.batchNumber,
        quantityInStock: m.quantityInStock,
        reorderLevel: m.reorderLevel,
        unitPrice: Number(m.unitPrice),
        expiryDate: m.expiryDate.toISOString().split('T')[0],
        status: computedStatus,
        location: m.location
      };
    });
  }

  public static async createMedicine(input: any, currentUserId?: string, currentUserName?: string) {
    const code = await this.generateMedicineCode();
    const expiryDate = new Date(input.expiryDate);
    const status = this.computeStockStatus(input.quantityInStock, input.reorderLevel, expiryDate);

    const med = await prisma.medicine.create({
      data: {
        medicineId: code,
        name: input.name,
        genericName: input.genericName,
        categoryName: input.categoryName,
        dosageForm: input.dosageForm,
        strength: input.strength,
        manufacturer: input.manufacturer,
        batchNumber: input.batchNumber,
        quantityInStock: input.quantityInStock,
        reorderLevel: input.reorderLevel,
        unitPrice: input.unitPrice,
        expiryDate,
        location: input.location,
        status
      }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'CREATE',
      module: 'PHARMACY',
      recordIdentifier: med.medicineId,
      description: `Added medicine ${med.name} (${med.strength}) to pharmacy inventory`
    });

    return med;
  }

  public static async stockIn(medicineId: string, quantity: number, notes?: string, currentUserId?: string, currentUserName?: string) {
    const med = await prisma.medicine.findUnique({ where: { id: medicineId } });
    if (!med) throw ApiError.notFound('Medicine not found');

    const newQty = med.quantityInStock + quantity;
    const newStatus = this.computeStockStatus(newQty, med.reorderLevel, med.expiryDate);

    await prisma.$transaction([
      prisma.medicine.update({
        where: { id: medicineId },
        data: { quantityInStock: newQty, status: newStatus }
      }),
      prisma.pharmacyTransaction.create({
        data: {
          transactionId: `TXN-${Date.now()}`,
          medicineId,
          transactionType: 'STOCK_IN',
          quantity,
          unitPrice: med.unitPrice,
          totalPrice: Number(med.unitPrice) * quantity,
          batchNumber: med.batchNumber,
          performedBy: currentUserName || 'Pharmacist',
          notes: notes || 'Stock replenishment'
        }
      })
    ]);

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'PHARMACY',
      recordIdentifier: med.medicineId,
      description: `Restocked ${quantity} units of ${med.name}`
    });

    return { message: 'Stock updated successfully', newQuantity: newQty };
  }

  public static async dispensePrescription(prescriptionId: string, itemsToDispense: { medicineId: string; quantityToDispense: number }[], currentUserId?: string, currentUserName?: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { items: true, patient: true, doctor: true }
    });

    if (!prescription) {
      throw ApiError.notFound('Prescription order not found');
    }

    if (prescription.status === 'DISPENSED') {
      throw ApiError.badRequest('Prescription has already been fully dispensed');
    }

    // Execute atomic transaction for dispensing
    return prisma.$transaction(async (tx: any) => {
      let totalBillAmount = 0;

      for (const item of itemsToDispense) {
        const med = await tx.medicine.findUnique({ where: { id: item.medicineId } });
        if (!med || med.deletedAt) {
          throw ApiError.notFound(`Medicine with ID ${item.medicineId} not found`);
        }

        // Expiry check
        if (med.expiryDate < new Date()) {
          throw ApiError.badRequest(`Medicine ${med.name} (Batch: ${med.batchNumber}) has expired on ${med.expiryDate.toISOString().split('T')[0]} and cannot be dispensed.`);
        }

        // Stock check
        if (med.quantityInStock < item.quantityToDispense) {
          throw ApiError.badRequest(`Insufficient stock for ${med.name}. In stock: ${med.quantityInStock}, requested: ${item.quantityToDispense}`);
        }

        const newStock = med.quantityInStock - item.quantityToDispense;
        const newStatus = this.computeStockStatus(newStock, med.reorderLevel, med.expiryDate);

        // Deduct inventory
        await tx.medicine.update({
          where: { id: med.id },
          data: { quantityInStock: newStock, status: newStatus }
        });

        // Record stock-out transaction
        await tx.pharmacyTransaction.create({
          data: {
            transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            medicineId: med.id,
            prescriptionId: prescription.id,
            transactionType: 'DISPENSED',
            quantity: item.quantityToDispense,
            unitPrice: med.unitPrice,
            totalPrice: Number(med.unitPrice) * item.quantityToDispense,
            batchNumber: med.batchNumber,
            performedBy: currentUserName || 'Pharmacist'
          }
        });

        // Update dispensed quantity on prescription item
        const pItem = prescription.items.find((pi: any) => pi.medicineId === med.id || pi.medicineName.toLowerCase() === med.name.toLowerCase());
        if (pItem) {
          await tx.prescriptionItem.update({
            where: { id: pItem.id },
            data: { dispensedQuantity: pItem.dispensedQuantity + item.quantityToDispense }
          });
        }

        totalBillAmount += Number(med.unitPrice) * item.quantityToDispense;

        // Check if low stock notification should fire
        if (newStock <= med.reorderLevel) {
          await NotificationService.create({
            title: 'Pharmacy Stock Alert',
            message: `Medicine ${med.name} is running low on stock (${newStock} units remaining).`,
            category: 'PHARMACY',
            priority: 'Urgent'
          });
        }
      }

      // Update prescription status
      await tx.prescription.update({
        where: { id: prescriptionId },
        data: {
          status: 'DISPENSED',
          dispensedAt: new Date(),
          pharmacistName: currentUserName || 'Pharmacist'
        }
      });

      // Audit Log
      await AuditService.log({
        userId: currentUserId,
        userName: currentUserName,
        action: 'DISPENSE',
        module: 'PHARMACY',
        recordIdentifier: prescription.prescriptionNumber,
        description: `Dispensed prescription ${prescription.prescriptionNumber} for patient ${prescription.patient.fullName}`
      });

      return {
        success: true,
        message: `Prescription ${prescription.prescriptionNumber} dispensed successfully`,
        totalBilled: totalBillAmount
      };
    });
  }

  public static async getPrescriptions(query: { patientId?: string; status?: string }) {
    const where: any = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;

    const prescriptions = await prisma.prescription.findMany({
      where,
      orderBy: { prescriptionDate: 'desc' },
      include: {
        patient: true,
        doctor: true,
        items: { include: { medicine: true } }
      }
    });

    return prescriptions.map((p: any) => ({
      id: p.id,
      prescriptionNumber: p.prescriptionNumber,
      patientId: p.patientId,
      patientName: p.patient.fullName,
      doctorId: p.doctorId,
      doctorName: p.doctor.name,
      date: p.prescriptionDate.toISOString().split('T')[0],
      items: p.items.map((item: any) => ({
        medicineId: item.medicineId || undefined,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity,
        dispensedQuantity: item.dispensedQuantity
      })),
      status: p.status,
      dispensedAt: p.dispensedAt ? p.dispensedAt.toISOString() : undefined,
      pharmacistName: p.pharmacistName || undefined,
      notes: p.notes || undefined
    }));
  }
}

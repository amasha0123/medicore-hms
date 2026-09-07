
import { Medicine, PrescriptionOrder } from '../types/pharmacy';
import { INITIAL_MEDICINES, INITIAL_PRESCRIPTIONS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';
import { auditService } from './auditService';

const MEDICINES_KEY = 'medicore_medicines';
const PRESCRIPTIONS_KEY = 'medicore_prescriptions';

export const pharmacyService = {
  getMedicines(): Medicine[] {
    return getStoredItem<Medicine[]>(MEDICINES_KEY, INITIAL_MEDICINES);
  },

  getPrescriptions(): PrescriptionOrder[] {
    return getStoredItem<PrescriptionOrder[]>(PRESCRIPTIONS_KEY, INITIAL_PRESCRIPTIONS);
  },

  addMedicine(data: Omit<Medicine, 'id' | 'code' | 'status'>): Medicine {
    const medicines = this.getMedicines();
    let status: Medicine['status'] = 'In Stock';
    if (data.quantityInStock === 0) status = 'Out of Stock';
    else if (data.quantityInStock <= data.reorderLevel) status = 'Low Stock';

    const newMed: Medicine = {
      ...data,
      id: `med-${Date.now().toString(36)}`,
      code: `MED-0${100 + medicines.length + 1}`,
      status
    };
    setStoredItem(MEDICINES_KEY, [...medicines, newMed]);
    return newMed;
  },

  dispensePrescription(prescriptionId: string, pharmacistName: string): PrescriptionOrder {
    const rxList = this.getPrescriptions();
    const medicines = this.getMedicines();

    let targetRx: PrescriptionOrder | null = null;
    const updatedRx = rxList.map(rx => {
      if (rx.id === prescriptionId) {
        targetRx = {
          ...rx,
          status: 'Dispensed',
          dispensedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          pharmacistName,
          items: rx.items.map(item => ({ ...item, dispensedQuantity: item.quantity }))
        };
        return targetRx;
      }
      return rx;
    });

    setStoredItem(PRESCRIPTIONS_KEY, updatedRx);

    // Decrement medication stock in inventory
    if (targetRx) {
      const rxItems = (targetRx as PrescriptionOrder).items;
      const updatedMeds = medicines.map(med => {
        const found = rxItems.find(i => i.medicineName.toLowerCase() === med.name.toLowerCase() || i.medicineName.toLowerCase() === med.genericName.toLowerCase());
        if (found) {
          const newQty = Math.max(0, med.quantityInStock - found.quantity);
          let newStatus: Medicine['status'] = 'In Stock';
          if (newQty === 0) newStatus = 'Out of Stock';
          else if (newQty <= med.reorderLevel) newStatus = 'Low Stock';
          return { ...med, quantityInStock: newQty, status: newStatus };
        }
        return med;
      });
      setStoredItem(MEDICINES_KEY, updatedMeds);

      auditService.log({
        userId: 'pharm-01',
        userName: pharmacistName,
        userRole: 'PHARMACIST',
        action: 'DISPENSE',
        module: 'PHARMACY',
        recordIdentifier: (targetRx as PrescriptionOrder).prescriptionNumber,
        details: `Dispensed medications for patient ${(targetRx as PrescriptionOrder).patientName}`
      });
    }

    return targetRx!;
  }
};

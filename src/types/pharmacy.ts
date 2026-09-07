
export type MedicineCategory = 
  | 'Antibiotic' 
  | 'Analgesic' 
  | 'Antihypertensive' 
  | 'Antidiabetic' 
  | 'Antacid' 
  | 'Antihistamine' 
  | 'Cardiovascular' 
  | 'Respiratory';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon';

export interface Medicine {
  id: string;
  code: string; // e.g. "MED-0124"
  name: string;
  genericName: string;
  category: MedicineCategory;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Inhaler';
  strength: string; // e.g. "500mg"
  manufacturer: string;
  batchNumber: string;
  quantityInStock: number;
  reorderLevel: number;
  unitPrice: number;
  expiryDate: string;
  status: StockStatus;
  location: string; // e.g. "Shelf B-04"
}

export interface PrescriptionOrder {
  id: string;
  prescriptionNumber: string; // e.g. "RX-2026-440"
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  items: {
    medicineId?: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    dispensedQuantity: number;
  }[];
  status: 'Pending' | 'Dispensed' | 'Partially Dispensed';
  dispensedAt?: string;
  pharmacistName?: string;
  notes?: string;
}

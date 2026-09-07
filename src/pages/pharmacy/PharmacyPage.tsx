
import React, { useState } from 'react';
import { Pill, Plus, AlertTriangle, CheckCircle, Clock, ShoppingCart, Printer } from 'lucide-react';
import { pharmacyService } from '../../services/pharmacyService';
import { Medicine, PrescriptionOrder } from '../../types/pharmacy';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Tabs } from '../../components/common/Tabs';
import { PrintablePrescription } from '../../components/print/PrintablePrescription';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const PharmacyPage: React.FC = () => {
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [medicines, setMedicines] = useState<Medicine[]>(() => pharmacyService.getMedicines());
  const [prescriptions, setPrescriptions] = useState<PrescriptionOrder[]>(() => pharmacyService.getPrescriptions());
  const [addMedModalOpen, setAddMedModalOpen] = useState(false);
  const [printRx, setPrintRx] = useState<PrescriptionOrder | null>(null);

  const [newMed, setNewMed] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotic' as Medicine['category'],
    dosageForm: 'Tablet' as Medicine['dosageForm'],
    strength: '500mg',
    manufacturer: 'Pfizer Inc.',
    batchNumber: 'BT-99120',
    quantityInStock: 200,
    reorderLevel: 50,
    unitPrice: 1.50,
    expiryDate: '2027-12-31',
    location: 'Shelf B-02'
  });

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    const created = pharmacyService.addMedicine(newMed);
    setMedicines(pharmacyService.getMedicines());
    setAddMedModalOpen(false);
    showToast('success', 'Medicine Added', `${created.name} added to pharmacy inventory`);
  };

  const handleDispense = (rxId: string) => {
    const updated = pharmacyService.dispensePrescription(rxId, currentUser?.name || 'Amara Okafor, PharmD');
    setPrescriptions(pharmacyService.getPrescriptions());
    setMedicines(pharmacyService.getMedicines());
    showToast('success', 'Prescription Dispensed', `Stock decremented for ${updated.patientName}`);
  };

  const tabs = [
    { id: 'inventory', label: 'Medicine Inventory', badge: medicines.length, icon: <Pill className="w-4 h-4" /> },
    { id: 'prescriptions', label: 'Prescriptions & Dispensing', badge: prescriptions.filter(p => p.status === 'Pending').length, icon: <ShoppingCart className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pharmacy Management</h2>
          <p className="text-sm text-slate-500 mt-1">Drug inventory tracking, stock reorder alerts, and prescription fulfillment.</p>
        </div>
        <button
          onClick={() => setAddMedModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Pharmacy KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Inventory" value={medicines.length} icon={<Pill className="w-5 h-5" />} subtext="Cataloged medications" color="blue" />
        <StatCard title="Low Stock Items" value={medicines.filter(m => m.status === 'Low Stock').length} icon={<AlertTriangle className="w-5 h-5" />} subtext="Reorder threshold reached" color="rose" />
        <StatCard title="Expiring Soon" value={medicines.filter(m => m.status === 'Expiring Soon').length} icon={<Clock className="w-5 h-5" />} subtext="Within 60 days" color="amber" />
        <StatCard title="Pending Prescriptions" value={prescriptions.filter(p => p.status === 'Pending').length} icon={<ShoppingCart className="w-5 h-5" />} subtext="Ready for dispensing" color="teal" />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'inventory' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-3 px-4">Drug Code</th>
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Qty</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicines.map(med => (
                <tr key={med.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">{med.code}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{med.name} ({med.strength})</p>
                    <p className="text-[10px] text-slate-400">{med.genericName} • {med.manufacturer}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{med.category}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {med.quantityInStock} <span className="text-[10px] text-slate-400 font-normal">units</span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{formatCurrency(med.unitPrice)}</td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(med.expiryDate)}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{med.location}</td>
                  <td className="py-3 px-4"><StatusBadge status={med.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map(rx => (
            <div key={rx.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600">{rx.prescriptionNumber}</span>
                  <StatusBadge status={rx.status} size="sm" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1">{rx.patientName}</h4>
                <p className="text-xs text-slate-500">Prescribing Physician: {rx.doctorName} • Issued: {formatDate(rx.date)}</p>
                <div className="mt-2 space-y-1">
                  {rx.items.map((item, idx) => (
                    <p key={idx} className="text-xs text-slate-700">
                      • <strong className="text-slate-900">{item.medicineName} {item.dosage}</strong> — {item.frequency} ({item.quantity} units)
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintRx(rx)}
                  className="p-2 border rounded-lg hover:bg-slate-50 text-slate-600"
                  title="Print Prescription Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                {rx.status === 'Pending' && (
                  <button
                    onClick={() => handleDispense(rx.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    Dispense & Deduct Stock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Medicine Modal */}
      <Modal isOpen={addMedModalOpen} onClose={() => setAddMedModalOpen(false)} title="Add New Medicine to Pharmacy">
        <form onSubmit={handleAddMedicine} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amoxicillin"
                value={newMed.name}
                onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Generic Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Amoxicillin Trihydrate"
                value={newMed.genericName}
                onChange={e => setNewMed({ ...newMed, genericName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newMed.category}
                onChange={e => setNewMed({ ...newMed, category: e.target.value as Medicine['category'] })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Antibiotic">Antibiotic</option>
                <option value="Analgesic">Analgesic</option>
                <option value="Antihypertensive">Antihypertensive</option>
                <option value="Antidiabetic">Antidiabetic</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Respiratory">Respiratory</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Strength</label>
              <input
                type="text"
                value={newMed.strength}
                onChange={e => setNewMed({ ...newMed, strength: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={newMed.unitPrice}
                onChange={e => setNewMed({ ...newMed, unitPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={newMed.quantityInStock}
                onChange={e => setNewMed({ ...newMed, quantityInStock: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reorder Level</label>
              <input
                type="number"
                value={newMed.reorderLevel}
                onChange={e => setNewMed({ ...newMed, reorderLevel: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Storage Shelf</label>
              <input
                type="text"
                value={newMed.location}
                onChange={e => setNewMed({ ...newMed, location: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setAddMedModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm">Save to Inventory</button>
          </div>
        </form>
      </Modal>

      {/* Printable Prescription Modal */}
      {printRx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <PrintablePrescription rx={printRx} onClose={() => setPrintRx(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

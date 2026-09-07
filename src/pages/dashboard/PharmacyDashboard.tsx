
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { pharmacyService } from '../../services/pharmacyService';
import { StatusBadge } from '../../components/common/StatusBadge';

export const PharmacyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const medicines = pharmacyService.getMedicines();
  const prescriptions = pharmacyService.getPrescriptions();
  const pendingRx = prescriptions.filter(p => p.status === 'Pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Central Pharmacy Station</h2>
        <p className="text-sm text-slate-500 mt-1">Logged in as Amara Okafor, PharmD (Chief Pharmacist)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Prescriptions Pending" value={pendingRx.length} icon={<Clock className="w-5 h-5" />} subtext="Awaiting dispensing" color="amber" />
        <StatCard title="Low Stock Medications" value={medicines.filter(m => m.status === 'Low Stock').length} icon={<AlertTriangle className="w-5 h-5" />} subtext="Below reorder level" color="rose" />
        <StatCard title="Expiring within 30 Days" value={medicines.filter(m => m.status === 'Expiring Soon').length} icon={<Pill className="w-5 h-5" />} subtext="Batch BT-11094" color="purple" />
        <StatCard title="Today's Drug Sales" value="$4,820" icon={<DollarSign className="w-5 h-5" />} subtext="148 Units dispensed" color="emerald" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Pending Prescriptions for Dispensing</h3>
          <button onClick={() => navigate('/pharmacy')} className="text-xs font-semibold text-blue-600 hover:underline">
            Manage All Prescriptions &rarr;
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {prescriptions.map(rx => (
            <div key={rx.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{rx.prescriptionNumber} — {rx.patientName}</p>
                <p className="text-xs text-slate-500">Dr. {rx.doctorName} • {rx.items.length} items: {rx.items.map(i => i.medicineName).join(', ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={rx.status} size="sm" />
                {rx.status === 'Pending' && (
                  <button
                    onClick={() => navigate('/pharmacy')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded"
                  >
                    Dispense & Deduct Stock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

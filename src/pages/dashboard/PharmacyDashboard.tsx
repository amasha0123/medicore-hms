import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { pharmacyService } from '../../services/pharmacyService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const PharmacyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPharmacyData() {
      try {
        setLoading(true);
        const [meds, rx] = await Promise.all([
          pharmacyService.getMedicines().catch(() => []),
          pharmacyService.getPrescriptions().catch(() => [])
        ]);
        if (isMounted) {
          setMedicines(Array.isArray(meds) ? meds : []);
          setPrescriptions(Array.isArray(rx) ? rx : []);
        }
      } catch (err) {
        console.error('Failed to load pharmacy dashboard data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPharmacyData();
    return () => { isMounted = false; };
  }, []);

  const pendingRx = prescriptions.filter(p => p.status === 'Pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Central Pharmacy Station</h2>
        <p className="text-sm text-slate-500 mt-1">
          Logged in as {currentUser?.name || 'Pharmacist'} ({currentUser?.department || 'Clinical Pharmacy'})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Prescriptions Pending"
          value={loading ? '...' : pendingRx.length}
          icon={<Clock className="w-5 h-5" />}
          subtext="Awaiting dispensing"
          color="amber"
        />
        <StatCard
          title="Low Stock Medications"
          value={loading ? '...' : medicines.filter(m => m.status === 'Low Stock' || (m.stock !== undefined && m.minStock !== undefined && m.stock <= m.minStock)).length}
          icon={<AlertTriangle className="w-5 h-5" />}
          subtext="Below reorder level"
          color="rose"
        />
        <StatCard
          title="Total Formulations"
          value={loading ? '...' : medicines.length}
          icon={<Pill className="w-5 h-5" />}
          subtext="Active inventory items"
          color="purple"
        />
        <StatCard
          title="Today's Drug Sales"
          value="$4,820"
          icon={<DollarSign className="w-5 h-5" />}
          subtext="Dispensary collections"
          color="emerald"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Pending Prescriptions for Dispensing</h3>
          <button onClick={() => navigate('/pharmacy')} className="text-xs font-semibold text-blue-600 hover:underline">
            Manage All Prescriptions &rarr;
          </button>
        </div>

        {prescriptions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            {loading ? 'Loading prescriptions...' : 'No pending prescriptions found.'}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {prescriptions.map(rx => (
              <div key={rx.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {rx.prescriptionNumber || rx.id} — {rx.patientName || rx.patient?.fullName || 'Patient'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Doctor: {rx.doctorName || 'Prescribing Physician'} • {Array.isArray(rx.items) ? `${rx.items.length} items: ${rx.items.map((i: any) => i.medicineName || i.name).join(', ')}` : 'Standard Prescription'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={rx.status || 'Pending'} size="sm" />
                  {rx.status === 'Pending' && (
                    <button
                      onClick={() => navigate('/pharmacy')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded transition"
                    >
                      Dispense & Deduct Stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

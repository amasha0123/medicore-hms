import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, Users, Activity, CheckSquare } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { admissionService } from '../../services/admissionService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const NurseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [beds, setBeds] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadNurseData() {
      try {
        setLoading(true);
        const [bedsData, admissionsData] = await Promise.all([
          admissionService.getBeds().catch(() => []),
          admissionService.getAdmissions().catch(() => [])
        ]);
        if (isMounted) {
          setBeds(Array.isArray(bedsData) ? bedsData : []);
          setAdmissions(Array.isArray(admissionsData) ? admissionsData : []);
        }
      } catch (err) {
        console.error('Failed to load nurse dashboard data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadNurseData();
    return () => { isMounted = false; };
  }, []);

  const occupiedBeds = beds.filter(b => b.status === 'Occupied');
  const availableBedsCount = Math.max(0, beds.length - occupiedBeds.length);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Nursing Care Station</h2>
        <p className="text-sm text-slate-500 mt-1">
          Logged in as {currentUser?.name || 'Registered Nurse'} ({currentUser?.department || 'Inpatient Nursing'})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ward Beds Occupied"
          value={loading ? '...' : `${occupiedBeds.length} / ${beds.length || 0}`}
          icon={<Bed className="w-5 h-5" />}
          subtext={`${availableBedsCount} Available beds`}
          color="blue"
        />
        <StatCard
          title="Active Admissions"
          value={loading ? '...' : `${admissions.length} Patients`}
          icon={<CheckSquare className="w-5 h-5" />}
          subtext="Under active nursing care"
          color="amber"
        />
        <StatCard
          title="Scheduled Vitals"
          value={occupiedBeds.length > 0 ? `${occupiedBeds.length} Due` : '0 Due'}
          icon={<Activity className="w-5 h-5" />}
          subtext="Routine observation rounds"
          color="teal"
        />
        <StatCard
          title="Admissions Today"
          value={loading ? '...' : `${admissions.length} Total`}
          icon={<Users className="w-5 h-5" />}
          subtext="Ward patient roster"
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Assigned Ward Inpatients</h3>
          <button
            onClick={() => navigate('/admissions')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Manage All Beds &rarr;
          </button>
        </div>

        {occupiedBeds.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            {loading ? 'Loading bed roster...' : 'No occupied beds currently registered.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {occupiedBeds.map(bed => (
              <div key={bed.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-800">{bed.ward?.name || bed.ward || 'Ward'} - Bed {bed.bedNumber}</span>
                  <StatusBadge status="Occupied" size="sm" />
                </div>
                <p className="text-sm font-semibold text-slate-900 mt-2">{bed.currentPatientName || bed.patient?.fullName || 'Assigned Inpatient'}</p>
                <p className="text-xs text-slate-500">{bed.attendingDoctorName ? `Dr. ${bed.attendingDoctorName}` : 'Attending Physician Assigned'}</p>
                <p className="text-[11px] text-slate-400 mt-1">Status: {bed.status || 'Active'}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => navigate('/medical-records')}
                    className="px-2 py-1 text-xs bg-white border border-slate-200 rounded font-medium hover:bg-slate-100 text-slate-700 transition"
                  >
                    Record Vitals
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

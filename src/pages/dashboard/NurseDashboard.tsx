
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, Users, Activity, CheckSquare, Plus } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { admissionService } from '../../services/admissionService';
import { StatusBadge } from '../../components/common/StatusBadge';

export const NurseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const beds = admissionService.getBeds();
  const occupiedBeds = beds.filter(b => b.status === 'Occupied');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Nursing Care Station</h2>
        <p className="text-sm text-slate-500 mt-1">Logged in as Priya Patel, RN (Inpatient Ward 3 Supervisor)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ward Beds Occupied" value={`${occupiedBeds.length} / ${beds.length}`} icon={<Bed className="w-5 h-5" />} subtext="8 Available beds" color="blue" />
        <StatCard title="Care Tasks Due" value="14 Tasks" icon={<CheckSquare className="w-5 h-5" />} subtext="Meds & Dressing updates" color="amber" />
        <StatCard title="Scheduled Vitals" value="8 Due" icon={<Activity className="w-5 h-5" />} subtext="Q4H Vitals checks" color="teal" />
        <StatCard title="Admissions Today" value="3 New" icon={<Users className="w-5 h-5" />} subtext="1 Pending discharge" color="purple" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {occupiedBeds.map(bed => (
            <div key={bed.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-800">{bed.ward} - Bed {bed.bedNumber}</span>
                <StatusBadge status="Occupied" size="sm" />
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-2">{bed.currentPatientName}</p>
              <p className="text-xs text-slate-500">Dr. {bed.attendingDoctorName}</p>
              <p className="text-[11px] text-slate-400 mt-1">Admitted: {bed.admittedDate}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => navigate('/medical-records')}
                  className="px-2 py-1 text-xs bg-white border border-slate-200 rounded font-medium hover:bg-slate-100 text-slate-700"
                >
                  Record Vitals
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

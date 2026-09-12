import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FileSpreadsheet, FlaskConical, Plus } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { appointmentService } from '../../services/appointmentService';
import { emrService } from '../../services/emrService';
import { labService } from '../../services/labService';
import { useAuth } from '../../context/AuthContext';

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDoctorData() {
      try {
        setLoading(true);
        const [apts, emrs, labRequests] = await Promise.all([
          appointmentService.getAll().catch(() => []),
          emrService.getAll().catch(() => []),
          labService.getAll().catch(() => [])
        ]);

        if (isMounted) {
          setAppointments(Array.isArray(apts) ? apts : []);
          setRecords(Array.isArray(emrs) ? emrs : []);
          setLabs(Array.isArray(labRequests) ? labRequests : []);
        }
      } catch (err) {
        console.error('Failed to load doctor dashboard data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDoctorData();
    return () => { isMounted = false; };
  }, []);

  const todayAppointments = appointments.slice(0, 5);
  const criticalLabs = labs.filter(l => l.priority === 'Critical' || l.priority === 'Urgent');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Clinical Encounter Station</h2>
        <p className="text-sm text-slate-500 mt-1">
          Logged in as {currentUser?.name || 'Medical Doctor'} ({currentUser?.department || 'Clinical Specialty'})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={appointments.length}
          icon={<Calendar className="w-5 h-5" />}
          subtext={loading ? 'Loading...' : `${appointments.length} Scheduled`}
          color="blue"
        />
        <StatCard
          title="Patient Records"
          value={records.length}
          icon={<Users className="w-5 h-5" />}
          subtext="Active Clinical Encounters"
          color="teal"
        />
        <StatCard
          title="Pending Medical Records"
          value={records.length > 0 ? `${records.length} Encounters` : '0 Encounters'}
          icon={<FileSpreadsheet className="w-5 h-5" />}
          subtext="Need notes sign-off"
          color="amber"
        />
        <StatCard
          title="STAT Lab Alerts"
          value={criticalLabs.length}
          icon={<FlaskConical className="w-5 h-5" />}
          subtext={criticalLabs.length > 0 ? 'Action required' : 'No critical alerts'}
          color="rose"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate('/medical-records')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Write Clinical EMR Encounter</span>
        </button>
        <button
          onClick={() => navigate('/laboratory')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <FlaskConical className="w-4 h-4" />
          <span>Order Diagnostic Tests</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Queue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Today's Patient Queue</h3>
          {todayAppointments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              {loading ? 'Loading appointments...' : 'No appointments scheduled for today.'}
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {todayAppointments.map(apt => (
                <div key={apt.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{apt.patientName}</p>
                    <p className="text-xs text-slate-500">{apt.time || apt.date} • {apt.type || 'Consultation'} • {apt.reason || 'Checkup'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status} size="sm" />
                    <button
                      onClick={() => navigate(`/patients/${apt.patientId}`)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition"
                    >
                      Open Chart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Critical Lab Results */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Urgent & Critical Lab Findings</h3>
          {criticalLabs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              {loading ? 'Checking lab reports...' : 'No urgent or critical lab findings reported.'}
            </p>
          ) : (
            <div className="space-y-3">
              {criticalLabs.map(lab => (
                <div key={lab.id} className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800">{lab.testName}</span>
                    <StatusBadge status={lab.priority} size="sm" />
                  </div>
                  <p className="text-xs text-slate-700 mt-1 font-medium">Patient: {lab.patientName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{lab.technicianNotes || 'Specimen processing'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

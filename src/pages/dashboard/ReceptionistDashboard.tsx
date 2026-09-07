
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, UserPlus, Users, Clock, ArrowRight } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { appointmentService } from '../../services/appointmentService';
import { outpatientService } from '../../services/outpatientService';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ReceptionistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queue = outpatientService.getQueue();
  const appointments = appointmentService.getAll().filter(a => a.date === '2026-09-07');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Front Desk & Intake Operations</h2>
        <p className="text-sm text-slate-500 mt-1">Logged in as Sarah Jenkins (Lead Receptionist)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value={appointments.length} icon={<Calendar className="w-5 h-5" />} subtext="Booked for today" color="blue" />
        <StatCard title="Waiting Room Queue" value={`${queue.filter(q => q.status === 'Waiting').length} Patients`} icon={<Clock className="w-5 h-5" />} subtext="Avg wait: 14 mins" color="amber" />
        <StatCard title="Checked-in Today" value="18" icon={<Users className="w-5 h-5" />} subtext="Intake finalized" color="teal" />
        <StatCard title="New Registrations" value="7" icon={<UserPlus className="w-5 h-5" />} subtext="First time visits" color="purple" />
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={() => navigate('/patients/new')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
        <button
          onClick={() => navigate('/appointments')}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule Appointment</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Live Waiting Room Queue</h3>
          <button onClick={() => navigate('/outpatients')} className="text-xs font-semibold text-blue-600 hover:underline">
            Manage Queue &rarr;
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {queue.map(item => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">
                  {item.queueNumber}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.patientName}</p>
                  <p className="text-xs text-slate-500">Arrived at {item.arrivalTime} • Doctor: {item.doctorName} ({item.department})</p>
                </div>
              </div>
              <StatusBadge status={item.status} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

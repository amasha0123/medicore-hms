
import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Play,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';

export const AppointmentListPage: React.FC = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(() => appointmentService.getAll());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [cancelAppointmentId, setCancelAppointmentId] = useState<string | null>(null);

  const doctors = doctorService.getAll();
  const patients = patientService.getAll();

  const [bookingForm, setBookingForm] = useState({
    patientId: patients[0]?.id || '',
    doctorId: doctors[0]?.id || '',
    date: '2026-09-07',
    time: '10:00 AM',
    type: 'Routine Consult' as Appointment['type'],
    reason: 'Routine consultation checkup'
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === bookingForm.patientId);
    const doc = doctors.find(d => d.id === bookingForm.doctorId);
    if (!pat || !doc) return;

    const created = appointmentService.create({
      patientId: pat.id,
      patientName: pat.fullName,
      patientPhone: pat.phone,
      doctorId: doc.id,
      doctorName: doc.name,
      department: doc.department,
      date: bookingForm.date,
      time: bookingForm.time,
      type: bookingForm.type,
      status: 'Confirmed',
      reason: bookingForm.reason,
      room: doc.schedule[0]?.room || 'Clinic Room 101'
    });

    setAppointments(appointmentService.getAll());
    setBookModalOpen(false);
    showToast('success', 'Appointment Booked', `Confirmed for ${created.patientName} on ${created.date} at ${created.time}`);
  };

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    appointmentService.updateStatus(id, status);
    setAppointments(appointmentService.getAll());
    showToast('info', 'Status Updated', `Appointment marked as ${status}`);
  };

  const handleConfirmCancel = () => {
    if (cancelAppointmentId) {
      appointmentService.updateStatus(cancelAppointmentId, 'Cancelled');
      setAppointments(appointmentService.getAll());
      showToast('warning', 'Appointment Cancelled', 'The scheduled slot has been released.');
      setCancelAppointmentId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Appointment Management</h2>
          <p className="text-sm text-slate-500 mt-1">Calendar scheduling, clinic bookings, and check-in workflows.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded transition ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setBookModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
              <span className="font-bold text-slate-800 text-sm">September 2026</span>
              <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
              {(['day', 'week', 'month'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setCalendarView(v)}
                  className={`px-3 py-1 rounded capitalize transition ${calendarView === v ? 'bg-white font-bold text-blue-600 shadow-sm' : 'text-slate-600'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid Representation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {appointments.map(apt => (
              <div key={apt.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-card transition bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[11px] font-bold text-blue-600">{apt.time}</span>
                    <StatusBadge status={apt.status} size="sm" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-2">{apt.patientName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{apt.doctorName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{apt.department} • {apt.type}</p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  {apt.status === 'Scheduled' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'Checked In')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Check In
                    </button>
                  )}
                  {apt.status === 'Checked In' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'In Progress')}
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      Start Consult
                    </button>
                  )}
                  {apt.status === 'In Progress' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'Completed')}
                      className="text-teal-600 font-semibold hover:underline"
                    >
                      Complete
                    </button>
                  )}
                  {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                    <button
                      onClick={() => setCancelAppointmentId(apt.id)}
                      className="text-rose-500 font-medium hover:underline ml-auto"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-3 px-4">Appointment #</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map(apt => (
                <tr key={apt.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">{apt.appointmentNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{apt.patientName}</td>
                  <td className="py-3 px-4 text-slate-600">{apt.doctorName}</td>
                  <td className="py-3 px-4 text-slate-500">{apt.department}</td>
                  <td className="py-3 px-4 font-medium">{apt.date} at {apt.time}</td>
                  <td className="py-3 px-4 text-slate-500">{apt.type}</td>
                  <td className="py-3 px-4"><StatusBadge status={apt.status} size="sm" /></td>
                  <td className="py-3 px-4 text-right">
                    {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                      <button
                        onClick={() => setCancelAppointmentId(apt.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Modal */}
      <Modal isOpen={bookModalOpen} onClose={() => setBookModalOpen(false)} title="Book New Appointment">
        <form onSubmit={handleBook} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
            <select
              value={bookingForm.patientId}
              onChange={e => setBookingForm({ ...bookingForm, patientId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.patientNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Doctor & Specialty *</label>
            <select
              value={bookingForm.doctorId}
              onChange={e => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} — {d.department} ({d.specialization})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Appointment Date</label>
              <input
                type="date"
                required
                value={bookingForm.date}
                onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
              <select
                value={bookingForm.time}
                onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:15 AM">11:15 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Consultation</label>
            <input
              type="text"
              required
              placeholder="e.g. Chest pain follow-up, general review..."
              value={bookingForm.reason}
              onChange={e => setBookingForm({ ...bookingForm, reason: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBookModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmationDialog
        isOpen={!!cancelAppointmentId}
        onClose={() => setCancelAppointmentId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this scheduled appointment? The patient will be notified."
      />
    </div>
  );
};

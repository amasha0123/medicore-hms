
import React, { useState, useEffect } from 'react';
import { Plus, UserCheck, Star, Calendar, Mail, Phone, LayoutGrid, List } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { Doctor } from '../../types/doctor';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const DoctorListPage: React.FC = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>(['ALL']);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [docs, depts] = await Promise.all([
          doctorService.getAll(),
          doctorService.getDepartments()
        ]);
        setDoctors(docs);
        setDepartments(['ALL', ...depts]);
      } catch (err: any) {
        showToast('error', 'Load failed', err?.message ?? 'Could not load doctors');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    department: 'Cardiology',
    email: '',
    phone: '',
    licenseNumber: '',
    experienceYears: 10,
    consultationFee: 150
  });


  const filteredDoctors = doctors.filter(d => {
    if (selectedDept !== 'ALL' && d.department !== selectedDept) return false;
    return true;
  });

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.name) return;

    try {
      const created = await doctorService.create({
        ...newDoctor,
        workingDays: ['Monday', 'Wednesday', 'Friday'],
        schedule: [
          { day: 'Monday', startTime: '09:00 AM', endTime: '02:00 PM', room: 'Clinic 101' }
        ],
        status: 'Available',
        rating: 5.0
      });
      setDoctors(await doctorService.getAll());
      setAddModalOpen(false);
      showToast('success', 'Doctor Profile Created', `${created.name} registered under ${created.department}`);
    } catch (err: any) {
      showToast('error', 'Failed to add doctor', err?.message ?? 'Unknown error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Doctors Directory</h2>
          <p className="text-sm text-slate-500 mt-1">Specialists, clinical schedules, and consulting availability.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              selectedDept === dept
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {dept === 'ALL' ? 'All Departments' : dept}
          </button>
        ))}
      </div>

      {/* Content: Grid or List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle hover:shadow-card transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-base">
                    {(doctor.name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <StatusBadge status={doctor.status} size="sm" />
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 text-sm">{doctor.name}</h3>
                  <p className="text-xs text-blue-600 font-medium">{doctor.specialization}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{doctor.department}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Experience:</span>
                    <span className="font-semibold text-slate-700">{doctor.experienceYears} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Consultation:</span>
                    <span className="font-semibold text-slate-800">${doctor.consultationFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>License:</span>
                    <span className="font-mono text-slate-600">{doctor.licenseNumber}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{doctor.rating}</span>
                </div>
                <button
                  onClick={() => showToast('info', 'Doctor Schedule', `${doctor.name} available ${doctor.workingDays.join(', ')}`)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  View Schedule &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Fee</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map(doctor => (
                <tr key={doctor.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">{doctor.name}</td>
                  <td className="py-3 px-4 text-blue-600 font-medium">{doctor.specialization}</td>
                  <td className="py-3 px-4 text-slate-600">{doctor.department}</td>
                  <td className="py-3 px-4 text-slate-500">{doctor.phone}</td>
                  <td className="py-3 px-4 font-semibold">${doctor.consultationFee}</td>
                  <td className="py-3 px-4"><StatusBadge status={doctor.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Doctor Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register New Doctor">
        <form onSubmit={handleAddDoctor} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Doctor Full Name & Credentials *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Julian Bashir, MD"
              value={newDoctor.name}
              onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={newDoctor.department}
                onChange={e => setNewDoctor({ ...newDoctor, department: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Neurology">Neurology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Endocrinology">Endocrinology</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                required
                placeholder="e.g. Pediatric Cardiology"
                value={newDoctor.specialization}
                onChange={e => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="dr.doctor@medicore.hospital"
                value={newDoctor.email}
                onChange={e => setNewDoctor({ ...newDoctor, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={newDoctor.phone}
                onChange={e => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medical License #</label>
              <input
                type="text"
                required
                placeholder="MD-NY-90214"
                value={newDoctor.licenseNumber}
                onChange={e => setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                value={newDoctor.consultationFee}
                onChange={e => setNewDoctor({ ...newDoctor, consultationFee: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
            >
              Save Doctor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

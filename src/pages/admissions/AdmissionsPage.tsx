
import React, { useState, useEffect } from 'react';
import { Bed as BedIcon, Plus, CheckCircle2, AlertTriangle, ShieldCheck, User, ArrowRight } from 'lucide-react';
import { admissionService } from '../../services/admissionService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { Bed, AdmissionRecord, BedStatus } from '../../types/admission';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const AdmissionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [beds, setBeds] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [admitModalBed, setAdmitModalBed] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [b, adm, pats, docs] = await Promise.all([
          admissionService.getBeds(),
          admissionService.getAdmissions(),
          patientService.getAll(),
          doctorService.getAll()
        ]);
        setBeds(b);
        setAdmissions(adm);
        setPatients(pats);
        setDoctors(docs);
      } catch (err: any) {
        showToast('error', 'Load failed', err?.message ?? 'Could not load admission data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [admitForm, setAdmitForm] = useState({
    patientId: patients[0]?.id || '',
    doctorId: doctors[0]?.id || '',
    diagnosis: 'Observation & inpatient monitoring',
    insurance: 'BlueCross BlueShield'
  });

  const wards = ['ALL', 'ICU', 'Surgical Ward', 'General Ward A', 'General Ward B', 'Pediatric Ward', 'Private Suite'];

  const filteredBeds = beds.filter(b => selectedWard === 'ALL' || b.ward === selectedWard);

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const availableBeds = beds.filter(b => b.status === 'Available').length;
  const maintenanceBeds = beds.filter(b => b.status === 'Maintenance').length;

  const handleAdmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitModalBed) return;
    const pat = patients.find((p: any) => p.id === admitForm.patientId);
    const doc = doctors.find((d: any) => d.id === admitForm.doctorId);
    if (!pat || !doc) return;

    try {
      await admissionService.admitPatient({
        patientId: pat.id,
        patientName: pat.fullName,
        patientAge: pat.age,
        patientGender: pat.gender,
        ward: admitModalBed.ward,
        roomNumber: admitModalBed.roomNumber,
        bedNumber: admitModalBed.bedNumber,
        attendingDoctorId: doc.id,
        attendingDoctorName: doc.name,
        admissionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        diagnosis: admitForm.diagnosis,
        emergencyContact: `${pat.emergencyContact?.name ?? ''} (${pat.emergencyContact?.phone ?? ''})`,
        insuranceProvider: admitForm.insurance
      });

      const [b, adm] = await Promise.all([admissionService.getBeds(), admissionService.getAdmissions()]);
      setBeds(b);
      setAdmissions(adm);
      setAdmitModalBed(null);
      showToast('success', 'Patient Admitted', `${pat.fullName} assigned to Bed ${admitModalBed.bedNumber}`);
    } catch (err: any) {
      showToast('error', 'Admission failed', err?.message ?? 'Unknown error');
    }
  };

  const handleDischarge = async (bed: any) => {
    const activeAdm = admissions.find((a: any) => a.bedNumber === bed.bedNumber && a.status !== 'Discharged');
    if (activeAdm) {
      try {
        await admissionService.dischargePatient(activeAdm.id);
        const [b, adm] = await Promise.all([admissionService.getBeds(), admissionService.getAdmissions()]);
        setBeds(b);
        setAdmissions(adm);
        showToast('info', 'Patient Discharged', `Bed ${bed.bedNumber} is now Available and sanitized.`);
      } catch (err: any) {
        showToast('error', 'Discharge failed', err?.message ?? 'Unknown error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Inpatient Bed Management</h2>
        <p className="text-sm text-slate-500 mt-1">Real-time ward occupancy, interactive bed management, and admissions.</p>
      </div>

      {/* Bed KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Hospital Beds" value={totalBeds} icon={<BedIcon className="w-5 h-5" />} subtext="Across 6 wards" color="blue" />
        <StatCard title="Occupied Beds" value={occupiedBeds} icon={<User className="w-5 h-5" />} subtext={`${Math.round((occupiedBeds/totalBeds)*100)}% capacity`} color="amber" />
        <StatCard title="Available Beds" value={availableBeds} icon={<CheckCircle2 className="w-5 h-5" />} subtext="Sanitized & ready" color="emerald" />
        <StatCard title="Maintenance / Sanitizing" value={maintenanceBeds} icon={<AlertTriangle className="w-5 h-5" />} subtext="Out of service" color="rose" />
      </div>

      {/* Ward Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 pb-3">
        {wards.map(ward => (
          <button
            key={ward}
            onClick={() => setSelectedWard(ward)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              selectedWard === ward
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {ward === 'ALL' ? 'All Hospital Wards' : ward}
          </button>
        ))}
      </div>

      {/* Visual Bed Occupancy Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBeds.map(bed => {
          let borderStyle = 'border-slate-200 bg-white';
          if (bed.status === 'Occupied') borderStyle = 'border-blue-200 bg-blue-50/20';
          if (bed.status === 'Available') borderStyle = 'border-emerald-200 bg-emerald-50/10';
          if (bed.status === 'Maintenance') borderStyle = 'border-rose-200 bg-rose-50/10';
          if (bed.status === 'Reserved') borderStyle = 'border-amber-200 bg-amber-50/10';

          return (
            <div key={bed.id} className={`p-4 rounded-2xl border shadow-subtle flex flex-col justify-between ${borderStyle}`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">{bed.bedNumber}</span>
                  <StatusBadge status={bed.status} size="sm" />
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-1">{bed.ward} ({bed.roomNumber})</p>
                
                {bed.status === 'Occupied' && bed.currentPatientName ? (
                  <div className="mt-3 p-2.5 bg-white rounded-xl border border-blue-100 text-xs">
                    <p className="font-bold text-slate-900">{bed.currentPatientName}</p>
                    <p className="text-slate-500 mt-0.5">Dr. {bed.attendingDoctorName}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Admitted: {bed.admittedDate}</p>
                  </div>
                ) : (
                  <div className="mt-3 py-4 text-center text-xs text-slate-400">
                    Rate: ${bed.dailyRate} / day
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {bed.status === 'Available' && (
                  <button
                    onClick={() => setAdmitModalBed(bed)}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    Admit Patient
                  </button>
                )}
                {bed.status === 'Occupied' && (
                  <button
                    onClick={() => handleDischarge(bed)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-lg font-semibold transition border border-slate-200"
                  >
                    Discharge Patient
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admit Patient Modal */}
      {admitModalBed && (
        <Modal isOpen={!!admitModalBed} onClose={() => setAdmitModalBed(null)} title={`Admit Patient to Bed ${admitModalBed.bedNumber} (${admitModalBed.ward})`}>
          <form onSubmit={handleAdmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
              <select
                value={admitForm.patientId}
                onChange={e => setAdmitForm({ ...admitForm, patientId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName} ({p.patientNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Attending Physician *</label>
              <select
                value={admitForm.doctorId}
                onChange={e => setAdmitForm({ ...admitForm, doctorId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admission Diagnosis *</label>
              <input
                type="text"
                required
                value={admitForm.diagnosis}
                onChange={e => setAdmitForm({ ...admitForm, diagnosis: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setAdmitModalBed(null)} className="px-4 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm">Confirm Admission</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

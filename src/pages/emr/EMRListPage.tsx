
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, Printer, Search, User, Activity, Stethoscope } from 'lucide-react';
import { emrService } from '../../services/emrService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { MedicalRecord, PrescriptionItem } from '../../types/emr';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { triggerPrint } from '../../utils/printUtils';

export const EMRListPage: React.FC = () => {
  const { showToast } = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  const [newRecord, setNewRecord] = useState({
    patientId: '',
    doctorId: '',
    chiefComplaint: '',
    symptoms: '',
    diagnosisCode: 'I10',
    diagnosisDescription: 'Essential (primary) hypertension',
    bp: '120/80',
    heartRate: 72,
    temp: 36.6,
    spo2: 99,
    respRate: 16,
    clinicalNotes: '',
    treatmentPlan: '',
    medicineName: '',
    medicineDosage: '',
    medicineFreq: '',
    medicineDuration: '',
    orderedLabs: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [recs, pats, docs] = await Promise.all([
          emrService.getAll(),
          patientService.getAll(),
          doctorService.getAll()
        ]);
        setRecords(recs);
        setPatients(pats);
        setDoctors(docs);
        setNewRecord(prev => ({
          ...prev,
          patientId: pats[0]?.id || '',
          doctorId: docs[0]?.id || ''
        }));
      } catch (err: any) {
        showToast('error', 'Failed to load EMR data', err?.message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredRecords = records.filter(r =>
    r.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.recordNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.diagnosisDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.doctorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === newRecord.patientId);
    const doc = doctors.find(d => d.id === newRecord.doctorId);
    if (!pat || !doc) {
      showToast('error', 'Validation Error', 'Please select a valid patient and doctor');
      return;
    }

    const prescriptions: PrescriptionItem[] = newRecord.medicineName ? [
      {
        medicineName: newRecord.medicineName,
        dosage: newRecord.medicineDosage || '500mg',
        frequency: newRecord.medicineFreq || 'Once daily',
        duration: newRecord.medicineDuration || '7 days',
        quantity: 14,
        instructions: 'Take as instructed'
      }
    ] : [];

    try {
      const created = await emrService.create({
        patientId: pat.id,
        patientName: pat.fullName,
        doctorId: doc.id,
        doctorName: doc.name,
        department: doc.department,
        visitDate: new Date().toISOString().split('T')[0],
        chiefComplaint: newRecord.chiefComplaint || 'Routine medical encounter',
        symptoms: newRecord.symptoms ? newRecord.symptoms.split(',').map((s: string) => s.trim()) : ['General assessment'],
        diagnosisCode: newRecord.diagnosisCode,
        diagnosisDescription: newRecord.diagnosisDescription,
        vitals: {
          bloodPressure: newRecord.bp,
          heartRate: Number(newRecord.heartRate),
          temperature: Number(newRecord.temp),
          oxygenSaturation: Number(newRecord.spo2),
          respiratoryRate: Number(newRecord.respRate),
          recordedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        },
        clinicalNotes: newRecord.clinicalNotes || 'Patient evaluated. Systems stable.',
        treatmentPlan: newRecord.treatmentPlan || 'Continue home medications.',
        prescriptions,
        orderedLabTests: newRecord.orderedLabs ? newRecord.orderedLabs.split(',').map((s: string) => s.trim()) : []
      });

      const updatedRecords = await emrService.getAll();
      setRecords(updatedRecords);
      setCreateModalOpen(false);
      showToast('success', 'Medical Record Created', `Encounter saved as ${created?.recordNumber ?? 'new record'}`);
    } catch (err: any) {
      showToast('error', 'Failed to create medical record', err?.message ?? 'Unknown error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Electronic Medical Records (EMR)</h2>
          <p className="text-sm text-slate-500 mt-1">Clinical documentation, ICD-10 diagnoses, vitals, and encounter archives.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Clinical Encounter</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search records by patient, doctor, diagnosis code..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-subtle focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">Loading medical records...</div>
      ) : (
        /* EMR Cards Feed */
        <div className="space-y-4">
          {filteredRecords.map(record => (
            <div key={record.id} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle hover:shadow-card transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{record.recordNumber}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400">{formatDate(record.visitDate)}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {record.patientName} — <span className="text-blue-700 font-semibold">{record.diagnosisDescription}</span> ({record.diagnosisCode})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Attending Physician: {record.doctorName} ({record.department})</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                  >
                    View Full Chart
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecord(record);
                      setTimeout(() => triggerPrint(), 300);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg transition"
                    title="Print Clinical Summary"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Vitals Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-4 p-3 bg-slate-50/70 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Blood Pressure</span>
                  <p className="font-bold text-slate-800">{record.vitals?.bloodPressure} mmHg</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Heart Rate</span>
                  <p className="font-bold text-slate-800">{record.vitals?.heartRate} bpm</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">SpO2</span>
                  <p className="font-bold text-slate-800">{record.vitals?.oxygenSaturation}%</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Temperature</span>
                  <p className="font-bold text-slate-800">{record.vitals?.temperature}°C</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Resp Rate</span>
                  <p className="font-bold text-slate-800">{record.vitals?.respiratoryRate} /min</p>
                </div>
              </div>

              {/* Clinical Content */}
              <div className="space-y-2 text-xs text-slate-700">
                <p><strong className="text-slate-900 font-semibold">Chief Complaint:</strong> {record.chiefComplaint}</p>
                <p><strong className="text-slate-900 font-semibold">Clinical Examination Notes:</strong> {record.clinicalNotes}</p>
                <p><strong className="text-slate-900 font-semibold">Treatment Plan:</strong> {record.treatmentPlan}</p>
              </div>

              {/* Prescriptions and Labs */}
              {record.prescriptions && record.prescriptions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Prescriptions:</span>
                  {record.prescriptions.map((rx: any, idx: number) => (
                    <span key={idx} className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-medium">
                      {rx.medicineName} ({rx.dosage}) - {rx.frequency}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {filteredRecords.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400 text-sm">No medical records found.</div>
          )}
        </div>
      )}

      {/* New Clinical Encounter Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="New Electronic Medical Record (EMR)" maxWidth="2xl">
        <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient *</label>
              <select
                value={newRecord.patientId}
                onChange={e => setNewRecord({ ...newRecord, patientId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName} ({p.patientNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Doctor *</label>
              <select
                value={newRecord.doctorId}
                onChange={e => setNewRecord({ ...newRecord, doctorId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Chief Complaint *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chest tightness on exertion with palpitations"
              value={newRecord.chiefComplaint}
              onChange={e => setNewRecord({ ...newRecord, chiefComplaint: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ICD-10 Code</label>
              <input
                type="text"
                value={newRecord.diagnosisCode}
                onChange={e => setNewRecord({ ...newRecord, diagnosisCode: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Diagnosis Description</label>
              <input
                type="text"
                required
                value={newRecord.diagnosisDescription}
                onChange={e => setNewRecord({ ...newRecord, diagnosisDescription: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Vitals Ribbon Inputs */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vital Signs</label>
            <div className="grid grid-cols-5 gap-2">
              <input type="text" placeholder="BP (120/80)" value={newRecord.bp} onChange={e => setNewRecord({ ...newRecord, bp: e.target.value })} className="px-2 py-1.5 border rounded text-xs" />
              <input type="number" placeholder="HR (bpm)" value={newRecord.heartRate} onChange={e => setNewRecord({ ...newRecord, heartRate: Number(e.target.value) })} className="px-2 py-1.5 border rounded text-xs" />
              <input type="number" step="0.1" placeholder="Temp (°C)" value={newRecord.temp} onChange={e => setNewRecord({ ...newRecord, temp: Number(e.target.value) })} className="px-2 py-1.5 border rounded text-xs" />
              <input type="number" placeholder="SpO2 (%)" value={newRecord.spo2} onChange={e => setNewRecord({ ...newRecord, spo2: Number(e.target.value) })} className="px-2 py-1.5 border rounded text-xs" />
              <input type="number" placeholder="RR (/min)" value={newRecord.respRate} onChange={e => setNewRecord({ ...newRecord, respRate: Number(e.target.value) })} className="px-2 py-1.5 border rounded text-xs" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical Notes & Findings</label>
            <textarea
              rows={3}
              placeholder="Auscultation, palpation, observations..."
              value={newRecord.clinicalNotes}
              onChange={e => setNewRecord({ ...newRecord, clinicalNotes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Treatment Plan</label>
            <textarea
              rows={2}
              placeholder="Recommended therapies, lifestyle changes, follow-up..."
              value={newRecord.treatmentPlan}
              onChange={e => setNewRecord({ ...newRecord, treatmentPlan: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Prescribe Medicine</label>
              <input type="text" placeholder="Drug name" value={newRecord.medicineName} onChange={e => setNewRecord({ ...newRecord, medicineName: e.target.value })} className="w-full px-2 py-1.5 border rounded text-xs" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dosage</label>
              <input type="text" placeholder="e.g. 20mg" value={newRecord.medicineDosage} onChange={e => setNewRecord({ ...newRecord, medicineDosage: e.target.value })} className="w-full px-2 py-1.5 border rounded text-xs" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
              <input type="text" placeholder="e.g. Daily" value={newRecord.medicineFreq} onChange={e => setNewRecord({ ...newRecord, medicineFreq: e.target.value })} className="w-full px-2 py-1.5 border rounded text-xs" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm">Save Medical Record</button>
          </div>
        </form>
      </Modal>

      {/* View/Print Chart Modal */}
      {selectedRecord && (
        <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Patient Medical Record Summary" maxWidth="2xl">
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl space-y-1">
              <p className="text-sm font-bold text-slate-900">{selectedRecord.patientName}</p>
              <p className="text-slate-500">Record ID: {selectedRecord.recordNumber} • Date: {formatDate(selectedRecord.visitDate)}</p>
              <p className="text-slate-600">Attending Doctor: {selectedRecord.doctorName} ({selectedRecord.department})</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Diagnosis:</h4>
              <p className="text-blue-700 font-semibold">{selectedRecord.diagnosisDescription} ({selectedRecord.diagnosisCode})</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Clinical Assessment:</h4>
              <p className="text-slate-600 mt-1">{selectedRecord.clinicalNotes}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Treatment Plan:</h4>
              <p className="text-slate-600 mt-1">{selectedRecord.treatmentPlan}</p>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 no-print">
              <button onClick={() => triggerPrint()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg flex items-center gap-1.5">
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

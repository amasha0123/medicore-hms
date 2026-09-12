
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, MapPin, Calendar, Heart, ShieldAlert,
  FileSpreadsheet, FlaskConical, Pill, CreditCard, ArrowLeft,
  Activity, Clock, Download, Plus
} from 'lucide-react';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { emrService } from '../../services/emrService';
import { labService } from '../../services/labService';
import { pharmacyService } from '../../services/pharmacyService';
import { billingService } from '../../services/billingService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Tabs } from '../../components/common/Tabs';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [patientLabs, setPatientLabs] = useState<any[]>([]);
  const [patientRx, setPatientRx] = useState<any[]>([]);
  const [patientInvoices, setPatientInvoices] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadPatientData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const p = await patientService.getById(id);
        if (!isMounted) return;
        setPatient(p);

        if (p?.id) {
          const [apts, emr, labs, rx, inv] = await Promise.all([
            appointmentService.getAll().catch(() => []),
            emrService.getByPatientId(p.id).catch(() => []),
            labService.getAll().catch(() => []),
            pharmacyService.getPrescriptions().catch(() => []),
            billingService.getInvoices().catch(() => [])
          ]);

          if (!isMounted) return;
          setPatientAppointments((apts || []).filter((a: any) => a.patientId === p.id));
          setPatientRecords(emr || []);
          setPatientLabs((labs || []).filter((l: any) => l.patientId === p.id));
          setPatientRx((rx || []).filter((r: any) => r.patientId === p.id));
          setPatientInvoices((inv || []).filter((i: any) => i.patientId === p.id));
        }
      } catch {
        if (isMounted) setPatient(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPatientData();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
        Loading patient profile...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-base font-bold text-slate-700">Patient not found</p>
        <button
          onClick={() => navigate('/patients')}
          className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg"
        >
          Return to Patient Directory
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'timeline', label: 'Medical History', icon: <Heart className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', badge: patientAppointments.length, icon: <Calendar className="w-4 h-4" /> },
    { id: 'emr', label: 'Clinical Records', badge: patientRecords.length, icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'lab', label: 'Lab Results', badge: patientLabs.length, icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'prescriptions', label: 'Prescriptions', badge: patientRx.length, icon: <Pill className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing & Invoices', badge: patientInvoices.length, icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/patients')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Patients Directory</span>
      </button>

      {/* Patient Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            {(patient.fullName || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{patient.fullName}</h2>
              <StatusBadge status={patient.status} size="sm" />
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {patient.patientNumber}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
              <span>{patient.gender} • {patient.age} yrs (DOB: {formatDate(patient.dateOfBirth)})</span>
              <span>Blood Group: <strong className="text-slate-800">{patient.bloodGroup}</strong></span>
              <span>NIC: {patient.nationalId}</span>
              <span>Phone: {patient.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/appointments')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            Book Appointment
          </button>
          <button
            onClick={() => navigate('/medical-records')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Add Record
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Vitals summary if available */}
            {patient.vitals && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Latest Vital Signs</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Recorded: {patient.vitals.recordedAt}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Blood Pressure</span>
                    <p className="text-lg font-bold text-slate-800 mt-0.5">{patient.vitals.bloodPressure} <span className="text-xs font-normal text-slate-500">mmHg</span></p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Heart Rate</span>
                    <p className="text-lg font-bold text-slate-800 mt-0.5">{patient.vitals.heartRate} <span className="text-xs font-normal text-slate-500">bpm</span></p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">SpO2 Oxygen</span>
                    <p className="text-lg font-bold text-slate-800 mt-0.5">{patient.vitals.oxygenSaturation}%</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Temperature</span>
                    <p className="text-lg font-bold text-slate-800 mt-0.5">{patient.vitals.temperature}°C</p>
                  </div>
                </div>
              </div>
            )}

            {/* Address & Emergency Info */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Contact & Demographic Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                  <p className="text-slate-400 uppercase font-semibold text-[10px]">Residential Address</p>
                  <p className="text-slate-800 font-medium mt-1">{patient.address.street}</p>
                  <p>{patient.address.city}, {patient.address.province}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-semibold text-[10px]">Emergency Contact</p>
                  <p className="text-slate-800 font-medium mt-1">{patient.emergencyContact.name} ({patient.emergencyContact.relationship})</p>
                  <p className="text-blue-600 font-semibold">{patient.emergencyContact.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Alerts Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5 text-rose-700">
                <ShieldAlert className="w-4 h-4" />
                <span>Drug & Food Allergies</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(patient.allergies || []).map((allergy: any, i: number) => (
                  <span key={i} className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Chronic Conditions</h3>
              <div className="space-y-1.5">
                {(patient.chronicConditions || []).map((condition: any, i: number) => (
                  <div key={i} className="p-2 bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Medical History Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Chronological Clinical Encounters</h3>
          <div className="space-y-6">
            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
              patient.medicalHistory.map((h: any, idx: number) => (
                <div key={h.id || idx} className="relative pl-6 border-l-2 border-blue-200 pb-2">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white" />
                  <span className="text-xs font-semibold text-slate-400">{formatDate(h.date)} • {h.type}</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{h.title}</h4>
                  <p className="text-xs text-slate-500">Attending: {h.doctorName}</p>
                  {h.diagnosis && (
                    <p className="text-xs text-slate-800 mt-1"><strong className="text-slate-600">Diagnosis:</strong> {h.diagnosis}</p>
                  )}
                  {h.treatment && (
                    <p className="text-xs text-slate-600 mt-0.5"><strong className="text-slate-600">Treatment:</strong> {h.treatment}</p>
                  )}
                  {h.notes && <p className="text-xs text-slate-500 mt-1 italic bg-slate-50 p-2 rounded">{h.notes}</p>}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No prior historical encounters recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4">Appointment ID</th>
                <th className="py-2.5 px-4">Doctor</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientAppointments.map((a: any) => (
                <tr key={a.id}>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">{a.appointmentNumber}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{a.doctorName}</td>
                  <td className="py-3 px-4 text-slate-500">{a.department}</td>
                  <td className="py-3 px-4">{a.date} at {a.time}</td>
                  <td className="py-3 px-4"><StatusBadge status={a.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: EMR Records */}
      {activeTab === 'emr' && (
        <div className="space-y-4">
          {patientRecords.map((rec: any) => (
            <div key={rec.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600">{rec.recordNumber}</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{rec.diagnosisDescription} ({rec.diagnosisCode})</h4>
                  <p className="text-xs text-slate-500">Dr. {rec.doctorName} • {formatDate(rec.visitDate)}</p>
                </div>
              </div>
              <div className="mt-3 text-xs space-y-2 text-slate-700">
                <p><strong>Chief Complaint:</strong> {rec.chiefComplaint}</p>
                <p><strong>Clinical Assessment:</strong> {rec.clinicalNotes}</p>
                <p><strong>Treatment Plan:</strong> {rec.treatmentPlan}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Lab Results */}
      {activeTab === 'lab' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4">Test Code</th>
                <th className="py-2.5 px-4">Test Name</th>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientLabs.map((l: any) => (
                <tr key={l.id}>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">{l.testCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{l.testName}</td>
                  <td className="py-3 px-4"><StatusBadge status={l.priority} size="sm" /></td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(l.requestedDate)}</td>
                  <td className="py-3 px-4"><StatusBadge status={l.sampleStatus} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-3">
          {patientRx.map((rx: any) => (
            <div key={rx.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex justify-between items-center">
              <div>
                <p className="font-mono text-xs font-bold text-blue-600">{rx.prescriptionNumber}</p>
                <p className="text-xs text-slate-500">Dr. {rx.doctorName} • {formatDate(rx.date)}</p>
                <div className="mt-2 text-xs font-semibold text-slate-800">
                  {rx.items.map((i: any) => `${i.medicineName} (${i.dosage}) - ${i.frequency}`).join('; ')}
                </div>
              </div>
              <StatusBadge status={rx.status} size="sm" />
            </div>
          ))}
        </div>
      )}

      {/* Tab: Billing */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Total</th>
                <th className="py-2.5 px-4 text-right">Balance Due</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientInvoices.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(inv.date)}</td>
                  <td className="py-3 px-4 text-right font-bold">{formatCurrency(inv.totalAmount)}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600">{formatCurrency(inv.balanceDue)}</td>
                  <td className="py-3 px-4 text-center"><StatusBadge status={inv.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

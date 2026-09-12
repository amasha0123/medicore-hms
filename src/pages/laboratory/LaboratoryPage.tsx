
import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus, Printer, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { labService } from '../../services/labService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { LaboratoryTest, LabTestPriority, SampleStatus } from '../../types/laboratory';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { PrintableLabReport } from '../../components/print/PrintableLabReport';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const LaboratoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [tests, setTests] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [resultModalTest, setResultModalTest] = useState<any | null>(null);
  const [printTest, setPrintTest] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'Requested' | 'Sample Collected' | 'Processing' | 'Completed'>('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [t, pats, docs] = await Promise.all([
          labService.getAll(),
          patientService.getAll(),
          doctorService.getAll()
        ]);
        setTests(t);
        setPatients(pats);
        setDoctors(docs);
      } catch (err: any) {
        showToast('error', 'Load failed', err?.message ?? 'Could not load lab data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [requestForm, setRequestForm] = useState({
    patientId: patients[0]?.id || '',
    doctorId: doctors[0]?.id || '',
    testName: 'Complete Blood Count (CBC) with Differential',
    category: 'Hematology' as LaboratoryTest['category'],
    priority: 'Normal' as LabTestPriority,
    sampleType: 'Venous Blood (EDTA)',
    technicianNotes: ''
  });

  const [resultParam, setResultParam] = useState({
    paramName: 'Result Value',
    val: '',
    unit: 'mg/dL',
    refRange: '10 - 50',
    isAbnormal: false,
    remarks: ''
  });

  const handleOrderTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p: any) => p.id === requestForm.patientId);
    const doc = doctors.find((d: any) => d.id === requestForm.doctorId);
    if (!pat || !doc) return;

    try {
      const created = await labService.createRequest({
        patientId: pat.id,
        patientName: pat.fullName,
        patientAge: pat.age,
        patientGender: pat.gender,
        doctorId: doc.id,
        doctorName: doc.name,
        testName: requestForm.testName,
        category: requestForm.category,
        requestedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        priority: requestForm.priority,
        sampleType: requestForm.sampleType,
        technicianNotes: requestForm.technicianNotes
      });

      setTests(await labService.getAll());
      setRequestModalOpen(false);
      showToast('success', 'Lab Test Requested', `Test ID ${created.testCode} created`);
    } catch (err: any) {
      showToast('error', 'Request failed', err?.message ?? 'Unknown error');
    }
  };

  const handleStatusUpdate = async (id: string, status: SampleStatus) => {
    try {
      await labService.updateStatus(id, status);
      setTests(await labService.getAll());
      showToast('info', 'Status Updated', `Sample status set to ${status}`);
    } catch (err: any) {
      showToast('error', 'Update failed', err?.message ?? 'Unknown error');
    }
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultModalTest) return;

    try {
      await labService.enterResults({
        labRequestId: resultModalTest.id,
        results: [
          {
            parameter: resultParam.paramName,
            value: resultParam.val,
            unit: resultParam.unit,
            referenceRange: resultParam.refRange,
            isAbnormal: resultParam.isAbnormal
          }
        ],
        pathologistRemarks: resultParam.remarks || 'Diagnostics verified according to laboratory standards.'
      });

      setTests(await labService.getAll());
      setResultModalTest(null);
      showToast('success', 'Lab Results Recorded', 'The findings have been archived and patient chart updated.');
    } catch (err: any) {
      showToast('error', 'Save failed', err?.message ?? 'Unknown error');
    }
  };

  const filteredTests = tests.filter(t => activeFilter === 'ALL' || t.sampleStatus === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Diagnostic Laboratory</h2>
          <p className="text-sm text-slate-500 mt-1">Clinical pathology, automated test analysis, specimen intake, and reports.</p>
        </div>
        <button
          onClick={() => setRequestModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Order Laboratory Test</span>
        </button>
      </div>

      {/* Lab KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tests Requested" value={tests.filter(t => t.sampleStatus === 'Requested').length} icon={<Clock className="w-5 h-5" />} subtext="Awaiting specimen" color="amber" />
        <StatCard title="Samples Collected" value={tests.filter(t => t.sampleStatus === 'Sample Collected').length} icon={<FlaskConical className="w-5 h-5" />} subtext="In transit to lab" color="blue" />
        <StatCard title="Tests in Processing" value={tests.filter(t => t.sampleStatus === 'Processing').length} icon={<AlertTriangle className="w-5 h-5" />} subtext="Automated analyzers" color="purple" />
        <StatCard title="Completed Results" value={tests.filter(t => t.sampleStatus === 'Completed').length} icon={<CheckCircle className="w-5 h-5" />} subtext="Certified reports" color="emerald" />
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'Requested', 'Sample Collected', 'Processing', 'Completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' ? 'All Requests' : tab}
          </button>
        ))}
      </div>

      {/* Test Worklist Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100 font-semibold">
            <tr>
              <th className="py-3 px-4">Test Code</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Test Name</th>
              <th className="py-3 px-4">Referring Doctor</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTests.map(test => (
              <tr key={test.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-semibold text-blue-600">{test.testCode}</td>
                <td className="py-3 px-4 font-bold text-slate-800">
                  {test.patientName}
                  <span className="block text-[10px] text-slate-400 font-normal">{test.patientGender}, {test.patientAge} yrs</span>
                </td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-800">{test.testName}</p>
                  <p className="text-[10px] text-slate-400">{test.sampleType}</p>
                </td>
                <td className="py-3 px-4 text-slate-600">{test.doctorName}</td>
                <td className="py-3 px-4"><StatusBadge status={test.priority} size="sm" /></td>
                <td className="py-3 px-4"><StatusBadge status={test.sampleStatus} size="sm" /></td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {test.sampleStatus === 'Requested' && (
                      <button
                        onClick={() => handleStatusUpdate(test.id, 'Sample Collected')}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                      >
                        Collect Sample
                      </button>
                    )}
                    {test.sampleStatus === 'Sample Collected' && (
                      <button
                        onClick={() => handleStatusUpdate(test.id, 'Processing')}
                        className="px-2.5 py-1 text-xs font-semibold text-purple-600 bg-purple-50 rounded hover:bg-purple-100"
                      >
                        Start Analysis
                      </button>
                    )}
                    {test.sampleStatus === 'Processing' && (
                      <button
                        onClick={() => setResultModalTest(test)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded hover:bg-emerald-100"
                      >
                        Enter Results
                      </button>
                    )}
                    {test.sampleStatus === 'Completed' && (
                      <button
                        onClick={() => setPrintTest(test)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 border rounded hover:bg-slate-50"
                        title="Print Diagnostic Report"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Test Modal */}
      <Modal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} title="Order Diagnostic Laboratory Test">
        <form onSubmit={handleOrderTest} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Patient *</label>
            <select
              value={requestForm.patientId}
              onChange={e => setRequestForm({ ...requestForm, patientId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.patientNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Referring Doctor *</label>
            <select
              value={requestForm.doctorId}
              onChange={e => setRequestForm({ ...requestForm, doctorId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Test Name *</label>
              <input
                type="text"
                required
                value={requestForm.testName}
                onChange={e => setRequestForm({ ...requestForm, testName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={requestForm.priority}
                onChange={e => setRequestForm({ ...requestForm, priority: e.target.value as LabTestPriority })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical STAT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sample Type</label>
              <input
                type="text"
                value={requestForm.sampleType}
                onChange={e => setRequestForm({ ...requestForm, sampleType: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={requestForm.category}
                onChange={e => setRequestForm({ ...requestForm, category: e.target.value as LaboratoryTest['category'] })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Pathology">Pathology</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setRequestModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm">Submit Order</button>
          </div>
        </form>
      </Modal>

      {/* Enter Result Modal */}
      {resultModalTest && (
        <Modal isOpen={!!resultModalTest} onClose={() => setResultModalTest(null)} title={`Enter Test Results: ${resultModalTest.testName}`}>
          <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-bold text-slate-800">Patient: {resultModalTest.patientName}</p>
              <p className="text-slate-500">Test Code: {resultModalTest.testCode} • Priority: {resultModalTest.priority}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Measured Value *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14.2"
                  value={resultParam.val}
                  onChange={e => setResultParam({ ...resultParam, val: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Units</label>
                <input
                  type="text"
                  value={resultParam.unit}
                  onChange={e => setResultParam({ ...resultParam, unit: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference Normal Interval</label>
                <input
                  type="text"
                  value={resultParam.refRange}
                  onChange={e => setResultParam({ ...resultParam, refRange: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resultParam.isAbnormal}
                    onChange={e => setResultParam({ ...resultParam, isAbnormal: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="font-bold text-rose-600">Flag Abnormal Result</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pathologist Remarks & Clinical Correlation</label>
              <textarea
                rows={3}
                placeholder="Findings interpretation..."
                value={resultParam.remarks}
                onChange={e => setResultParam({ ...resultParam, remarks: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setResultModalTest(null)} className="px-4 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm">Save & Mark Completed</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Report Modal */}
      {printTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <PrintableLabReport test={printTest} onClose={() => setPrintTest(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

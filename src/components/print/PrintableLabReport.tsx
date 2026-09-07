
import React from 'react';
import { LaboratoryTest } from '../../types/laboratory';
import { formatDate } from '../../utils/formatters';
import { HeartPulse, Printer } from 'lucide-react';
import { triggerPrint } from '../../utils/printUtils';

export const PrintableLabReport: React.FC<{ test: LaboratoryTest; onClose?: () => void }> = ({ test, onClose }) => {
  return (
    <div className="bg-white p-8 max-w-3xl mx-auto rounded-xl border border-slate-200 print:border-none print:p-0">
      <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-600">Diagnostic Laboratory Report</span>
        <div className="flex gap-2">
          {onClose && <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-600 border rounded-lg">Close</button>}
          <button onClick={triggerPrint} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg">
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">MediCore Diagnostics Laboratory</h2>
            <p className="text-xs text-slate-500">ISO 15189 Certified Clinical Pathology Unit</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="font-bold text-slate-800">Test ID: {test.testCode}</p>
          <p className="text-slate-500">Completed: {formatDate(test.completedDate || test.requestedDate)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 rounded-lg text-xs">
        <div>
          <p><span className="font-semibold text-slate-600">Patient:</span> {test.patientName}</p>
          <p><span className="font-semibold text-slate-600">Age / Gender:</span> {test.patientAge} yrs / {test.patientGender}</p>
          <p><span className="font-semibold text-slate-600">Specimen:</span> {test.sampleType}</p>
        </div>
        <div className="text-right">
          <p><span className="font-semibold text-slate-600">Referring Doctor:</span> {test.doctorName}</p>
          <p><span className="font-semibold text-slate-600">Category:</span> {test.category}</p>
          <p><span className="font-semibold text-slate-600">Priority:</span> {test.priority}</p>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-800 mt-6 mb-2 border-b border-slate-200 pb-1">{test.testName}</h3>

      {test.results && test.results.length > 0 ? (
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
              <th className="py-2">Test Parameter</th>
              <th className="py-2">Result</th>
              <th className="py-2">Units</th>
              <th className="py-2">Reference Interval</th>
              <th className="py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {test.results.map((r, idx) => (
              <tr key={idx} className={r.isAbnormal ? 'bg-rose-50/50' : ''}>
                <td className="py-2.5 font-medium text-slate-800">{r.parameter}</td>
                <td className={`py-2.5 font-bold ${r.isAbnormal ? 'text-rose-700' : 'text-slate-800'}`}>{r.value}</td>
                <td className="py-2.5 text-slate-500">{r.unit}</td>
                <td className="py-2.5 text-slate-600">{r.referenceRange}</td>
                <td className="py-2.5 text-center font-bold">
                  {r.isAbnormal ? (
                    <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded">ABNORMAL</span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">NORMAL</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-xs text-slate-500 py-4 italic">No structured parameter measurements recorded for this test.</p>
      )}

      {test.pathologistRemarks && (
        <div className="mt-6 p-3 bg-slate-50 rounded-lg text-xs border border-slate-200">
          <p className="font-bold text-slate-700">Pathologist Comments & Interpretation:</p>
          <p className="text-slate-600 mt-1">{test.pathologistRemarks}</p>
        </div>
      )}

      <div className="mt-10 pt-4 border-t border-slate-200 flex justify-between text-[11px] text-slate-400">
        <span>Verified by Marco Garcia, MLS (ASCP)</span>
        <span>Laboratory Chief Pathologist Signature</span>
      </div>
    </div>
  );
};

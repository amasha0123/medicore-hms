
import React from 'react';
import { PrescriptionOrder } from '../../types/pharmacy';
import { formatDate } from '../../utils/formatters';
import { HeartPulse, Printer } from 'lucide-react';
import { triggerPrint } from '../../utils/printUtils';

export const PrintablePrescription: React.FC<{ rx: PrescriptionOrder; onClose?: () => void }> = ({ rx, onClose }) => {
  return (
    <div className="bg-white p-8 max-w-xl mx-auto rounded-xl border border-slate-200 print:border-none print:p-0">
      <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-600">Official Doctor's Prescription</span>
        <div className="flex gap-2">
          {onClose && <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-600 border rounded-lg">Close</button>}
          <button onClick={triggerPrint} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg">
            <Printer className="w-3.5 h-3.5" />
            <span>Print Rx</span>
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">MediCore Hospital</h2>
          <p className="text-xs text-slate-500 font-semibold">{rx.doctorName}</p>
          <p className="text-[11px] text-slate-400">License: MD-NY-849201</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-bold text-slate-800">{rx.prescriptionNumber}</p>
          <p className="text-slate-500">Date: {formatDate(rx.date)}</p>
        </div>
      </div>

      <div className="my-4 p-3 bg-slate-50 rounded-lg text-xs">
        <p><span className="font-semibold text-slate-600">Patient:</span> {rx.patientName}</p>
        <p><span className="font-semibold text-slate-600">Patient ID:</span> {rx.patientId}</p>
      </div>

      {/* Rx Sign */}
      <div className="text-2xl font-serif font-black text-blue-900 my-4">℞</div>

      <div className="space-y-4 text-xs divide-y divide-slate-100">
        {rx.items.map((item, idx) => (
          <div key={idx} className="pt-3 first:pt-0">
            <p className="font-bold text-sm text-slate-900">{idx + 1}. {item.medicineName} — {item.dosage}</p>
            <p className="text-slate-600 mt-0.5"><span className="font-medium">Directions:</span> {item.frequency} for {item.duration}</p>
            <p className="text-slate-500 text-[11px]">Quantity: {item.quantity}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
        <div>
          <p className="text-[10px] text-slate-400">Prescription valid for 30 days from issue.</p>
        </div>
        <div className="text-right border-t border-slate-400 w-48 pt-1">
          <p className="font-serif italic text-slate-800">{rx.doctorName}</p>
          <p className="text-[10px] text-slate-400">Doctor's Digital Signature</p>
        </div>
      </div>
    </div>
  );
};

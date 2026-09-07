
import React from 'react';
import { Payment } from '../../types/billing';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { HeartPulse, Printer } from 'lucide-react';
import { triggerPrint } from '../../utils/printUtils';

export const PrintableReceipt: React.FC<{ payment: Payment; onClose?: () => void }> = ({ payment, onClose }) => {
  return (
    <div className="bg-white p-8 max-w-xl mx-auto rounded-xl border border-slate-200 print:border-none print:p-0">
      <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-600">Official Payment Receipt</span>
        <div className="flex gap-2">
          {onClose && <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-600 border rounded-lg">Close</button>}
          <button onClick={triggerPrint} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg">
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      <div className="text-center pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mx-auto mb-2">
          <HeartPulse className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">MediCore Central Hospital</h2>
        <p className="text-xs text-slate-400">Payment Transaction Receipt</p>
        <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full inline-block mt-2">
          PAYMENT COMPLETED
        </p>
      </div>

      <div className="my-6 space-y-2.5 text-xs text-slate-700">
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Receipt No:</span>
          <span className="font-bold">{payment.paymentNumber}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Invoice Reference:</span>
          <span className="font-semibold">{payment.invoiceNumber}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Patient Name:</span>
          <span className="font-semibold">{payment.patientName}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Date & Time:</span>
          <span>{formatDateTime(payment.paymentDate)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Payment Method:</span>
          <span className="font-semibold">{payment.paymentMethod}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Transaction ID:</span>
          <span className="font-mono text-slate-500">{payment.transactionRef}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Received By:</span>
          <span>{payment.receivedBy}</span>
        </div>
        <div className="flex justify-between pt-3 text-base font-bold text-slate-900">
          <span>Amount Paid:</span>
          <span className="text-emerald-700">{formatCurrency(payment.amount)}</span>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
        <p>Thank you for choosing MediCore Central Hospital.</p>
        <p>This is a computer-generated official receipt.</p>
      </div>
    </div>
  );
};

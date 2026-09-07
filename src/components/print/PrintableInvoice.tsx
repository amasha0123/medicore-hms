
import React from 'react';
import { Invoice } from '../../types/billing';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { HeartPulse, Printer } from 'lucide-react';
import { triggerPrint } from '../../utils/printUtils';

interface PrintableInvoiceProps {
  invoice: Invoice;
  onClose?: () => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice, onClose }) => {
  return (
    <div className="bg-white p-8 max-w-3xl mx-auto rounded-xl border border-slate-200 print:border-none print:p-0">
      {/* Header action bar (hidden in print) */}
      <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-600">Printable Hospital Invoice</span>
        <div className="flex items-center gap-2">
          {onClose && (
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              Close
            </button>
          )}
          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Hospital Letterhead */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">MediCore Central Hospital</h1>
            <p className="text-xs text-slate-500">100 Healthcare Boulevard, Suite 500 • Metropolis, NY 10001</p>
            <p className="text-xs text-slate-500">Tel: +1 (555) 900-0000 • Email: billing@medicore.hospital</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 text-sm font-bold uppercase rounded">
            INVOICE
          </span>
          <p className="text-sm font-bold text-slate-900 mt-2">{invoice.invoiceNumber}</p>
          <p className="text-xs text-slate-500">Date: {formatDate(invoice.date)}</p>
          <p className="text-xs text-slate-500">Due: {formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      {/* Bill To & Patient Info */}
      <div className="grid grid-cols-2 gap-6 my-6 text-xs text-slate-700">
        <div>
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Patient Information</h3>
          <p className="font-semibold text-sm text-slate-800">{invoice.patientName}</p>
          <p className="text-slate-500 mt-0.5">Patient ID: {invoice.patientId}</p>
          <p className="text-slate-500">Address: {invoice.patientAddress}</p>
          <p className="text-slate-500">Contact: {invoice.patientPhone}</p>
        </div>
        <div className="text-right">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Payment Status</h3>
          <span className="inline-block font-bold text-xs uppercase px-2.5 py-1 rounded border border-slate-300">
            {invoice.status}
          </span>
          {invoice.paymentMethod && (
            <p className="text-slate-500 mt-1">Method: {invoice.paymentMethod}</p>
          )}
        </div>
      </div>

      {/* Itemized Services Table */}
      <table className="w-full text-left text-xs border-collapse my-6">
        <thead>
          <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[10px]">
            <th className="py-2.5">Category</th>
            <th className="py-2.5">Description</th>
            <th className="py-2.5 text-center">Qty</th>
            <th className="py-2.5 text-right">Unit Price</th>
            <th className="py-2.5 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-2.5 font-medium text-slate-600">{item.serviceCategory}</td>
              <td className="py-2.5 text-slate-800 font-semibold">{item.description}</td>
              <td className="py-2.5 text-center">{item.quantity}</td>
              <td className="py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="py-2.5 text-right font-semibold">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Calculations Summary */}
      <div className="border-t border-slate-200 pt-4 flex justify-end">
        <div className="w-64 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount ({invoice.discountPercentage}%):</span>
              <span>-{formatCurrency(invoice.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Hospital Surcharge / Tax ({invoice.taxPercentage}%):</span>
            <span>+{formatCurrency(invoice.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Amount:</span>
            <span>{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Amount Paid:</span>
            <span>{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-rose-700 pt-1 border-t border-dashed border-slate-200">
            <span>Balance Due:</span>
            <span>{formatCurrency(invoice.balanceDue)}</span>
          </div>
        </div>
      </div>

      {/* Footer & Signature line */}
      <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-[11px] text-slate-500">
        <div>
          <p className="font-semibold text-slate-700">Payment Instructions</p>
          <p className="mt-1">Payments can be remitted online via the patient portal, at front desk cashier desks, or via wire transfer to MediCore Account #8841-9921.</p>
        </div>
        <div className="text-right flex flex-col justify-end items-end">
          <div className="w-48 border-b border-slate-400 pb-1 text-center">
            <span className="font-serif italic text-xs text-slate-700">Eleanor Vance, Hospital Admin</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Authorized Official Signature</span>
        </div>
      </div>
    </div>
  );
};

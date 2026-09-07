
import React, { useState } from 'react';
import { CreditCard, Plus, Printer, DollarSign, Clock, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { billingService } from '../../services/billingService';
import { patientService } from '../../services/patientService';
import { Invoice, PaymentMethod, InvoiceLineItem } from '../../types/billing';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { PrintableInvoice } from '../../components/print/PrintableInvoice';
import { PrintableReceipt } from '../../components/print/PrintableReceipt';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const BillingPage: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(() => billingService.getInvoices());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);
  const [printPayment, setPrintPayment] = useState<any | null>(null);

  const patients = patientService.getAll();

  const [newInvoice, setNewInvoice] = useState({
    patientId: patients[0]?.id || '',
    dueDate: '2026-09-21',
    category: 'Consultation' as InvoiceLineItem['serviceCategory'],
    description: 'Specialist Outpatient Consultation',
    unitPrice: 180,
    quantity: 1,
    discountPercentage: 0,
    taxPercentage: 4,
    notes: 'Standard hospital service bill'
  });

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');

  const totalRevenue = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === newInvoice.patientId);
    if (!pat) return;

    const subtotal = newInvoice.unitPrice * newInvoice.quantity;
    const discountAmount = (subtotal * newInvoice.discountPercentage) / 100;
    const taxable = subtotal - discountAmount;
    const taxAmount = (taxable * newInvoice.taxPercentage) / 100;
    const totalAmount = taxable + taxAmount;

    const created = billingService.createInvoice({
      patientId: pat.id,
      patientName: pat.fullName,
      patientPhone: pat.phone,
      patientAddress: `${pat.address.street}, ${pat.address.city}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: newInvoice.dueDate,
      items: [
        {
          id: `li-${Date.now().toString(36)}`,
          serviceCategory: newInvoice.category,
          description: newInvoice.description,
          unitPrice: newInvoice.unitPrice,
          quantity: newInvoice.quantity,
          total: subtotal
        }
      ],
      subtotal,
      discountPercentage: newInvoice.discountPercentage,
      discountAmount,
      taxPercentage: newInvoice.taxPercentage,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      balanceDue: totalAmount,
      status: 'Pending',
      notes: newInvoice.notes
    });

    setInvoices(billingService.getInvoices());
    setCreateModalOpen(false);
    showToast('success', 'Invoice Generated', `Invoice ${created.invoiceNumber} created for ${created.patientName}`);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalInvoice) return;

    const recorded = billingService.recordPayment({
      invoiceId: payModalInvoice.id,
      invoiceNumber: payModalInvoice.invoiceNumber,
      patientId: payModalInvoice.patientId,
      patientName: payModalInvoice.patientName,
      amount: paymentAmount,
      paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      paymentMethod,
      transactionRef: `TXN-${Math.random().toString(36).substring(7).toUpperCase()}`,
      receivedBy: 'Hospital Cashier',
      status: 'Successful'
    });

    setInvoices(billingService.getInvoices());
    setPayModalInvoice(null);
    showToast('success', 'Payment Recorded', `Receipt ${recorded.paymentNumber} issued for ${formatCurrency(paymentAmount)}`);
    setPrintPayment(recorded);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Billing & Patient Invoices</h2>
          <p className="text-sm text-slate-500 mt-1">Invoice processing, fee collections, copays, and receipts.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Collections" value={formatCurrency(totalRevenue)} icon={<DollarSign className="w-5 h-5" />} subtext="YTD collected" color="emerald" />
        <StatCard title="Outstanding Balance" value={formatCurrency(totalOutstanding)} icon={<AlertTriangle className="w-5 h-5" />} subtext="Pending settlement" color="rose" />
        <StatCard title="Paid Invoices" value={invoices.filter(i => i.status === 'Paid').length} icon={<CheckCircle2 className="w-5 h-5" />} subtext="Settled accounts" color="blue" />
        <StatCard title="Pending Invoices" value={invoices.filter(i => i.status !== 'Paid').length} icon={<Clock className="w-5 h-5" />} subtext="Awaiting payment" color="amber" />
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100 font-semibold">
            <tr>
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Issue Date</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4 text-right">Paid</th>
              <th className="py-3 px-4 text-right">Balance Due</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-semibold text-blue-600">{inv.invoiceNumber}</td>
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-800">{inv.patientName}</p>
                  <p className="text-[10px] text-slate-400">{inv.patientPhone}</p>
                </td>
                <td className="py-3 px-4 text-slate-500">{formatDate(inv.date)}</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(inv.dueDate)}</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-semibold">{formatCurrency(inv.paidAmount)}</td>
                <td className="py-3 px-4 text-right font-bold text-rose-600">{formatCurrency(inv.balanceDue)}</td>
                <td className="py-3 px-4 text-center"><StatusBadge status={inv.status} size="sm" /></td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {inv.balanceDue > 0 && (
                      <button
                        onClick={() => {
                          setPayModalInvoice(inv);
                          setPaymentAmount(inv.balanceDue);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded hover:bg-emerald-100"
                      >
                        Pay
                      </button>
                    )}
                    <button
                      onClick={() => setPrintInvoice(inv)}
                      className="p-1.5 border rounded hover:bg-slate-50 text-slate-500"
                      title="Print Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Generate Patient Hospital Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Patient *</label>
            <select
              value={newInvoice.patientId}
              onChange={e => setNewInvoice({ ...newInvoice, patientId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.patientNumber})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Service Category</label>
              <select
                value={newInvoice.category}
                onChange={e => setNewInvoice({ ...newInvoice, category: e.target.value as InvoiceLineItem['serviceCategory'] })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Consultation">Consultation</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Admission">Ward Admission</option>
                <option value="Surgery">Surgery / Procedure</option>
                <option value="Nursing">Nursing Services</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Due Date</label>
              <input
                type="date"
                required
                value={newInvoice.dueDate}
                onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Item Description *</label>
            <input
              type="text"
              required
              value={newInvoice.description}
              onChange={e => setNewInvoice({ ...newInvoice, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={newInvoice.unitPrice}
                onChange={e => setNewInvoice({ ...newInvoice, unitPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                value={newInvoice.quantity}
                onChange={e => setNewInvoice({ ...newInvoice, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount (%)</label>
              <input
                type="number"
                value={newInvoice.discountPercentage}
                onChange={e => setNewInvoice({ ...newInvoice, discountPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Calculated Total:</span>
              <strong className="text-slate-900 font-bold">
                {formatCurrency((newInvoice.unitPrice * newInvoice.quantity * (1 - newInvoice.discountPercentage / 100)) * 1.04)}
              </strong>
            </div>
            <p className="text-[10px] text-slate-400">Includes 4% healthcare administrative tax</p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm">Generate Invoice</button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      {payModalInvoice && (
        <Modal isOpen={!!payModalInvoice} onClose={() => setPayModalInvoice(null)} title={`Record Payment: ${payModalInvoice.invoiceNumber}`}>
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-bold text-slate-800">Patient: {payModalInvoice.patientName}</p>
              <p className="text-slate-500">Balance Due: <strong className="text-rose-600">{formatCurrency(payModalInvoice.balanceDue)}</strong></p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                max={payModalInvoice.balanceDue}
                required
                value={paymentAmount}
                onChange={e => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer / Wire</option>
                <option value="Insurance">Insurance Copay</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setPayModalInvoice(null)} className="px-4 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm">Confirm Payment</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Invoice Modal */}
      {printInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <PrintableInvoice invoice={printInvoice} onClose={() => setPrintInvoice(null)} />
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {printPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <PrintableReceipt payment={printPayment} onClose={() => setPrintPayment(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

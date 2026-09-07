
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { billingService } from '../../services/billingService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

export const AccountantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const invoices = billingService.getInvoices();
  const payments = billingService.getPayments();

  const totalRevenueToday = 18450;
  const pendingInvoices = invoices.filter(i => i.status === 'Pending' || i.status === 'Partially Paid');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Finance & Hospital Billing</h2>
        <p className="text-sm text-slate-500 mt-1">Logged in as David Sterling, CPA (Finance Director)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Collections" value={formatCurrency(totalRevenueToday)} icon={<DollarSign className="w-5 h-5" />} subtext="+15.4% vs target" color="emerald" />
        <StatCard title="Outstanding Invoices" value={pendingInvoices.length} icon={<Clock className="w-5 h-5" />} subtext="Pending settlement" color="amber" />
        <StatCard title="Invoices Paid in Full" value={invoices.filter(i => i.status === 'Paid').length} icon={<CheckCircle className="w-5 h-5" />} subtext="Cleared accounts" color="blue" />
        <StatCard title="Recent Transactions" value={payments.length} icon={<FileText className="w-5 h-5" />} subtext="Receipts issued" color="purple" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Unsettled Patient Accounts</h3>
          <button onClick={() => navigate('/billing')} className="text-xs font-semibold text-blue-600 hover:underline">
            View All Invoices &rarr;
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {pendingInvoices.map(inv => (
            <div key={inv.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{inv.invoiceNumber} — {inv.patientName}</p>
                <p className="text-xs text-slate-500">Total: {formatCurrency(inv.totalAmount)} • Paid: {formatCurrency(inv.paidAmount)} • Balance Due: <span className="text-rose-600 font-bold">{formatCurrency(inv.balanceDue)}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={inv.status} size="sm" />
                <button
                  onClick={() => navigate('/billing')}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100"
                >
                  Record Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { BarChart3, Download, Printer, Filter, Calendar, FileText } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import { useToast } from '../../context/ToastContext';
import { triggerPrint } from '../../utils/printUtils';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [reportCategory, setReportCategory] = useState<'patient' | 'revenue' | 'pharmacy' | 'lab'>('patient');
  const [timeRange, setTimeRange] = useState('30d');

  const patientDemographicsData = [
    { ageGroup: '0-18', count: 180 },
    { ageGroup: '19-35', count: 320 },
    { ageGroup: '36-50', count: 460 },
    { ageGroup: '51-65', count: 540 },
    { ageGroup: '65+', count: 380 },
  ];

  const financialRevenueData = [
    { month: 'Apr', revenue: 91000, target: 85000 },
    { month: 'May', revenue: 102000, target: 90000 },
    { month: 'Jun', revenue: 113000, target: 95000 },
    { month: 'Jul', revenue: 107000, target: 95000 },
    { month: 'Aug', revenue: 125000, target: 100000 },
    { month: 'Sep', revenue: 140000, target: 110000 },
  ];

  const handleExport = (type: string) => {
    showToast('success', `Exported ${type.toUpperCase()}`, `Generating formatted ${type} file download...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Hospital Reports & Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">Operational business intelligence, financial reporting, and clinical metrics.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Range filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'patient', label: 'Patient Reports' },
            { id: 'revenue', label: 'Financial & Revenue' },
            { id: 'pharmacy', label: 'Pharmacy & Drug Stock' },
            { id: 'lab', label: 'Laboratory Performance' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setReportCategory(c.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                reportCategory === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Period:</span>
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
            <option value="1y">Full Year</option>
          </select>
        </div>
      </div>

      {/* Chart visualization */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {reportCategory === 'patient' && 'Patient Demographics & Age Distribution'}
              {reportCategory === 'revenue' && 'Monthly Hospital Collections vs Target Target'}
              {reportCategory === 'pharmacy' && 'Prescription Dispensing Volume & Stock Out Rate'}
              {reportCategory === 'lab' && 'Diagnostic Turnaround Times (TAT)'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Aggregated hospital data for period: {timeRange}</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {reportCategory === 'patient' ? (
              <BarChart data={patientDemographicsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="ageGroup" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" name="Patient Count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={financialRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`]} />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Actual Collections" stroke="#10b981" fill="#a7f3d0" />
                <Area type="monotone" dataKey="target" name="Target" stroke="#64748b" fill="#f1f5f9" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

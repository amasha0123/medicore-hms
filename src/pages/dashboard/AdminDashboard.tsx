
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  UserCheck,
  FlaskConical,
  AlertTriangle,
  DollarSign,
  Plus,
  ArrowRight,
  Activity,
  FileSpreadsheet,
  Pill,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { auditService } from '../../services/auditService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [patientStatsTimeframe, setPatientStatsTimeframe] = useState<'7d' | '30d' | '6m' | '1y'>('30d');

  const appointments = appointmentService.getAll().slice(0, 5);
  const totalPatients = patientService.getAll().length;
  const totalDoctors = doctorService.getAll().length;
  const auditLogs = auditService.getAll().slice(0, 6);

  // Mock Recharts Data for Timeframes
  const patientTrendData = {
    '7d': [
      { name: 'Mon', newPatients: 14, returning: 32 },
      { name: 'Tue', newPatients: 18, returning: 38 },
      { name: 'Wed', newPatients: 22, returning: 41 },
      { name: 'Thu', newPatients: 19, returning: 35 },
      { name: 'Fri', newPatients: 25, returning: 46 },
      { name: 'Sat', newPatients: 12, returning: 24 },
      { name: 'Sun', newPatients: 8, returning: 18 },
    ],
    '30d': [
      { name: 'Week 1', newPatients: 95, returning: 210 },
      { name: 'Week 2', newPatients: 120, returning: 245 },
      { name: 'Week 3', newPatients: 110, returning: 230 },
      { name: 'Week 4', newPatients: 142, returning: 280 },
    ],
    '6m': [
      { name: 'Apr', newPatients: 420, returning: 980 },
      { name: 'May', newPatients: 460, returning: 1050 },
      { name: 'Jun', newPatients: 510, returning: 1120 },
      { name: 'Jul', newPatients: 490, returning: 1180 },
      { name: 'Aug', newPatients: 540, returning: 1240 },
      { name: 'Sep', newPatients: 580, returning: 1310 },
    ],
    '1y': [
      { name: 'Q1', newPatients: 1280, returning: 3100 },
      { name: 'Q2', newPatients: 1450, returning: 3450 },
      { name: 'Q3', newPatients: 1620, returning: 3820 },
      { name: 'Q4', newPatients: 1790, returning: 4100 },
    ]
  };

  const appointmentStatusData = [
    { status: 'Completed', count: 48, fill: '#10b981' },
    { status: 'Scheduled', count: 32, fill: '#3b82f6' },
    { status: 'Cancelled', count: 6, fill: '#f43f5e' },
    { status: 'In Progress', count: 8, fill: '#0d9488' },
  ];

  const revenueCategoryData = [
    { month: 'Apr', Consultation: 24000, Laboratory: 14000, Pharmacy: 18000, Admission: 35000 },
    { month: 'May', Consultation: 28000, Laboratory: 16500, Pharmacy: 19500, Admission: 38000 },
    { month: 'Jun', Consultation: 31000, Laboratory: 18000, Pharmacy: 22000, Admission: 42000 },
    { month: 'Jul', Consultation: 29500, Laboratory: 17200, Pharmacy: 21000, Admission: 39500 },
    { month: 'Aug', Consultation: 34000, Laboratory: 21000, Pharmacy: 24500, Admission: 46000 },
    { month: 'Sep', Consultation: 38500, Laboratory: 23500, Pharmacy: 26800, Admission: 51000 },
  ];

  const departmentData = [
    { name: 'Cardiology', patients: 320, color: '#3b82f6' },
    { name: 'General Med', patients: 480, color: '#0d9488' },
    { name: 'Pediatrics', patients: 260, color: '#f59e0b' },
    { name: 'Orthopedics', patients: 210, color: '#8b5cf6' },
    { name: 'Neurology', patients: 145, color: '#ec4899' },
    { name: 'Lab & Diagnostic', patients: 390, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Good morning, Admin</h2>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening across MediCore hospital today.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All Clinical Systems Operational
          </span>
        </div>
      </div>

      {/* 6 Hospital KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Patients"
          value="12,548"
          icon={<Users className="w-5 h-5" />}
          change="+8.2%"
          isPositive={true}
          subtext="vs last month"
          color="blue"
        />
        <StatCard
          title="Today's Appointments"
          value="42"
          icon={<Calendar className="w-5 h-5" />}
          change="+12.4%"
          isPositive={true}
          subtext="8 in progress"
          color="teal"
        />
        <StatCard
          title="Available Doctors"
          value={`${totalDoctors} on duty`}
          icon={<UserCheck className="w-5 h-5" />}
          change="88%"
          isPositive={true}
          subtext="Coverage"
          color="purple"
        />
        <StatCard
          title="Pending Lab Tests"
          value="18"
          icon={<FlaskConical className="w-5 h-5" />}
          change="-4.5%"
          isPositive={true}
          subtext="2 critical stats"
          color="amber"
        />
        <StatCard
          title="Pharmacy Alerts"
          value="6"
          icon={<AlertTriangle className="w-5 h-5" />}
          change="3 Low Stock"
          isPositive={false}
          subtext="1 Expiring soon"
          color="rose"
        />
        <StatCard
          title="Today's Revenue"
          value="$18,450"
          icon={<DollarSign className="w-5 h-5" />}
          change="+15.4%"
          isPositive={true}
          subtext="vs yesterday"
          color="emerald"
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-subtle">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/patients/new')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Patient</span>
          </button>
          <button
            onClick={() => navigate('/appointments')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Book Appointment</span>
          </button>
          <button
            onClick={() => navigate('/medical-records')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Medical Record</span>
          </button>
          <button
            onClick={() => navigate('/laboratory')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
            <span>Request Lab Test</span>
          </button>
          <button
            onClick={() => navigate('/pharmacy')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <Pill className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Medicine</span>
          </button>
          <button
            onClick={() => navigate('/billing')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Analytics Charts Row 1: Patient Trends & Appointment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Statistics Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Patient Statistics</h3>
              <p className="text-xs text-slate-400">New patient acquisitions vs returning consultations</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
              {(['7d', '30d', '6m', '1y'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setPatientStatsTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    patientStatsTimeframe === tf ? 'bg-white font-bold text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patientTrendData[patientStatsTimeframe]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="newPatients" name="New Patients" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorNew)" />
                <Area type="monotone" dataKey="returning" name="Returning Patients" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorReturning)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Overview Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Appointment Overview</h3>
            <p className="text-xs text-slate-400">Status volume across hospital clinics</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentStatusData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="status" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="count" name="Appointments" radius={[0, 6, 6, 0]}>
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Scheduled</span>
              <p className="text-sm font-bold text-slate-800">94 Today</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Completion Rate</span>
              <p className="text-sm font-bold text-emerald-600">92.4%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row 2: Revenue Overview & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview Multi-Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Revenue Overview</h3>
              <p className="text-xs text-slate-400">Monthly gross collections breakdown by operational stream</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              YTD: $642,800
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueCategoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={val => `$${val/1000}k`} />
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`]} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Admission" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
                <Area type="monotone" dataKey="Consultation" stackId="1" stroke="#0d9488" fill="#99f6e4" />
                <Area type="monotone" dataKey="Laboratory" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" />
                <Area type="monotone" dataKey="Pharmacy" stackId="1" stroke="#f59e0b" fill="#fde68a" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Patient Volume Statistics */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Department Statistics</h3>
            <p className="text-xs text-slate-400">Current active workload by clinical specialty</p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  dataKey="patients"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val} patients`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {departmentData.map(d => (
              <div key={d.name} className="flex items-center gap-2 p-1 rounded">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600 truncate">{d.name}</span>
                <span className="ml-auto font-bold text-slate-800">{d.patients}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Today's Appointments Table & Recent Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Today's Appointments</h3>
              <p className="text-xs text-slate-400">Live consultation queue and arrivals</p>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>View all schedule</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Patient</th>
                  <th className="py-2.5 px-4">Doctor</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {apt.patientName}
                      <span className="block text-[10px] text-slate-400 font-normal">{apt.patientPhone}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{apt.doctorName}</td>
                    <td className="py-3 px-4 text-slate-500">{apt.department}</td>
                    <td className="py-3 px-4 font-medium">{apt.time}</td>
                    <td className="py-3 px-4 text-slate-500">{apt.type}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={apt.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/patients/${apt.patientId}`)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Hospital Activity Timeline */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Hospital Activity</h3>
              <p className="text-xs text-slate-400">Live operational audit trail</p>
            </div>
            <button
              onClick={() => navigate('/audit-logs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Logs &rarr;
            </button>
          </div>

          <div className="space-y-4">
            {auditLogs.map((log, idx) => (
              <div key={log.id} className="flex items-start gap-3 relative">
                {idx < auditLogs.length - 1 && (
                  <span className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-slate-100" />
                )}
                <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 z-10">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {log.details}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{log.userName} ({log.userRole})</span>
                    <span>•</span>
                    <span>{log.timestamp.split(' ')[1]}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { labService } from '../../services/labService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const LabDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadLabData() {
      try {
        setLoading(true);
        const data = await labService.getAll().catch(() => []);
        if (isMounted) {
          setTests(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load lab dashboard data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLabData();
    return () => { isMounted = false; };
  }, []);

  const pendingTests = tests.filter(t => t.sampleStatus !== 'Completed');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Diagnostic Pathology Station</h2>
        <p className="text-sm text-slate-500 mt-1">
          Logged in as {currentUser?.name || 'Lab Staff'} ({currentUser?.department || 'Diagnostic Laboratory'})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tests in Progress"
          value={loading ? '...' : tests.filter(t => t.sampleStatus === 'Processing').length}
          icon={<FlaskConical className="w-5 h-5" />}
          subtext="On auto-analyzers"
          color="blue"
        />
        <StatCard
          title="Samples Awaiting Collection"
          value={loading ? '...' : tests.filter(t => t.sampleStatus === 'Requested' || t.status === 'Pending').length}
          icon={<Clock className="w-5 h-5" />}
          subtext="Phlebotomy room"
          color="amber"
        />
        <StatCard
          title="Critical STAT Orders"
          value={loading ? '...' : tests.filter(t => t.priority === 'Critical').length}
          icon={<AlertTriangle className="w-5 h-5" />}
          subtext="Emergency priority"
          color="rose"
        />
        <StatCard
          title="Completed Tests"
          value={loading ? '...' : tests.filter(t => t.sampleStatus === 'Completed').length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          subtext="Turnaround 45 min avg"
          color="emerald"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Active Test Requests Queue</h3>
          <button onClick={() => navigate('/laboratory')} className="text-xs font-semibold text-blue-600 hover:underline">
            View Laboratory Worklist &rarr;
          </button>
        </div>

        {pendingTests.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            {loading ? 'Loading lab worklist...' : 'No pending lab tests in the queue.'}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingTests.map(test => (
              <div key={test.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{test.testName}</p>
                  <p className="text-xs text-slate-500">
                    Patient: {test.patientName || test.patient?.fullName || 'Registered Patient'} • Specimen: {test.sampleType || 'Blood'} • Ref: {test.doctorName || 'Doctor'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={test.priority || 'Normal'} size="sm" />
                  <StatusBadge status={test.sampleStatus || 'Pending'} size="sm" />
                  <button
                    onClick={() => navigate('/laboratory')}
                    className="px-2.5 py-1 text-xs bg-blue-50 text-blue-600 font-semibold rounded hover:bg-blue-100 transition"
                  >
                    Enter Result
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

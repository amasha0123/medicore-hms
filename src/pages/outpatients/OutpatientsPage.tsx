
import React, { useState, useEffect } from 'react';
import { Clock, Plus, Volume2 } from 'lucide-react';
import { outpatientService } from '../../services/outpatientService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { OutpatientQueueItem, OutpatientQueueStatus } from '../../types/outpatient';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const OutpatientsPage: React.FC = () => {
  const { showToast } = useToast();
  const [queue, setQueue] = useState<OutpatientQueueItem[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  const [newItem, setNewItem] = useState({
    patientId: '',
    doctorId: '',
    priority: 'Normal' as OutpatientQueueItem['priority'],
    notes: 'Outpatient consult check'
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingQueue(true);
        const [queueData, pats, docs] = await Promise.all([
          outpatientService.getQueue(),
          patientService.getAll(),
          doctorService.getAll()
        ]);
        setQueue(queueData);
        setPatients(pats);
        setDoctors(docs);
        setNewItem(prev => ({
          ...prev,
          patientId: pats[0]?.id || '',
          doctorId: docs[0]?.id || ''
        }));
      } catch (err: any) {
        showToast('error', 'Failed to load outpatient data', err?.message ?? 'Unknown error');
      } finally {
        setLoadingQueue(false);
      }
    }
    loadData();
  }, []);

  const handleAddToQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === newItem.patientId);
    const doc = doctors.find(d => d.id === newItem.doctorId);
    if (!pat || !doc) {
      showToast('error', 'Validation Error', 'Please select a valid patient and doctor');
      return;
    }
    try {
      const added = await outpatientService.addToQueue({
        patientId: pat.id,
        patientName: pat.fullName,
        doctorId: doc.id,
        doctorName: doc.name,
        department: doc.department,
        arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: newItem.priority,
        notes: newItem.notes
      });
      const updatedQueue = await outpatientService.getQueue();
      setQueue(updatedQueue);
      setAddModalOpen(false);
      showToast('success', 'Added to Queue', `Ticket ${added.queueNumber} issued for ${added.patientName}`);
    } catch (err: any) {
      showToast('error', 'Add to Queue Failed', err?.message ?? 'Unknown error');
    }
  };

  const handleStatusUpdate = async (id: string, status: OutpatientQueueStatus) => {
    try {
      await outpatientService.updateStatus(id, status);
      const updatedQueue = await outpatientService.getQueue();
      setQueue(updatedQueue);
      showToast('info', 'Queue Status Updated', `Patient status changed to ${status}`);
    } catch (err: any) {
      showToast('error', 'Status Update Failed', err?.message ?? 'Unknown error');
    }
  };

  const handleCallPatient = (item: OutpatientQueueItem) => {
    showToast('info', 'Calling Patient', `Ticket ${item.queueNumber} - ${item.patientName} please proceed to ${item.doctorName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Outpatient Queue & Triage</h2>
          <p className="text-sm text-slate-500 mt-1">Live waiting room board, consultation call triggers, and triage status.</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Queue Ticket</span>
        </button>
      </div>

      {/* Live Queue Board */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Live Clinic Waiting Queue ({queue.filter(q => q.status !== 'Completed' && q.status !== 'Cancelled').length} Waiting)</span>
        </h3>

        {loadingQueue ? (
          <div className="text-center py-10 text-slate-400 text-sm">Loading queue...</div>
        ) : queue.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">No patients in queue.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map(item => (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                    item.priority === 'Emergency' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {item.queueNumber}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.patientName}</h4>
                    <p className="text-xs text-slate-500">
                      Arrived: {item.arrivalTime} • Doctor: {item.doctorName} ({item.department})
                    </p>
                    {item.notes && <p className="text-[11px] text-slate-400 mt-0.5">{item.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} size="sm" />

                  {item.status === 'Waiting' && (
                    <>
                      <button
                        onClick={() => handleCallPatient(item)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(item.id, 'In Consultation')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg"
                      >
                        Start Consult
                      </button>
                    </>
                  )}

                  {item.status === 'In Consultation' && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'Completed')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to Queue Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Issue Outpatient Queue Ticket">
        <form onSubmit={handleAddToQueue} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Patient *</label>
            <select
              value={newItem.patientId}
              onChange={e => setNewItem({ ...newItem, patientId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.patientNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Consulting Doctor *</label>
            <select
              value={newItem.doctorId}
              onChange={e => setNewItem({ ...newItem, doctorId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Triage Priority</label>
            <select
              value={newItem.priority}
              onChange={e => setNewItem({ ...newItem, priority: e.target.value as OutpatientQueueItem['priority'] })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="Normal">Normal</option>
              <option value="Priority">Priority</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Triage Notes</label>
            <input
              type="text"
              value={newItem.notes}
              onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-medium text-slate-700">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm">Issue Ticket</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

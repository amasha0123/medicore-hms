
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, Pill, FileText, UserCheck, X } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { pharmacyService } from '../../services/pharmacyService';
import { billingService } from '../../services/billingService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const patients = patientService.getAll().filter(p =>
    q && (p.fullName.toLowerCase().includes(q) || p.patientNumber.toLowerCase().includes(q) || p.phone.includes(q))
  ).slice(0, 4);

  const doctors = doctorService.getAll().filter(d =>
    q && (d.name.toLowerCase().includes(q) || d.department.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q))
  ).slice(0, 3);

  const appointments = appointmentService.getAll().filter(a =>
    q && (a.appointmentNumber.toLowerCase().includes(q) || a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q))
  ).slice(0, 3);

  const medicines = pharmacyService.getMedicines().filter(m =>
    q && (m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.code.toLowerCase().includes(q))
  ).slice(0, 3);

  const invoices = billingService.getInvoices().filter(i =>
    q && (i.invoiceNumber.toLowerCase().includes(q) || i.patientName.toLowerCase().includes(q))
  ).slice(0, 3);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search patients, doctors, appointments, medications, invoices..."
            className="w-full px-3 py-4 text-base bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto divide-y divide-slate-100">
          {!query.trim() && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Type to search across the entire MediCore hospital system
            </div>
          )}

          {query.trim() && (
            <div className="space-y-4">
              {/* Patients */}
              {patients.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Patients</h4>
                  <div className="space-y-1">
                    {patients.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(`/patients/${p.id}`)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-800">{p.fullName}</p>
                            <p className="text-xs text-slate-400">{p.patientNumber} • {p.gender}, {p.age} yrs • {p.phone}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{p.bloodGroup}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctors */}
              {doctors.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Doctors</h4>
                  <div className="space-y-1">
                    {doctors.map(d => (
                      <div
                        key={d.id}
                        onClick={() => handleSelect('/doctors')}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-teal-50 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="w-4 h-4 text-teal-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-800">{d.name}</p>
                            <p className="text-xs text-slate-400">{d.specialization} • {d.department}</p>
                          </div>
                        </div>
                        <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium">{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointments */}
              {appointments.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Appointments</h4>
                  <div className="space-y-1">
                    {appointments.map(a => (
                      <div
                        key={a.id}
                        onClick={() => handleSelect(`/appointments`)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-800">{a.appointmentNumber} - {a.patientName}</p>
                            <p className="text-xs text-slate-400">{a.doctorName} • {a.date} at {a.time}</p>
                          </div>
                        </div>
                        <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium">{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicines */}
              {medicines.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pharmacy Inventory</h4>
                  <div className="space-y-1">
                    {medicines.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleSelect(`/pharmacy`)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Pill className="w-4 h-4 text-emerald-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-800">{m.name} ({m.strength})</p>
                            <p className="text-xs text-slate-400">{m.code} • {m.genericName} • Stock: {m.quantityInStock}</p>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {invoices.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Billing & Invoices</h4>
                  <div className="space-y-1">
                    {invoices.map(i => (
                      <div
                        key={i.id}
                        onClick={() => handleSelect(`/billing`)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-amber-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-800">{i.invoiceNumber} - {i.patientName}</p>
                            <p className="text-xs text-slate-400">Total: ${i.totalAmount.toFixed(2)} • Due: ${i.balanceDue.toFixed(2)}</p>
                          </div>
                        </div>
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">{i.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {patients.length === 0 && doctors.length === 0 && appointments.length === 0 && medicines.length === 0 && invoices.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No matches found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono">ESC</kbd> to exit</span>
          <span>MediCore Universal Search</span>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Heart, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';
import { BloodGroup, Gender } from '../../types/patient';

export const PatientNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: '',
    dateOfBirth: '',
    gender: 'Male' as Gender,
    nationalId: '',
    bloodGroup: 'O+' as BloodGroup,
    phone: '',
    email: '',
    primaryDepartment: 'Cardiology',
    // Step 2: Address & Emergency Contact
    street: '',
    city: '',
    province: '',
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    // Step 3: Medical Information
    allergies: '',
    chronicConditions: '',
    medicalHistoryNotes: '',
    // Step 4: Documents (Simulated)
    documentTitle: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (s: number) => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
      if (!formData.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
      if (!formData.phone.trim()) errs.phone = 'Contact number is required';
      if (!formData.nationalId.trim()) errs.nationalId = 'National ID / NIC is required';
    } else if (s === 2) {
      if (!formData.city.trim()) errs.city = 'City is required';
      if (!formData.emergencyName.trim()) errs.emergencyName = 'Emergency contact name is required';
      if (!formData.emergencyPhone.trim()) errs.emergencyPhone = 'Emergency phone is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(4, s + 1));
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 30;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.max(1, Math.abs(new Date(diff).getUTCFullYear() - 1970));
  };

  const handleSubmit = (createAppointment = false) => {
    if (!validateStep(1)) {
      setStep(1);
      return;
    }

    const newPatient = patientService.create({
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      age: calculateAge(formData.dateOfBirth),
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      nationalId: formData.nationalId,
      phone: formData.phone,
      email: formData.email || `${formData.fullName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      address: {
        street: formData.street || '123 Health Way',
        city: formData.city || 'Metropolis',
        province: formData.province || 'Metro Central'
      },
      emergencyContact: {
        name: formData.emergencyName || 'Family Member',
        relationship: formData.emergencyRelationship || 'Relative',
        phone: formData.emergencyPhone || formData.phone
      },
      allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : ['None recorded'],
      chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map(s => s.trim()) : [],
      status: 'Active',
      primaryDepartment: formData.primaryDepartment,
      lastVisit: new Date().toISOString().split('T')[0],
      medicalHistory: formData.medicalHistoryNotes ? [
        {
          id: 'mh-init',
          date: new Date().toISOString().split('T')[0],
          type: 'Consultation',
          title: 'Initial Intake Registration',
          doctorName: 'Dr. Michael Chen',
          notes: formData.medicalHistoryNotes
        }
      ] : []
    });

    showToast('success', 'Patient Registered Successfully', `${newPatient.fullName} assigned ID ${newPatient.patientNumber}`);

    if (createAppointment) {
      navigate('/appointments');
    } else {
      navigate(`/patients/${newPatient.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Register New Patient</h2>
        <p className="text-sm text-slate-500 mt-1">Complete patient registration intake for hospital records.</p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-xl border border-slate-200">
        {[
          { num: 1, title: 'Personal Info', icon: <User className="w-4 h-4" /> },
          { num: 2, title: 'Address & Emergency', icon: <MapPin className="w-4 h-4" /> },
          { num: 3, title: 'Medical History', icon: <Heart className="w-4 h-4" /> },
          { num: 4, title: 'Documents & Review', icon: <FileText className="w-4 h-4" /> },
        ].map(s => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition ${
              step === s.num
                ? 'bg-blue-600 text-white shadow-sm'
                : step > s.num
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <span className="shrink-0">{s.icon}</span>
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">1. Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Rigby"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {errors.dateOfBirth && <p className="text-xs text-rose-500 mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={e => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">National ID / NIC *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIC-9948102"
                  value={formData.nationalId}
                  onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {errors.nationalId && <p className="text-xs text-rose-500 mt-1">{errors.nationalId}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Department</label>
                <select
                  value={formData.primaryDepartment}
                  onChange={e => setFormData({ ...formData, primaryDepartment: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Endocrinology">Endocrinology</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">2. Address & Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="Street name, apartment, suite"
                  value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  placeholder="Metropolis"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Province / State</label>
                <input
                  type="text"
                  placeholder="Metro Central"
                  value={formData.province}
                  onChange={e => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Emergency Contact</h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.emergencyName}
                  onChange={e => setFormData({ ...formData, emergencyName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {errors.emergencyName && <p className="text-xs text-rose-500 mt-1">{errors.emergencyName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                <select
                  value={formData.emergencyRelationship}
                  onChange={e => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend / Guardian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone *</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 999-9999"
                  value={formData.emergencyPhone}
                  onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                {errors.emergencyPhone && <p className="text-xs text-rose-500 mt-1">{errors.emergencyPhone}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">3. Medical Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Known Drug & Environmental Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, Latex (separate by commas)"
                  value={formData.allergies}
                  onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Existing Chronic Conditions</label>
                <input
                  type="text"
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                  value={formData.chronicConditions}
                  onChange={e => setFormData({ ...formData, chronicConditions: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Past Surgical & Medical History Notes</label>
                <textarea
                  rows={4}
                  placeholder="Relevant past medical interventions, hospitalizations, or family history..."
                  value={formData.medicalHistoryNotes}
                  onChange={e => setFormData({ ...formData, medicalHistoryNotes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">4. Document Upload & Review</h3>
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Attach Patient Identification or Medical Reports</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF, JPG, PNG up to 10MB</p>
              <input
                type="text"
                placeholder="Document description (e.g. National ID Scan, Referral Letter)"
                value={formData.documentTitle}
                onChange={e => setFormData({ ...formData, documentTitle: e.target.value })}
                className="mt-3 max-w-sm mx-auto px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg block w-full text-center"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800">Review Summary:</h4>
              <p><span className="text-slate-500">Name:</span> <strong className="text-slate-800">{formData.fullName || 'Not provided'}</strong></p>
              <p><span className="text-slate-500">Contact:</span> {formData.phone} • {formData.email}</p>
              <p><span className="text-slate-500">Department:</span> {formData.primaryDepartment} • Blood Group: {formData.bloodGroup}</p>
              <p><span className="text-slate-500">Allergies:</span> {formData.allergies || 'None recorded'}</p>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
          )}

          <div className="flex gap-2">
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                >
                  Save & Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Patient</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

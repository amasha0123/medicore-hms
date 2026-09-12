import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  AtSign,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  HeartPulse,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { ApiError } from '../../services/apiClient';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Username
    const usernameTrimmed = formData.username.trim();
    if (!usernameTrimmed) {
      newErrors.username = 'Username is required';
    } else if (usernameTrimmed.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(usernameTrimmed)) {
      newErrors.username = 'Username can only contain letters, numbers, periods, underscores, and hyphens';
    }

    // Email
    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number';
      } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one special character';
      }
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authService.registerAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setIsLoading(false);
      setIsSuccess(true);
      showToast(
        'success',
        'Registration Submitted',
        'Your account is pending administrator approval.'
      );
    } catch (err: any) {
      setIsLoading(false);

      const fieldErrors: FormErrors = {};
      const errorMessage = err?.message || 'Registration failed';

      // Check if ApiError has structured field errors
      if (err instanceof ApiError && err.errors && err.errors.length > 0) {
        err.errors.forEach(fe => {
          if (fe.field in formData) {
            (fieldErrors as any)[fe.field] = fe.message;
          }
        });
      }

      // Check message content for known duplicate conflicts
      const lowerMsg = errorMessage.toLowerCase();
      if (lowerMsg.includes('email already') || lowerMsg.includes('duplicate email')) {
        fieldErrors.email = 'An account with this email already exists.';
      } else if (lowerMsg.includes('username already') || lowerMsg.includes('username is already taken')) {
        fieldErrors.username = 'This username is already taken.';
      } else if (lowerMsg.includes('password') && !fieldErrors.password) {
        fieldErrors.password = errorMessage;
      } else if (
        err?.name === 'TypeError' ||
        lowerMsg.includes('failed to fetch') ||
        lowerMsg.includes('network') ||
        (err instanceof ApiError && (err.statusCode === 0 || err.statusCode >= 500))
      ) {
        fieldErrors.general = 'Unable to connect to the server. Please try again.';
      } else if (Object.keys(fieldErrors).length === 0) {
        fieldErrors.general = errorMessage;
      }

      setErrors(fieldErrors);
      showToast(
        'error',
        'Registration Failed',
        fieldErrors.general || fieldErrors.email || fieldErrors.username || errorMessage
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-[540px]">
        {/* Branding Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-500/20 mb-3">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">MediCore</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Hospital Management System — Staff Account Registration
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
          {isSuccess ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Registration Successful
                </h3>
                <p className="text-sm font-semibold text-emerald-700 mt-1">
                  Account Status: PENDING
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-left">
                <p className="text-xs text-emerald-950 leading-relaxed">
                  Registration successful. Your account is pending administrator approval.
                  You will be able to sign in after your account has been approved.
                </p>
                <p className="text-xs text-emerald-800 mt-2">
                  A hospital administrator will review your application, assign your role-specific permissions,
                  and activate your account.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md shadow-blue-500/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error Banner */}
              {errors.general && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* First Name & Last Name (2 columns on sm+) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      disabled={isLoading}
                      value={formData.firstName}
                      onChange={e => handleInputChange('firstName', e.target.value)}
                      placeholder="e.g. John"
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-xl border transition ${
                        errors.firstName
                          ? 'border-rose-300 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                      }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      disabled={isLoading}
                      value={formData.lastName}
                      onChange={e => handleInputChange('lastName', e.target.value)}
                      placeholder="e.g. Doe"
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-xl border transition ${
                        errors.lastName
                          ? 'border-rose-300 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                      }`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <AtSign className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    disabled={isLoading}
                    value={formData.username}
                    onChange={e => handleInputChange('username', e.target.value)}
                    placeholder="e.g. jdoe or j_doe"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-xl border transition ${
                      errors.username
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.username}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  At least 3 characters. Letters, numbers, periods, underscores, and hyphens.
                </p>
              </div>

              {/* Work Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled={isLoading}
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder="you@medicore.hospital"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-xl border transition ${
                      errors.email
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.email}</p>
                )}
              </div>

              {/* Phone Number Field (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    disabled={isLoading}
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="e.g. 0771234567"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-xl border transition ${
                      errors.phone
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.phone}</p>
                )}
              </div>

              {/* Password & Confirm Password (2 columns on sm+) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      disabled={isLoading}
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      placeholder="Min. 8 characters"
                      className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-xl border transition ${
                        errors.password
                          ? 'border-rose-300 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      disabled={isLoading}
                      value={formData.confirmPassword}
                      onChange={e => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Repeat password"
                      className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-xl border transition ${
                        errors.confirmPassword
                          ? 'border-rose-300 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Password Complexity Helper */}
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Password requirements:</span> At least 8 characters with uppercase, lowercase, number, and special character.
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md shadow-blue-500/20 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Register Staff Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* Security Indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>HIPAA-Compliant Staff Registration Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

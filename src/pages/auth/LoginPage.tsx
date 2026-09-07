
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, HeartPulse, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEMO_ACCOUNTS } from '../../data/mockData';
import { DemoAccount } from '../../types/auth';
import { Modal } from '../../components/common/Modal';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleDemoClick = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword('medicore2026!');
    setSelectedDemoRole(account.role);
    setErrors({});
    showToast('info', `Credentials loaded for ${account.roleName}`, 'Click "Sign in to MediCore" to proceed.');
  };

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Work email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid work email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      try {
        login(email, password, rememberMe);
        setIsLoading(false);
        setIsSuccess(true);
        showToast('success', 'Authentication Successful', 'Welcome to MediCore Hospital Management System.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
      } catch (err: any) {
        setIsLoading(false);
        setErrors({ email: err.message || 'Authentication failed' });
        showToast('error', 'Login Failed', err.message);
      }
    }, 750);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setForgotModalOpen(false);
      setResetSent(false);
      setForgotEmail('');
      showToast('success', 'Reset link dispatched', 'Instructions sent to your hospital work email.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-[490px]">
        {/* Branding Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-500/20 mb-3">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">MediCore</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Access your role-specific hospital dashboard
          </p>
        </div>

        {/* Centered Login Card */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Work Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-xl border transition ${
                    errors.password
                      ? 'border-rose-300 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
                />
                <button
                  type="button"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs font-medium text-slate-600">Keep me signed in for 30 days</span>
              </label>
            </div>

            {/* Primary Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-md ${
                  isSuccess
                    ? 'bg-emerald-600 shadow-emerald-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/20'
                } disabled:opacity-75 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Authenticated! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to MediCore</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>HIPAA-Compliant Encrypted Healthcare Session</span>
          </div>
        </div>

        {/* Demo Accounts Section */}
        <div className="mt-5 bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Demo Accounts</h3>
              <p className="text-xs text-slate-500">Click any role to autofill credentials</p>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              7 Roles Available
            </span>
          </div>

          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map(account => {
              const isSelected = selectedDemoRole === account.role;
              return (
                <div
                  key={account.role}
                  onClick={() => handleDemoClick(account)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-400/30'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                    }`}>
                      {account.badge}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1.5">
                        {account.roleName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{account.email}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition shrink-0">
                    Autofill &rarr;
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset MediCore Password"
        subtitle="Enter your verified work email to receive password reset instructions."
        maxWidth="sm"
      >
        {resetSent ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-800">Password Reset Email Dispatched</p>
            <p className="text-xs text-slate-500 mt-1">Please check your inbox or spam directory.</p>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Hospital Work Email
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="e.g. admin@medicore.hospital"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

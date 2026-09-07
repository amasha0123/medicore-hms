
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileSpreadsheet,
  FlaskConical,
  Pill,
  CreditCard,
  Bed,
  Clock,
  UserCog,
  BarChart3,
  Bell,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Activity,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, getRoleDisplayName } from '../../utils/permissions';
import { Permission } from '../../types/auth';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ReactNode;
  permission?: Permission;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems: NavItem[] = [
    { name: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Patients', to: '/patients', icon: <Users className="w-5 h-5" />, permission: 'patients:view' },
    { name: 'Doctors', to: '/doctors', icon: <UserCheck className="w-5 h-5" />, permission: 'doctors:view' },
    { name: 'Appointments', to: '/appointments', icon: <Calendar className="w-5 h-5" />, permission: 'appointments:view' },
    { name: 'Medical Records', to: '/medical-records', icon: <FileSpreadsheet className="w-5 h-5" />, permission: 'emr:view' },
    { name: 'Laboratory', to: '/laboratory', icon: <FlaskConical className="w-5 h-5" />, permission: 'lab:view' },
    { name: 'Pharmacy', to: '/pharmacy', icon: <Pill className="w-5 h-5" />, permission: 'pharmacy:view' },
    { name: 'Billing & Invoices', to: '/billing', icon: <CreditCard className="w-5 h-5" />, permission: 'billing:view' },
    { name: 'Inpatient Beds', to: '/admissions', icon: <Bed className="w-5 h-5" />, permission: 'admissions:view' },
    { name: 'Outpatient Queue', to: '/outpatients', icon: <Clock className="w-5 h-5" />, permission: 'outpatients:view' },
    { name: 'Staff & HR', to: '/staff', icon: <UserCog className="w-5 h-5" />, permission: 'staff:view' },
    { name: 'Reports & Analytics', to: '/reports', icon: <BarChart3 className="w-5 h-5" />, permission: 'reports:view' },
    { name: 'Notifications', to: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Audit Logs', to: '/audit-logs', icon: <ShieldAlert className="w-5 h-5" />, permission: 'audit:view' },
    { name: 'User Management', to: '/users', icon: <UserCheck className="w-5 h-5" />, permission: 'users:manage' },
    { name: 'Settings', to: '/settings', icon: <Settings className="w-5 h-5" />, permission: 'settings:manage' },
  ];

  // Filter items based on current role permissions
  const filteredNavItems = navigationItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(role || undefined, item.permission);
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center text-white font-black shadow-md shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="leading-none">
              <span className="text-base font-bold text-white tracking-tight">MediCore</span>
              <span className="block text-[10px] text-teal-400 uppercase tracking-widest font-semibold mt-0.5">HMS Enterprise</span>
            </div>
          )}
        </div>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {filteredNavItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition group ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
            title={isCollapsed ? item.name : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-600">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'MC'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Staff'}</p>
                <p className="text-[10px] text-teal-400 font-medium truncate">{role ? getRoleDisplayName(role) : 'User'}</p>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 no-print ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex no-print">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-64 h-full bg-slate-900 z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

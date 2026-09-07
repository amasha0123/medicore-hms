
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Menu, LogOut, Settings, User as UserIcon, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleDisplayName } from '../../utils/permissions';
import { UserRole } from '../../types/auth';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenSearch }) => {
  const { currentUser, role, logout, switchRoleForDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Generate dynamic page title and breadcrumb
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentTitle = pathSegments.length === 0
    ? 'Dashboard'
    : pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1).replace('-', ' ');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const demoRoles: UserRole[] = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT'];

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200/90 shadow-subtle no-print">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>MediCore</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-600 font-semibold">{currentTitle}</span>
              {pathSegments.length > 1 && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="text-blue-600 font-semibold">{pathSegments[1]}</span>
                </>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight hidden sm:block">{currentTitle}</h1>
          </div>
        </div>

        {/* Right: Quick Search, Role switcher pill, Notifications, User menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal Search trigger button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/70 text-slate-500 rounded-lg text-xs font-medium transition border border-slate-200/60"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Quick Search...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400">Ctrl+K</kbd>
          </button>

          {/* Role pill indicator */}
          <div className="hidden xl:flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200/70 px-2.5 py-1 rounded-full font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Role: {getRoleDisplayName(role || 'ADMIN')}</span>
          </div>

          <NotificationDropdown />

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'MC'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-slate-800 leading-none">{currentUser?.name || 'Staff User'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{role ? getRoleDisplayName(role) : 'Hospital Staff'}</p>
              </div>
            </button>

            {profileMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setProfileMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-40 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-800">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                      {role ? getRoleDisplayName(role) : 'Staff'}
                    </span>
                  </div>

                  {/* Switch Role Quick Tester */}
                  <div className="p-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      <span>Switch Demo Role</span>
                    </p>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {demoRoles.map(r => (
                        <button
                          key={r}
                          onClick={() => {
                            switchRoleForDemo(r);
                            setProfileMenuOpen(false);
                          }}
                          className={`text-[11px] text-left px-2 py-1 rounded font-medium transition ${
                            role === r ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {getRoleDisplayName(r).split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Hospital Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Security & Preferences</span>
                    </button>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


import React, { createContext, useContext, useState } from 'react';

import { User, UserRole } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password?: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  switchRoleForDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    authService.getCurrentUser()
  );

  /**
   * REAL BACKEND LOGIN
   *
   * This calls:
   * POST /api/v1/auth/login
   *
   * The backend returns:
   * - accessToken
   * - refreshToken
   * - user
   */
  const login = async (
    email: string,
    password?: string,
    rememberMe: boolean = false
  ): Promise<void> => {
    if (!password) {
      throw new Error('Password is required');
    }

    const result = await authService.loginAsync(
      email.trim(),
      password,
      rememberMe
    );

    setCurrentUser(result.user);
  };

  /**
   * REAL BACKEND LOGOUT
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logoutAsync();
    } finally {
      setCurrentUser(null);
    }
  };

  /**
   * Demo-only role switching.
   *
   * This is intentionally kept because the existing application
   * may use it for demo/testing purposes.
   */
  const switchRoleForDemo = (role: UserRole) => {
    const switched = authService.switchRole(role);
    setCurrentUser(switched);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchRoleForDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

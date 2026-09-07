
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => void;
  logout: () => void;
  switchRoleForDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    // If no user is logged in, default to Administrator for seamless demo initialization
    if (!currentUser) {
      const defaultAdmin = authService.getAllUsers()[0];
      if (defaultAdmin) {
        setCurrentUser(defaultAdmin);
      }
    }
  }, []);

  const login = (email: string, password?: string, rememberMe: boolean = false) => {
    const result = authService.login(email, password, rememberMe);
    setCurrentUser(result.user);
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

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
        switchRoleForDemo
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

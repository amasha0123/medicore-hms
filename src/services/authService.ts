
import { User, DemoAccount, UserRole } from '../types/auth';
import { DEMO_ACCOUNTS, INITIAL_USERS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';
import { auditService } from './auditService';
import { apiClient, IS_MOCK_MODE, setTokens, clearTokens, getAccessToken } from './apiClient';

const USERS_KEY = 'medicore_users';
const CURRENT_USER_KEY = 'medicore_current_user';
/** Legacy key — kept for backward-compat. Tokens now stored by apiClient. */
const TOKEN_KEY = 'medicore_jwt_token';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapApiUser(apiUser: any): User {
  return {
    id: apiUser.id,
    name: apiUser.name ?? `${apiUser.firstName ?? ''} ${apiUser.lastName ?? ''}`.trim(),
    email: apiUser.email,
    role: (apiUser.roles?.[0] ?? apiUser.role ?? 'ADMIN') as UserRole,
    department: apiUser.department ?? apiUser.doctor?.department?.name ?? 'General',
    avatar: apiUser.avatar ?? undefined,
    phone: apiUser.phone ?? undefined,
    status: apiUser.isActive ? 'Active' : 'Inactive',
    lastLogin: apiUser.lastLogin ?? new Date().toISOString().replace('T', ' ').substring(0, 16),
    createdAt: apiUser.createdAt?.split('T')[0] ?? new Date().toISOString().split('T')[0],
  };
}

// ─── Auth Service ────────────────────────────────────────────────────────────

export const authService = {
  getDemoAccounts(): DemoAccount[] {
    return DEMO_ACCOUNTS;
  },

  getAllUsers(): User[] {
    return getStoredItem<User[]>(USERS_KEY, INITIAL_USERS);
  },

  getCurrentUser(): User | null {
    return getStoredItem<User | null>(CURRENT_USER_KEY, null);
  },

  getToken(): string | null {
    return getAccessToken() || localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  /** Authenticate against the real backend or fall back to mock mode */
  async loginAsync(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<{ user: User; token: string }> {
    if (IS_MOCK_MODE) {
      // ── Mock mode (no backend configured) ──
      return this.login(email, password, rememberMe);
    }

    // ── Real API mode ──
    const data = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
      user: any;
    }>('/api/v1/auth/login', { email, password });

    setTokens(data.accessToken, data.refreshToken, rememberMe);
    const user = mapApiUser(data.user);
    setStoredItem(CURRENT_USER_KEY, user);

    auditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      module: 'AUTH',
      recordIdentifier: `SESSION-${user.role}`,
      details: `User authenticated via API (${rememberMe ? 'Persistent' : 'Session'})`,
      status: 'SUCCESS'
    });

    return { user, token: data.accessToken };
  },

  /** Synchronous mock-only login (used internally and as fallback) */
  login(email: string, _password?: string, rememberMe: boolean = false): { user: User; token: string } {
    const users = this.getAllUsers();
    let matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser) {
      const demo = DEMO_ACCOUNTS.find(d => d.email.toLowerCase() === email.toLowerCase());
      if (demo) {
        matchedUser = {
          id: `usr-${demo.role.toLowerCase()}-auto`,
          name: demo.name,
          email: demo.email,
          role: demo.role,
          department: demo.department,
          status: 'Active',
          lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
          createdAt: '2024-01-01'
        };
      } else {
        throw new Error('Invalid email or password. Please select a valid MediCore account.');
      }
    }

    const mockToken = `medicore_jwt_${matchedUser.role.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    matchedUser.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedUsers = users.map(u => u.id === matchedUser!.id ? matchedUser! : u);
    setStoredItem(USERS_KEY, updatedUsers);
    setStoredItem(CURRENT_USER_KEY, matchedUser);

    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, mockToken);
    } else {
      sessionStorage.setItem(TOKEN_KEY, mockToken);
    }

    auditService.log({
      userId: matchedUser.id,
      userName: matchedUser.name,
      userRole: matchedUser.role,
      action: 'LOGIN',
      module: 'AUTH',
      recordIdentifier: `SESSION-${matchedUser.role}`,
      details: `User authenticated (mock mode, ${rememberMe ? 'Persistent 30-day session' : 'Session storage'})`,
      status: 'SUCCESS'
    });

    return { user: matchedUser, token: mockToken };
  },

  async logoutAsync(): Promise<void> {
    if (!IS_MOCK_MODE) {
      try {
        await apiClient.post('/api/v1/auth/logout');
      } catch {
        // Best-effort — always clear local state
      }
    }
    this.logout();
  },

  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      auditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'LOGOUT',
        module: 'AUTH',
        recordIdentifier: `SESSION-CLOSE`,
        details: 'User logged out securely',
        status: 'SUCCESS'
      });
    }
    clearTokens();
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },

  switchRole(role: UserRole): User {
    const demo = DEMO_ACCOUNTS.find(d => d.role === role);
    const users = this.getAllUsers();
    const target = users.find(u => u.role === role) || {
      id: `usr-${role.toLowerCase()}-switched`,
      name: demo?.name || `Staff ${role}`,
      email: demo?.email || `${role.toLowerCase()}@medicore.hospital`,
      role: role,
      department: demo?.department || 'General',
      status: 'Active',
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdAt: '2024-01-01'
    };
    setStoredItem(CURRENT_USER_KEY, target);
    return target;
  },

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getAllUsers();
    const newUser: User = {
      ...user,
      id: `usr-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newUser, ...users];
    setStoredItem(USERS_KEY, updated);

    auditService.log({
      userId: 'admin',
      userName: 'Administrator',
      userRole: 'ADMIN',
      action: 'CREATE',
      module: 'SETTINGS',
      recordIdentifier: newUser.email,
      details: `Created new user ${newUser.name} with role ${newUser.role}`,
      status: 'SUCCESS'
    });

    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User {
    const users = this.getAllUsers();
    let updatedUser: User | null = null;
    const next = users.map(u => {
      if (u.id === id) {
        updatedUser = { ...u, ...updates };
        return updatedUser;
      }
      return u;
    });
    setStoredItem(USERS_KEY, next);
    return updatedUser!;
  }
};

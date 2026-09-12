
import { User, DemoAccount, UserRole, RegisterData, RegisterResponse } from '../types/auth';
import { DEMO_ACCOUNTS, INITIAL_USERS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';
import { auditService } from './auditService';
import {
  apiClient,
  IS_MOCK_MODE,
  setTokens,
  clearTokens,
  getAccessToken
} from './apiClient';

const USERS_KEY = 'medicore_users';
const CURRENT_USER_KEY = 'medicore_current_user';

/** Legacy key — kept for backward compatibility */
const TOKEN_KEY = 'medicore_jwt_token';

// ─── Re-exported Types ────────────────────────────────────────────────────────
export type { RegisterData, RegisterResponse };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapApiUser(apiUser: any): User {
  return {
    id: apiUser.id,

    name:
      apiUser.name ??
      `${apiUser.firstName ?? ''} ${apiUser.lastName ?? ''}`.trim(),

    email: apiUser.email,

    username: apiUser.username,

    role: (
      apiUser.roles?.[0] ??
      apiUser.role ??
      'ADMIN'
    ) as UserRole,

    department:
      apiUser.department ??
      apiUser.doctor?.department?.name ??
      'General',

    avatar:
      apiUser.avatar ??
      apiUser.profileImage ??
      undefined,

    phone:
      apiUser.phone ??
      undefined,

    status:
      apiUser.isActive
        ? 'Active'
        : 'Inactive',

    lastLogin:
      apiUser.lastLogin ??
      new Date()
        .toISOString()
        .replace('T', ' ')
        .substring(0, 16),

    createdAt:
      apiUser.createdAt?.split('T')[0] ??
      new Date()
        .toISOString()
        .split('T')[0],
  };
}

// ─── Auth Service ────────────────────────────────────────────────────────────

export const authService = {

  // ===========================================================================
  // DEMO ACCOUNTS
  // ===========================================================================

  getDemoAccounts(): DemoAccount[] {
    return DEMO_ACCOUNTS;
  },


  // ===========================================================================
  // USERS
  // ===========================================================================

  getAllUsers(): User[] {
    return getStoredItem<User[]>(
      USERS_KEY,
      INITIAL_USERS
    );
  },


  // ===========================================================================
  // CURRENT USER
  // ===========================================================================

  getCurrentUser(): User | null {
    return getStoredItem<User | null>(
      CURRENT_USER_KEY,
      null
    );
  },


  // ===========================================================================
  // TOKEN
  // ===========================================================================

  getToken(): string | null {
    return (
      getAccessToken() ||
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY)
    );
  },


  // ===========================================================================
  // REGISTER
  // ===========================================================================

  async registerAsync(
    data: RegisterData
  ): Promise<RegisterResponse> {

    // -------------------------------------------------------
    // MOCK MODE
    // -------------------------------------------------------

    if (IS_MOCK_MODE) {
      const users = this.getAllUsers();

      // Check duplicate email
      const existingEmail = users.find(
        user =>
          user.email.toLowerCase() ===
          data.email.trim().toLowerCase()
      );

      if (existingEmail) {
        throw new Error(
          'An account with this email already exists.'
        );
      }

      // Check duplicate username
      const existingUsername = users.find(
        user =>
          (user.username &&
            user.username.toLowerCase() ===
            data.username.trim().toLowerCase()) ||
          user.email.toLowerCase() ===
          data.username.trim().toLowerCase()
      );

      if (existingUsername) {
        throw new Error(
          'This username is already taken.'
        );
      }

      // Check password confirmation
      if (
        data.password !==
        data.confirmPassword
      ) {
        throw new Error(
          'Passwords do not match'
        );
      }

      /*
       * IMPORTANT:
       * Public registration should NOT allow
       * users to choose ADMIN / DOCTOR / etc.
       *
       * Mock registration therefore creates
       * an inactive pending user.
       */

      const newUser: User = {
        id: `usr-${Date.now().toString(36)}`,

        name:
          `${data.firstName.trim()} ${data.lastName.trim()}`,

        email: data.email.trim(),

        username: data.username.trim(),

        // Temporary role in mock mode.
        // Real backend/admin approval will assign
        // the actual hospital role.
        role: 'RECEPTIONIST' as UserRole,

        department: 'General',

        phone: data.phone?.trim() || undefined,

        status: 'Inactive',

        lastLogin: '',

        createdAt:
          new Date()
            .toISOString()
            .split('T')[0],
      };

      setStoredItem(
        USERS_KEY,
        [newUser, ...users]
      );

      auditService.log({
        userId: 'PUBLIC_REGISTRATION',
        userName: newUser.name,
        userRole: 'RECEPTIONIST' as UserRole,
        action: 'CREATE',
        module: 'AUTH',
        recordIdentifier: newUser.email,
        details:
          'User registration submitted (mock mode). Account pending administrator approval.',
        status: 'SUCCESS'
      });

      return {
        success: true,

        message:
          'Registration successful. Your account is pending administrator approval. You will be able to sign in after your account has been approved.',

        user: newUser,

        data: {
          user: newUser,
          accountStatus: 'PENDING',
          isActive: false,
        },
      };
    }


    // -------------------------------------------------------
    // REAL BACKEND API
    // -------------------------------------------------------

    const response =
      await apiClient.post<any>(
        '/api/v1/auth/register',
        {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          username: data.username.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || undefined,
          password: data.password,
          confirmPassword:
            data.confirmPassword,
        }
      );

    auditService.log({
      userId: 'PUBLIC_REGISTRATION',
      userName:
        `${data.firstName.trim()} ${data.lastName.trim()}`,
      userRole:
        'RECEPTIONIST' as UserRole,
      action: 'CREATE',
      module: 'AUTH',
      recordIdentifier: data.email.trim(),
      details:
        'New user registration submitted through API. Account pending administrator approval.',
      status: 'SUCCESS'
    });

    const message =
      response?.message ||
      'Registration successful. Your account is pending administrator approval. You will be able to sign in after your account has been approved.';

    return {
      success: response?.success ?? true,
      message,
      user: response?.user || response?.data?.user,
      data:
        response?.data ||
        (response?.user
          ? { user: response.user, accountStatus: 'PENDING', isActive: false }
          : response),
    };
  },


  // ===========================================================================
  // LOGIN
  // ===========================================================================

  async loginAsync(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<{
    user: User;
    token: string;
  }> {

    // -------------------------------------------------------
    // MOCK MODE
    // -------------------------------------------------------

    if (IS_MOCK_MODE) {
      return this.login(
        email,
        password,
        rememberMe
      );
    }


    // -------------------------------------------------------
    // REAL API MODE
    // -------------------------------------------------------

    const data =
      await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }>(
        '/api/v1/auth/login',
        {
          email,
          password
        }
      );
    console.log('[LOGIN DEBUG] data:', data);
    console.log('[LOGIN DEBUG] accessToken exists:', !!data.accessToken);
    console.log('[LOGIN DEBUG] refreshToken exists:', !!data.refreshToken);
    console.log('[LOGIN DEBUG] rememberMe:', rememberMe);

    // Store JWT tokens
    setTokens(
      data.accessToken,
      data.refreshToken,
      rememberMe
    );


    // Convert backend user
    // into frontend User type
    const user =
      mapApiUser(data.user);


    // Save current user
    setStoredItem(
      CURRENT_USER_KEY,
      user
    );


    // Audit
    auditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      module: 'AUTH',
      recordIdentifier:
        `SESSION-${user.role}`,
      details:
        `User authenticated via API (${rememberMe ? 'Persistent' : 'Session'})`,
      status: 'SUCCESS'
    });


    return {
      user,
      token: data.accessToken
    };
  },


  // ===========================================================================
  // MOCK LOGIN
  // ===========================================================================

  login(
    email: string,
    _password?: string,
    rememberMe: boolean = false
  ): {
    user: User;
    token: string;
  } {

    const users =
      this.getAllUsers();


    let matchedUser =
      users.find(
        u =>
          u.email.toLowerCase() ===
          email.toLowerCase()
      );


    if (!matchedUser) {

      const demo =
        DEMO_ACCOUNTS.find(
          d =>
            d.email.toLowerCase() ===
            email.toLowerCase()
        );


      if (demo) {

        matchedUser = {
          id:
            `usr-${demo.role.toLowerCase()}-auto`,

          name: demo.name,

          email: demo.email,

          role: demo.role,

          department:
            demo.department,

          status: 'Active',

          lastLogin:
            new Date()
              .toISOString()
              .replace('T', ' ')
              .substring(0, 16),

          createdAt: '2024-01-01'
        };

      } else {

        throw new Error(
          'Invalid email or password. Please select a valid MediCore account.'
        );
      }
    }

    if (matchedUser.status === 'Inactive') {
      throw new Error(
        'Your account is pending administrator approval. Please wait for an administrator to activate your account.'
      );
    }

    const mockToken =
      `medicore_jwt_${matchedUser.role.toLowerCase()}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;


    matchedUser.lastLogin =
      new Date()
        .toISOString()
        .replace('T', ' ')
        .substring(0, 16);


    const updatedUsers =
      users.map(
        u =>
          u.id === matchedUser!.id
            ? matchedUser!
            : u
      );


    setStoredItem(
      USERS_KEY,
      updatedUsers
    );


    setStoredItem(
      CURRENT_USER_KEY,
      matchedUser
    );


    if (rememberMe) {

      localStorage.setItem(
        TOKEN_KEY,
        mockToken
      );

    } else {

      sessionStorage.setItem(
        TOKEN_KEY,
        mockToken
      );
    }


    auditService.log({
      userId: matchedUser.id,
      userName: matchedUser.name,
      userRole: matchedUser.role,
      action: 'LOGIN',
      module: 'AUTH',
      recordIdentifier:
        `SESSION-${matchedUser.role}`,
      details:
        `User authenticated (mock mode, ${rememberMe ? 'Persistent 30-day session' : 'Session storage'})`,
      status: 'SUCCESS'
    });


    return {
      user: matchedUser,
      token: mockToken
    };
  },


  // ===========================================================================
  // LOGOUT
  // ===========================================================================

  async logoutAsync(): Promise<void> {

    if (!IS_MOCK_MODE) {

      try {

        await apiClient.post(
          '/api/v1/auth/logout'
        );

      } catch {

        // Best effort.
        // Local authentication state is
        // cleared even if API logout fails.
      }
    }

    this.logout();
  },


  logout(): void {

    const user =
      this.getCurrentUser();


    if (user) {

      auditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'LOGOUT',
        module: 'AUTH',
        recordIdentifier:
          'SESSION-CLOSE',
        details:
          'User logged out securely',
        status: 'SUCCESS'
      });
    }


    clearTokens();

    localStorage.removeItem(
      CURRENT_USER_KEY
    );

    localStorage.removeItem(
      TOKEN_KEY
    );

    sessionStorage.removeItem(
      TOKEN_KEY
    );
  },


  // ===========================================================================
  // SWITCH ROLE - MOCK ONLY
  // ===========================================================================

  switchRole(
    role: UserRole
  ): User {

    const demo =
      DEMO_ACCOUNTS.find(
        d => d.role === role
      );

    const users =
      this.getAllUsers();


    const target =
      users.find(
        u => u.role === role
      ) || {

        id:
          `usr-${role.toLowerCase()}-switched`,

        name:
          demo?.name ||
          `Staff ${role}`,

        email:
          demo?.email ||
          `${role.toLowerCase()}@medicore.hospital`,

        role,

        department:
          demo?.department ||
          'General',

        status: 'Active',

        lastLogin:
          new Date()
            .toISOString()
            .replace('T', ' ')
            .substring(0, 16),

        createdAt: '2024-01-01'
      };


    setStoredItem(
      CURRENT_USER_KEY,
      target
    );


    return target;
  },


  // ===========================================================================
  // CREATE USER - MOCK / ADMIN
  // ===========================================================================

  createUser(
    user: Omit<User, 'id' | 'createdAt'>
  ): User {

    const users =
      this.getAllUsers();


    const newUser: User = {

      ...user,

      id:
        `usr-${Date.now().toString(36)}`,

      createdAt:
        new Date()
          .toISOString()
          .split('T')[0]
    };


    const updated =
      [
        newUser,
        ...users
      ];


    setStoredItem(
      USERS_KEY,
      updated
    );


    auditService.log({
      userId: 'admin',
      userName: 'Administrator',
      userRole: 'ADMIN',
      action: 'CREATE',
      module: 'SETTINGS',
      recordIdentifier:
        newUser.email,
      details:
        `Created new user ${newUser.name} with role ${newUser.role}`,
      status: 'SUCCESS'
    });


    return newUser;
  },


  // ===========================================================================
  // UPDATE USER - MOCK
  // ===========================================================================

  updateUser(
    id: string,
    updates: Partial<User>
  ): User {

    const users =
      this.getAllUsers();


    let updatedUser:
      User | null = null;


    const next =
      users.map(u => {

        if (u.id === id) {

          updatedUser = {
            ...u,
            ...updates
          };

          return updatedUser;
        }

        return u;
      });


    setStoredItem(
      USERS_KEY,
      next
    );


    return updatedUser!;
  }
}
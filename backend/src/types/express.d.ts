import { UserRoleCode } from '../constants/roles';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRoleCode;
  roleId: string | null;
  departmentId?: string | null;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      token?: string;
    }
  }
}

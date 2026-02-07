import dotenv from 'dotenv';

dotenv.config();

export const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  saltRounds: 12,
};

export const ROLES = {
  EMPLOYEE: 'employee',
  HR_ADMIN: 'hr_admin',
  MANAGER: 'manager',
  SUPER_ADMIN: 'super_admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.EMPLOYEE]: 1,
  [ROLES.MANAGER]: 2,
  [ROLES.HR_ADMIN]: 3,
  [ROLES.SUPER_ADMIN]: 4,
};

export default AUTH_CONFIG;

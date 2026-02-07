import { Role } from '../config/auth.js';

export interface Employee {
  id: string;
  employee_id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: Role;
  department: string;
  job_title: string;
  hire_date: Date;
  employment_status: EmploymentStatus;
  manager_id: string | null;
  location: string;
  jurisdiction: Jurisdiction;
  salary: number;
  salary_currency: string;
  profile_data: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}

export type EmploymentStatus = 'active' | 'inactive' | 'terminated' | 'on_leave';

export type Jurisdiction = 'MY' | 'SG' | 'UK' | 'US';

export interface CreateEmployeeDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: Role;
  department: string;
  job_title: string;
  hire_date: string;
  location: string;
  jurisdiction: Jurisdiction;
  salary: number;
  salary_currency: string;
  manager_id?: string;
}

export interface UpdateEmployeeDto {
  first_name?: string;
  last_name?: string;
  department?: string;
  job_title?: string;
  location?: string;
  employment_status?: EmploymentStatus;
  manager_id?: string | null;
  profile_data?: Record<string, unknown>;
}

export interface EmployeePublic {
  id: string;
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  department: string;
  job_title: string;
  hire_date: Date;
  employment_status: EmploymentStatus;
  location: string;
  jurisdiction: Jurisdiction;
}

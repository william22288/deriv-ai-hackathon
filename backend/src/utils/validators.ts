import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  department: z.string().min(1, 'Department is required'),
  job_title: z.string().min(1, 'Job title is required'),
  jurisdiction: z.enum(['MY', 'SG', 'UK', 'US']),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

// Employee schemas
export const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  role: z.enum(['employee', 'hr_admin', 'manager', 'super_admin']).optional(),
  department: z.string().min(1),
  job_title: z.string().min(1),
  hire_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  location: z.string().min(1),
  jurisdiction: z.enum(['MY', 'SG', 'UK', 'US']),
  salary: z.number().positive(),
  salary_currency: z.string().length(3),
  manager_id: z.string().uuid().optional(),
});

export const updateEmployeeSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  department: z.string().min(1).optional(),
  job_title: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  employment_status: z.enum(['active', 'inactive', 'terminated', 'on_leave']).optional(),
  manager_id: z.string().uuid().nullable().optional(),
  profile_data: z.record(z.unknown()).optional(),
});

// Contract schemas
export const generateContractSchema = z.object({
  employee_id: z.string().uuid(),
  template_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  contract_data: z.record(z.unknown()),
});

// Chat schemas
export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
});

// Policy schemas
export const createPolicySchema = z.object({
  category: z.enum(['leave', 'expense', 'promotion', 'benefits', 'code_of_conduct', 'remote_work', 'other']),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  jurisdiction: z.enum(['MY', 'SG', 'UK', 'US']).optional(),
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const searchPolicySchema = z.object({
  query: z.string().min(1).max(500),
  jurisdiction: z.enum(['MY', 'SG', 'UK', 'US']).optional(),
  category: z.enum(['leave', 'expense', 'promotion', 'benefits', 'code_of_conduct', 'remote_work', 'other']).optional(),
  limit: z.number().int().min(1).max(20).optional().default(5),
});

// Request schemas
export const createRequestSchema = z.object({
  request_type: z.enum(['address_update', 'dependent_change', 'leave_request', 'expense_claim', 'bank_details_update', 'emergency_contact_update', 'document_request', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
  data: z.record(z.unknown()),
});

// Compliance schemas
export const createComplianceItemSchema = z.object({
  employee_id: z.string().uuid(),
  item_type: z.enum(['work_permit', 'visa', 'certification', 'mandatory_training', 'license', 'background_check']),
  name: z.string().min(1),
  issuer: z.string().optional(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  jurisdiction: z.enum(['MY', 'SG', 'UK', 'US']),
  document_path: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// UUID param schema
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const jurisdictionParamSchema = z.object({
  jurisdiction: z.enum(['MY', 'SG', 'UK', 'US']),
});

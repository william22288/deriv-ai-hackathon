import { Jurisdiction } from './employee.types.js';

export interface ComplianceItem {
  id: string;
  employee_id: string;
  item_type: ComplianceItemType;
  name: string;
  issuer: string | null;
  issue_date: Date;
  expiration_date: Date | null;
  status: ComplianceStatus;
  jurisdiction: Jurisdiction;
  document_path: string | null;
  metadata: Record<string, unknown>;
  reminder_sent: boolean;
  last_reminder_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type ComplianceItemType = 
  | 'work_permit'
  | 'visa'
  | 'certification'
  | 'mandatory_training'
  | 'license'
  | 'background_check';

export type ComplianceStatus = 
  | 'valid'
  | 'expiring_soon'
  | 'expired'
  | 'pending_renewal'
  | 'not_required';

export interface CreateComplianceItemDto {
  employee_id: string;
  item_type: ComplianceItemType;
  name: string;
  issuer?: string;
  issue_date: string;
  expiration_date?: string;
  jurisdiction: Jurisdiction;
  document_path?: string;
  metadata?: Record<string, unknown>;
}

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  category: string;
  is_mandatory: boolean;
  target_roles: string[];
  frequency: TrainingFrequency;
  duration_hours: number;
  provider: string | null;
  created_at: Date;
  updated_at: Date;
}

export type TrainingFrequency = 'once' | 'annual' | 'biannual' | 'quarterly';

export interface EmployeeTraining {
  id: string;
  employee_id: string;
  training_program_id: string;
  status: TrainingStatus;
  assigned_date: Date;
  due_date: Date;
  completed_date: Date | null;
  score: number | null;
  certificate_path: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export type TrainingStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';

export interface ComplianceDashboard {
  total_items: number;
  valid: number;
  expiring_soon: number;
  expired: number;
  pending_renewal: number;
  by_type: Record<ComplianceItemType, number>;
  by_jurisdiction: Record<Jurisdiction, number>;
  upcoming_expirations: ComplianceItem[];
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string;
  changes: AuditChanges;
  ip_address: string;
  user_agent: string;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export interface AuditChanges {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  employee_id: string;
  type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  read_at: Date | null;
}

export type NotificationPriority = 'low' | 'normal' | 'high';

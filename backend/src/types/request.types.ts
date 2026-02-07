export interface EmployeeRequest {
  id: string;
  employee_id: string;
  request_type: RequestType;
  status: RequestStatus;
  priority: RequestPriority;
  data: RequestData;
  chat_session_id: string | null;
  assigned_to: string | null;
  submitted_at: Date;
  reviewed_at: Date | null;
  completed_at: Date | null;
  reviewer_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export type RequestType = 
  | 'address_update'
  | 'dependent_change'
  | 'leave_request'
  | 'expense_claim'
  | 'bank_details_update'
  | 'emergency_contact_update'
  | 'document_request'
  | 'other';

export type RequestStatus = 
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'completed';

export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface RequestData {
  description?: string;
  [key: string]: unknown;
}

export interface CreateRequestDto {
  request_type: RequestType;
  priority?: RequestPriority;
  data: RequestData;
}

export interface UpdateRequestDto {
  status?: RequestStatus;
  priority?: RequestPriority;
  assigned_to?: string;
  reviewer_notes?: string;
}

export interface WorkflowRule {
  id: string;
  request_type: RequestType;
  conditions: WorkflowConditions;
  routing_logic: RoutingLogic;
  auto_approve_threshold: AutoApproveThreshold | null;
  priority: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WorkflowConditions {
  department?: string[];
  role?: string[];
  amount_threshold?: number;
  [key: string]: unknown;
}

export interface RoutingLogic {
  approver_role?: string;
  approver_id?: string;
  escalation_after_hours?: number;
  [key: string]: unknown;
}

export interface AutoApproveThreshold {
  enabled: boolean;
  max_amount?: number;
  conditions?: Record<string, unknown>;
}

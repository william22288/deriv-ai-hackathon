import { Jurisdiction } from './employee.types.js';

export interface LabourLaw {
  id: string;
  jurisdiction: Jurisdiction;
  category: LawCategory;
  law_name: string;
  description: string;
  effective_date: Date;
  source_url: string | null;
  structured_data: LabourLawData;
  created_at: Date;
  updated_at: Date;
}

export type LawCategory = 
  | 'leave'
  | 'wages'
  | 'contributions'
  | 'working_hours'
  | 'termination'
  | 'benefits'
  | 'compliance';

export interface LabourLawData {
  [key: string]: unknown;
}

export interface LeaveEntitlement {
  type: string;
  days: number | string;
  conditions?: string;
  paid: boolean;
}

export interface ContributionRate {
  name: string;
  employee_rate: number | string;
  employer_rate: number | string;
  cap?: number;
  conditions?: string;
}

export interface MinimumWage {
  amount: number;
  currency: string;
  period: 'hourly' | 'daily' | 'monthly' | 'annual';
  conditions?: string;
  effective_date: string;
}

export interface Policy {
  id: string;
  category: PolicyCategory;
  title: string;
  content: string;
  jurisdiction: Jurisdiction | null;
  effective_date: Date;
  version: number;
  status: PolicyStatus;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export type PolicyCategory = 
  | 'leave'
  | 'expense'
  | 'promotion'
  | 'benefits'
  | 'code_of_conduct'
  | 'remote_work'
  | 'other';

export type PolicyStatus = 'draft' | 'active' | 'archived';

export interface CreatePolicyDto {
  category: PolicyCategory;
  title: string;
  content: string;
  jurisdiction?: Jurisdiction;
  effective_date: string;
}

import { Jurisdiction } from './employee.types.js';

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  jurisdiction: Jurisdiction;
  language: string;
  version: number;
  content: string;
  metadata: ContractTemplateMetadata;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export type ContractType = 'employment_contract' | 'equity_grant' | 'nda' | 'amendment';

export interface ContractTemplateMetadata {
  required_fields: string[];
  optional_fields: string[];
  validation_rules: Record<string, unknown>;
}

export interface Contract {
  id: string;
  employee_id: string;
  template_id: string;
  type: ContractType;
  jurisdiction: Jurisdiction;
  version: number;
  status: ContractStatus;
  start_date: Date;
  end_date: Date | null;
  contract_data: ContractData;
  generated_content: string;
  file_path: string | null;
  signed_at: Date | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export type ContractStatus = 'draft' | 'pending_review' | 'active' | 'expired' | 'terminated';

export interface ContractData {
  employee_name: string;
  job_title: string;
  department: string;
  salary: number;
  salary_currency: string;
  start_date: string;
  probation_period?: number;
  notice_period?: number;
  benefits?: string[];
  custom_clauses?: string[];
  [key: string]: unknown;
}

export interface GenerateContractDto {
  employee_id: string;
  template_id: string;
  start_date: string;
  end_date?: string;
  contract_data: Partial<ContractData>;
}

export interface EquityGrant {
  id: string;
  employee_id: string;
  contract_id: string;
  grant_date: Date;
  grant_type: EquityGrantType;
  total_units: number;
  strike_price: number | null;
  vesting_schedule_id: string;
  expiration_date: Date | null;
  status: EquityStatus;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export type EquityGrantType = 'stock_options' | 'rsu' | 'espp';
export type EquityStatus = 'active' | 'vested' | 'exercised' | 'expired' | 'forfeited';

export interface VestingSchedule {
  id: string;
  name: string;
  description: string;
  schedule_type: VestingType;
  cliff_months: number;
  total_months: number;
  vesting_frequency: VestingFrequency;
  schedule_details: VestingDetails;
  created_at: Date;
}

export type VestingType = 'time_based' | 'milestone_based' | 'hybrid';
export type VestingFrequency = 'monthly' | 'quarterly' | 'annual';

export interface VestingDetails {
  milestones?: VestingMilestone[];
  acceleration_triggers?: string[];
  [key: string]: unknown;
}

export interface VestingMilestone {
  date?: string;
  percentage: number;
  description?: string;
}

export interface ContractVersion {
  id: string;
  contract_id: string;
  version_number: number;
  changes_summary: string;
  content_snapshot: string;
  created_by: string;
  created_at: Date;
}

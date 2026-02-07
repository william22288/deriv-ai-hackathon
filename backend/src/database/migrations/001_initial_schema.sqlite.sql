-- HR Platform Database Schema (SQLite)
-- Migration: 001_initial_schema.sqlite.sql

-- ============================================
-- CORE TABLES
-- ============================================

-- Employees table
CREATE TABLE employees (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    employee_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'hr_admin', 'manager', 'super_admin')),
    department TEXT NOT NULL,
    job_title TEXT NOT NULL,
    hire_date TEXT NOT NULL,
    employment_status TEXT NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated', 'on_leave')),
    manager_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
    location TEXT NOT NULL,
    jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('MY', 'SG', 'UK', 'US')),
    salary REAL,
    salary_currency TEXT DEFAULT 'USD',
    profile_data TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login TEXT
);

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_jurisdiction ON employees(jurisdiction);
CREATE INDEX idx_employees_employment_status ON employees(employment_status);

-- Labour Laws table
CREATE TABLE labour_laws (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('MY', 'SG', 'UK', 'US')),
    category TEXT NOT NULL CHECK (category IN ('leave', 'wages', 'contributions', 'working_hours', 'termination', 'benefits', 'compliance')),
    law_name TEXT NOT NULL,
    description TEXT NOT NULL,
    effective_date TEXT NOT NULL,
    source_url TEXT,
    structured_data TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_labour_laws_jurisdiction ON labour_laws(jurisdiction);
CREATE INDEX idx_labour_laws_category ON labour_laws(category);
CREATE INDEX idx_labour_laws_jurisdiction_category ON labour_laws(jurisdiction, category);

-- ============================================
-- PHASE 1: DOCUMENT GENERATION TABLES
-- ============================================

-- Contract Templates
CREATE TABLE contract_templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('employment_contract', 'equity_grant', 'nda', 'amendment')),
    jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('MY', 'SG', 'UK', 'US')),
    language TEXT DEFAULT 'en',
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    is_active INTEGER DEFAULT 1,
    created_by TEXT REFERENCES employees(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_contract_templates_type ON contract_templates(type);
CREATE INDEX idx_contract_templates_jurisdiction ON contract_templates(jurisdiction);
CREATE INDEX idx_contract_templates_active ON contract_templates(is_active);

-- Vesting Schedules
CREATE TABLE vesting_schedules (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('time_based', 'milestone_based', 'hybrid')),
    cliff_months INTEGER NOT NULL DEFAULT 12,
    total_months INTEGER NOT NULL DEFAULT 48,
    vesting_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (vesting_frequency IN ('monthly', 'quarterly', 'annual')),
    schedule_details TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
);

-- Contracts
CREATE TABLE contracts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    template_id TEXT REFERENCES contract_templates(id),
    type TEXT NOT NULL,
    jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('MY', 'SG', 'UK', 'US')),
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'expired', 'terminated')),
    start_date TEXT NOT NULL,
    end_date TEXT,
    contract_data TEXT NOT NULL DEFAULT '{}',
    generated_content TEXT,
    file_path TEXT,
    signed_at TEXT,
    created_by TEXT REFERENCES employees(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_contracts_employee_id ON contracts(employee_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_start_date ON contracts(start_date);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);

-- Contract Versions
CREATE TABLE contract_versions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    changes_summary TEXT,
    content_snapshot TEXT NOT NULL,
    created_by TEXT REFERENCES employees(id),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(contract_id, version_number)
);

CREATE INDEX idx_contract_versions_contract_id ON contract_versions(contract_id);

-- Equity Grants
CREATE TABLE equity_grants (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    contract_id TEXT REFERENCES contracts(id),
    grant_date TEXT NOT NULL,
    grant_type TEXT NOT NULL CHECK (grant_type IN ('stock_options', 'rsu', 'espp')),
    total_units INTEGER NOT NULL,
    strike_price REAL,
    vesting_schedule_id TEXT REFERENCES vesting_schedules(id),
    expiration_date TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'vested', 'exercised', 'expired', 'forfeited')),
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_equity_grants_employee_id ON equity_grants(employee_id);
CREATE INDEX idx_equity_grants_status ON equity_grants(status);

-- ============================================
-- PHASE 2: CHAT & POLICY TABLES
-- ============================================

-- Policies
CREATE TABLE policies (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    category TEXT NOT NULL CHECK (category IN ('leave', 'expense', 'promotion', 'benefits', 'code_of_conduct', 'remote_work', 'other')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    jurisdiction TEXT CHECK (jurisdiction IN ('MY', 'SG', 'UK', 'US')),
    effective_date TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
    embedding BLOB,
    metadata TEXT DEFAULT '{}',
    created_by TEXT REFERENCES employees(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_policies_category ON policies(category);
CREATE INDEX idx_policies_jurisdiction ON policies(jurisdiction);
CREATE INDEX idx_policies_status ON policies(status);

-- Chat Sessions
CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    started_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT,
    session_metadata TEXT DEFAULT '{}',
    total_messages INTEGER DEFAULT 0
);

CREATE INDEX idx_chat_sessions_employee_id ON chat_sessions(employee_id);

-- Chat Messages
CREATE TABLE chat_messages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    intent TEXT,
    confidence_score REAL,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Workflow Rules
CREATE TABLE workflow_rules (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    request_type TEXT NOT NULL,
    conditions TEXT DEFAULT '{}',
    routing_logic TEXT DEFAULT '{}',
    auto_approve_threshold TEXT,
    priority INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_workflow_rules_request_type ON workflow_rules(request_type);
CREATE INDEX idx_workflow_rules_active ON workflow_rules(is_active);

-- Employee Requests
CREATE TABLE employee_requests (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('address_update', 'dependent_change', 'leave_request', 'expense_claim', 'bank_details_update', 'emergency_contact_update', 'document_request', 'other')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'completed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    data TEXT NOT NULL DEFAULT '{}',
    chat_session_id TEXT REFERENCES chat_sessions(id),
    assigned_to TEXT REFERENCES employees(id),
    submitted_at TEXT DEFAULT (datetime('now')),
    reviewed_at TEXT,
    completed_at TEXT,
    reviewer_notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_employee_requests_employee_id ON employee_requests(employee_id);
CREATE INDEX idx_employee_requests_status ON employee_requests(status);
CREATE INDEX idx_employee_requests_type ON employee_requests(request_type);
CREATE INDEX idx_employee_requests_submitted_at ON employee_requests(submitted_at);

-- ============================================
-- PHASE 3: COMPLIANCE TABLES
-- ============================================

-- Compliance Items
CREATE TABLE compliance_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('work_permit', 'visa', 'certification', 'mandatory_training', 'license', 'background_check')),
    name TEXT NOT NULL,
    issuer TEXT,
    issue_date TEXT NOT NULL,
    expiration_date TEXT,
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expiring_soon', 'expired', 'pending_renewal', 'not_required')),
    jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('MY', 'SG', 'UK', 'US')),
    document_path TEXT,
    metadata TEXT DEFAULT '{}',
    reminder_sent INTEGER DEFAULT 0,
    last_reminder_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_compliance_items_employee_id ON compliance_items(employee_id);
CREATE INDEX idx_compliance_items_type ON compliance_items(item_type);
CREATE INDEX idx_compliance_items_expiration ON compliance_items(expiration_date);
CREATE INDEX idx_compliance_items_status ON compliance_items(status);
CREATE INDEX idx_compliance_items_jurisdiction ON compliance_items(jurisdiction);

-- Training Programs
CREATE TABLE training_programs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    is_mandatory INTEGER DEFAULT 0,
    target_roles TEXT DEFAULT '[]',
    frequency TEXT NOT NULL DEFAULT 'once' CHECK (frequency IN ('once', 'annual', 'biannual', 'quarterly')),
    duration_hours REAL,
    provider TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Employee Training
CREATE TABLE employee_training (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    training_program_id TEXT NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'overdue')),
    assigned_date TEXT NOT NULL DEFAULT (date('now')),
    due_date TEXT NOT NULL,
    completed_date TEXT,
    score REAL,
    certificate_path TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_employee_training_employee_id ON employee_training(employee_id);
CREATE INDEX idx_employee_training_program_id ON employee_training(training_program_id);
CREATE INDEX idx_employee_training_status ON employee_training(status);
CREATE INDEX idx_employee_training_due_date ON employee_training(due_date);

-- Audit Logs
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_id TEXT REFERENCES employees(id),
    changes TEXT DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Notifications
CREATE TABLE notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    read INTEGER DEFAULT 0,
    action_url TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    read_at TEXT
);

CREATE INDEX idx_notifications_employee_id ON notifications(employee_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    revoked INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_employee_id ON refresh_tokens(employee_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Compliance Reports
CREATE TABLE compliance_reports (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    report_type TEXT NOT NULL,
    jurisdiction TEXT CHECK (jurisdiction IN ('MY', 'SG', 'UK', 'US')),
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    generated_by TEXT REFERENCES employees(id),
    data TEXT NOT NULL DEFAULT '{}',
    file_path TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_employees_updated_at 
AFTER UPDATE ON employees 
FOR EACH ROW 
BEGIN
    UPDATE employees SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_labour_laws_updated_at 
AFTER UPDATE ON labour_laws 
FOR EACH ROW 
BEGIN
    UPDATE labour_laws SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_contract_templates_updated_at 
AFTER UPDATE ON contract_templates 
FOR EACH ROW 
BEGIN
    UPDATE contract_templates SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_contracts_updated_at 
AFTER UPDATE ON contracts 
FOR EACH ROW 
BEGIN
    UPDATE contracts SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_equity_grants_updated_at 
AFTER UPDATE ON equity_grants 
FOR EACH ROW 
BEGIN
    UPDATE equity_grants SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_policies_updated_at 
AFTER UPDATE ON policies 
FOR EACH ROW 
BEGIN
    UPDATE policies SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_workflow_rules_updated_at 
AFTER UPDATE ON workflow_rules 
FOR EACH ROW 
BEGIN
    UPDATE workflow_rules SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_employee_requests_updated_at 
AFTER UPDATE ON employee_requests 
FOR EACH ROW 
BEGIN
    UPDATE employee_requests SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_compliance_items_updated_at 
AFTER UPDATE ON compliance_items 
FOR EACH ROW 
BEGIN
    UPDATE compliance_items SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_training_programs_updated_at 
AFTER UPDATE ON training_programs 
FOR EACH ROW 
BEGIN
    UPDATE training_programs SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_employee_training_updated_at 
AFTER UPDATE ON employee_training 
FOR EACH ROW 
BEGIN
    UPDATE employee_training SET updated_at = datetime('now') WHERE id = NEW.id;
END;

"""
Data models for the HR platform
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

# Enums
class EmploymentType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERN = "intern"

class ContractStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    SIGNED = "signed"
    REJECTED = "rejected"

class ComplianceStatus(str, Enum):
    COMPLIANT = "compliant"
    AT_RISK = "at_risk"
    NON_COMPLIANT = "non_compliant"

class RequestPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Phase 1: Document Generation Models
class EmployeeData(BaseModel):
    """Employee data for contract generation"""
    employee_id: Optional[str] = None
    first_name: str
    last_name: str
    email: str
    position: str
    department: str
    employment_type: EmploymentType
    start_date: date
    salary: float
    currency: str = "USD"
    location: str
    jurisdiction: str
    manager_name: Optional[str] = None
    benefits: Optional[List[str]] = []
    additional_clauses: Optional[Dict[str, Any]] = {}

class ContractTemplate(BaseModel):
    """Contract template definition"""
    template_id: str
    name: str
    jurisdiction: str
    employment_type: EmploymentType
    language: str = "en"
    version: str = "1.0"

class ContractGenerationRequest(BaseModel):
    """Request to generate a contract"""
    employee_data: EmployeeData
    template_id: str
    require_approval: bool = True

class GeneratedContract(BaseModel):
    """Generated contract document"""
    contract_id: str
    employee_id: str
    template_id: str
    content: str
    status: ContractStatus
    created_at: datetime
    reviewed_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    metadata: Dict[str, Any] = {}

# Phase 2: HR Assistant Models
class ConversationMessage(BaseModel):
    """Message in a conversation"""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)

class ChatRequest(BaseModel):
    """Request to chat with HR assistant"""
    user_id: str
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = {}

class ChatResponse(BaseModel):
    """Response from HR assistant"""
    conversation_id: str
    message: str
    intent: Optional[str] = None
    suggested_actions: Optional[List[str]] = []
    requires_human_review: bool = False

class EmployeeUpdateRequest(BaseModel):
    """Request to update employee details"""
    employee_id: str
    updates: Dict[str, Any]
    requested_by: str
    reason: str

class HRRequest(BaseModel):
    """Generic HR request"""
    request_id: Optional[str] = None
    user_id: str
    request_type: str
    description: str
    priority: RequestPriority = RequestPriority.MEDIUM
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.now)
    assigned_to: Optional[str] = None

# Phase 3: Compliance Models
class ComplianceItem(BaseModel):
    """Compliance tracking item"""
    item_id: Optional[str] = None
    employee_id: str
    item_type: str  # "permit", "training", "certification", etc.
    name: str
    status: ComplianceStatus
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    jurisdiction: str
    details: Dict[str, Any] = {}

class ComplianceAlert(BaseModel):
    """Compliance alert/notification"""
    alert_id: Optional[str] = None
    employee_id: str
    item_id: str
    alert_type: str  # "expiring", "expired", "missing"
    severity: str  # "low", "medium", "high", "critical"
    message: str
    created_at: datetime = Field(default_factory=datetime.now)
    resolved: bool = False

class AuditReport(BaseModel):
    """Audit readiness report"""
    report_id: str
    generated_at: datetime
    jurisdiction: str
    total_employees: int
    compliant_count: int
    at_risk_count: int
    non_compliant_count: int
    items_summary: Dict[str, Any]
    recommendations: List[str]

class ComplianceCheckRequest(BaseModel):
    """Request for compliance check"""
    employee_id: Optional[str] = None
    jurisdiction: Optional[str] = None
    item_type: Optional[str] = None

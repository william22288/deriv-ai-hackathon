"""
Phase 3: Proactive Compliance Intelligence Service
Monitors permits, training, and ensures audit readiness
"""
from typing import Dict, List, Optional
from datetime import datetime, date, timedelta
import uuid

from src.models import (
    ComplianceItem, ComplianceAlert, AuditReport,
    ComplianceStatus, ComplianceCheckRequest
)
from src.services.genai_service import genai_service

class ComplianceService:
    """Proactive compliance monitoring and intelligence"""
    
    def __init__(self):
        self.compliance_items: Dict[str, ComplianceItem] = {}
        self.alerts: Dict[str, ComplianceAlert] = {}
        self.jurisdiction_requirements = self._load_jurisdiction_requirements()
    
    def _load_jurisdiction_requirements(self) -> Dict[str, Dict]:
        """Load compliance requirements by jurisdiction"""
        return {
            "United States": {
                "required_items": [
                    {"type": "i9_verification", "name": "I-9 Employment Verification", "renewal_period": None},
                    {"type": "tax_form", "name": "W-4 Tax Form", "renewal_period": None},
                    {"type": "safety_training", "name": "Workplace Safety Training", "renewal_period": 365},
                    {"type": "harassment_training", "name": "Anti-Harassment Training", "renewal_period": 365},
                ],
                "state_specific": {
                    "California": [
                        {"type": "ca_harassment_training", "name": "CA Sexual Harassment Prevention", "renewal_period": 730}
                    ]
                }
            },
            "United Kingdom": {
                "required_items": [
                    {"type": "right_to_work", "name": "Right to Work Check", "renewal_period": None},
                    {"type": "dbs_check", "name": "DBS Check (if applicable)", "renewal_period": 1095},
                    {"type": "gdpr_training", "name": "GDPR Training", "renewal_period": 365},
                    {"type": "health_safety", "name": "Health & Safety Training", "renewal_period": 365},
                ]
            },
            "Singapore": {
                "required_items": [
                    {"type": "work_permit", "name": "Employment Pass/Work Permit", "renewal_period": 730},
                    {"type": "cpf_registration", "name": "CPF Registration", "renewal_period": None},
                    {"type": "safety_training", "name": "Workplace Safety Training", "renewal_period": 365},
                ]
            },
            "European Union": {
                "required_items": [
                    {"type": "work_permit", "name": "EU Work Permit", "renewal_period": 1095},
                    {"type": "gdpr_training", "name": "GDPR Compliance Training", "renewal_period": 365},
                    {"type": "data_protection", "name": "Data Protection Certification", "renewal_period": 730},
                ]
            }
        }
    
    async def check_compliance(
        self,
        request: ComplianceCheckRequest
    ) -> Dict:
        """Check compliance status"""
        if request.employee_id:
            # Check specific employee
            return await self._check_employee_compliance(request.employee_id)
        elif request.jurisdiction:
            # Check jurisdiction-wide compliance
            return await self._check_jurisdiction_compliance(request.jurisdiction)
        else:
            # Check all compliance
            return await self._check_all_compliance()
    
    async def _check_employee_compliance(self, employee_id: str) -> Dict:
        """Check compliance for a specific employee"""
        employee_items = [
            item for item in self.compliance_items.values()
            if item.employee_id == employee_id
        ]
        
        compliant = sum(1 for item in employee_items if item.status == ComplianceStatus.COMPLIANT)
        at_risk = sum(1 for item in employee_items if item.status == ComplianceStatus.AT_RISK)
        non_compliant = sum(1 for item in employee_items if item.status == ComplianceStatus.NON_COMPLIANT)
        
        return {
            "employee_id": employee_id,
            "total_items": len(employee_items),
            "compliant": compliant,
            "at_risk": at_risk,
            "non_compliant": non_compliant,
            "items": [item.model_dump() for item in employee_items]
        }
    
    async def _check_jurisdiction_compliance(self, jurisdiction: str) -> Dict:
        """Check compliance for a jurisdiction"""
        jurisdiction_items = [
            item for item in self.compliance_items.values()
            if item.jurisdiction == jurisdiction
        ]
        
        employees = set(item.employee_id for item in jurisdiction_items)
        
        return {
            "jurisdiction": jurisdiction,
            "total_employees": len(employees),
            "total_items": len(jurisdiction_items),
            "compliant": sum(1 for item in jurisdiction_items if item.status == ComplianceStatus.COMPLIANT),
            "at_risk": sum(1 for item in jurisdiction_items if item.status == ComplianceStatus.AT_RISK),
            "non_compliant": sum(1 for item in jurisdiction_items if item.status == ComplianceStatus.NON_COMPLIANT)
        }
    
    async def _check_all_compliance(self) -> Dict:
        """Check overall compliance"""
        all_items = list(self.compliance_items.values())
        employees = set(item.employee_id for item in all_items)
        jurisdictions = set(item.jurisdiction for item in all_items)
        
        return {
            "total_employees": len(employees),
            "total_jurisdictions": len(jurisdictions),
            "total_items": len(all_items),
            "compliant": sum(1 for item in all_items if item.status == ComplianceStatus.COMPLIANT),
            "at_risk": sum(1 for item in all_items if item.status == ComplianceStatus.AT_RISK),
            "non_compliant": sum(1 for item in all_items if item.status == ComplianceStatus.NON_COMPLIANT)
        }
    
    async def add_compliance_item(
        self,
        employee_id: str,
        item_type: str,
        name: str,
        jurisdiction: str,
        issue_date: Optional[date] = None,
        expiry_date: Optional[date] = None,
        details: Optional[Dict] = None
    ) -> ComplianceItem:
        """Add a compliance tracking item"""
        item_id = str(uuid.uuid4())
        
        # Determine status based on expiry
        status = self._determine_status(expiry_date)
        
        item = ComplianceItem(
            item_id=item_id,
            employee_id=employee_id,
            item_type=item_type,
            name=name,
            status=status,
            issue_date=issue_date,
            expiry_date=expiry_date,
            jurisdiction=jurisdiction,
            details=details or {}
        )
        
        self.compliance_items[item_id] = item
        
        # Create alerts if needed
        await self._check_and_create_alerts(item)
        
        return item
    
    def _determine_status(self, expiry_date: Optional[date]) -> ComplianceStatus:
        """Determine compliance status based on expiry date"""
        if not expiry_date:
            return ComplianceStatus.COMPLIANT
        
        today = date.today()
        days_until_expiry = (expiry_date - today).days
        
        if days_until_expiry < 0:
            return ComplianceStatus.NON_COMPLIANT
        elif days_until_expiry < 30:
            return ComplianceStatus.AT_RISK
        else:
            return ComplianceStatus.COMPLIANT
    
    async def _check_and_create_alerts(self, item: ComplianceItem):
        """Check and create alerts for compliance items"""
        if item.status == ComplianceStatus.NON_COMPLIANT:
            await self._create_alert(
                item,
                alert_type="expired",
                severity="critical",
                message=f"{item.name} has expired for employee {item.employee_id}"
            )
        elif item.status == ComplianceStatus.AT_RISK:
            await self._create_alert(
                item,
                alert_type="expiring",
                severity="high",
                message=f"{item.name} is expiring soon for employee {item.employee_id}"
            )
    
    async def _create_alert(
        self,
        item: ComplianceItem,
        alert_type: str,
        severity: str,
        message: str
    ):
        """Create a compliance alert"""
        alert_id = str(uuid.uuid4())
        
        alert = ComplianceAlert(
            alert_id=alert_id,
            employee_id=item.employee_id,
            item_id=item.item_id,
            alert_type=alert_type,
            severity=severity,
            message=message,
            created_at=datetime.now(),
            resolved=False
        )
        
        self.alerts[alert_id] = alert
    
    async def monitor_compliance(self) -> List[ComplianceAlert]:
        """Proactively monitor all compliance items and generate alerts"""
        new_alerts = []
        
        for item in self.compliance_items.values():
            # Re-evaluate status
            old_status = item.status
            item.status = self._determine_status(item.expiry_date)
            
            # Create alerts for status changes
            if item.status != old_status:
                if item.status == ComplianceStatus.NON_COMPLIANT:
                    await self._create_alert(
                        item,
                        alert_type="expired",
                        severity="critical",
                        message=f"{item.name} has expired"
                    )
                    new_alerts.append(self.alerts[list(self.alerts.keys())[-1]])
                elif item.status == ComplianceStatus.AT_RISK:
                    await self._create_alert(
                        item,
                        alert_type="expiring",
                        severity="high",
                        message=f"{item.name} is expiring soon"
                    )
                    new_alerts.append(self.alerts[list(self.alerts.keys())[-1]])
        
        return new_alerts
    
    async def generate_audit_report(
        self,
        jurisdiction: Optional[str] = None
    ) -> AuditReport:
        """Generate comprehensive audit readiness report"""
        report_id = str(uuid.uuid4())
        
        # Filter items by jurisdiction if specified
        items = list(self.compliance_items.values())
        if jurisdiction:
            items = [item for item in items if item.jurisdiction == jurisdiction]
        
        # Calculate statistics
        employees = set(item.employee_id for item in items)
        compliant_count = sum(1 for item in items if item.status == ComplianceStatus.COMPLIANT)
        at_risk_count = sum(1 for item in items if item.status == ComplianceStatus.AT_RISK)
        non_compliant_count = sum(1 for item in items if item.status == ComplianceStatus.NON_COMPLIANT)
        
        # Summarize by type
        items_by_type = {}
        for item in items:
            if item.item_type not in items_by_type:
                items_by_type[item.item_type] = {
                    "total": 0,
                    "compliant": 0,
                    "at_risk": 0,
                    "non_compliant": 0
                }
            items_by_type[item.item_type]["total"] += 1
            items_by_type[item.item_type][item.status.value] += 1
        
        # Generate AI-powered recommendations
        compliance_data = {
            "total_items": len(items),
            "compliant": compliant_count,
            "at_risk": at_risk_count,
            "non_compliant": non_compliant_count,
            "by_type": items_by_type,
            "jurisdiction": jurisdiction or "All"
        }
        
        recommendations = await genai_service.generate_compliance_recommendations(
            compliance_data
        )
        
        report = AuditReport(
            report_id=report_id,
            generated_at=datetime.now(),
            jurisdiction=jurisdiction or "All Jurisdictions",
            total_employees=len(employees),
            compliant_count=compliant_count,
            at_risk_count=at_risk_count,
            non_compliant_count=non_compliant_count,
            items_summary=items_by_type,
            recommendations=recommendations
        )
        
        return report
    
    def get_alerts(
        self,
        employee_id: Optional[str] = None,
        unresolved_only: bool = True
    ) -> List[ComplianceAlert]:
        """Get compliance alerts"""
        alerts = list(self.alerts.values())
        
        if employee_id:
            alerts = [a for a in alerts if a.employee_id == employee_id]
        
        if unresolved_only:
            alerts = [a for a in alerts if not a.resolved]
        
        # Sort by severity and date
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        alerts.sort(key=lambda a: (severity_order.get(a.severity, 4), a.created_at), reverse=True)
        
        return alerts
    
    async def resolve_alert(self, alert_id: str) -> ComplianceAlert:
        """Resolve a compliance alert"""
        alert = self.alerts.get(alert_id)
        if not alert:
            raise ValueError(f"Alert {alert_id} not found")
        
        alert.resolved = True
        return alert
    
    def get_required_items_for_jurisdiction(
        self,
        jurisdiction: str
    ) -> List[Dict]:
        """Get required compliance items for a jurisdiction"""
        return self.jurisdiction_requirements.get(
            jurisdiction,
            {"required_items": []}
        ).get("required_items", [])

# Singleton instance
compliance_service = ComplianceService()

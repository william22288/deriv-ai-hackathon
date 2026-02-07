"""
API Router for Phase 3: Compliance Intelligence
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Optional, Dict
from datetime import date

from src.models import (
    ComplianceItem, ComplianceAlert, AuditReport,
    ComplianceCheckRequest
)
from src.services.compliance_service import compliance_service

router = APIRouter()

@router.post("/check")
async def check_compliance(request: ComplianceCheckRequest):
    """
    Check compliance status
    
    - **employee_id**: Optional employee ID to check specific employee
    - **jurisdiction**: Optional jurisdiction to check
    - **item_type**: Optional item type to filter
    """
    try:
        result = await compliance_service.check_compliance(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking compliance: {str(e)}"
        )

@router.post("/items", response_model=ComplianceItem)
async def add_compliance_item(
    employee_id: str,
    item_type: str,
    name: str,
    jurisdiction: str,
    issue_date: Optional[date] = None,
    expiry_date: Optional[date] = None,
    details: Optional[Dict] = None
):
    """
    Add a compliance tracking item
    
    - **employee_id**: Employee ID
    - **item_type**: Type of compliance item (permit, training, certification, etc.)
    - **name**: Name of the item
    - **jurisdiction**: Jurisdiction
    - **issue_date**: Optional issue date
    - **expiry_date**: Optional expiry date
    - **details**: Optional additional details
    """
    try:
        item = await compliance_service.add_compliance_item(
            employee_id, item_type, name, jurisdiction,
            issue_date, expiry_date, details
        )
        return item
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding compliance item: {str(e)}"
        )

@router.get("/alerts", response_model=List[ComplianceAlert])
async def get_compliance_alerts(
    employee_id: Optional[str] = None,
    unresolved_only: bool = True
):
    """
    Get compliance alerts
    
    - **employee_id**: Optional employee ID to filter alerts
    - **unresolved_only**: Whether to return only unresolved alerts (default: true)
    """
    return compliance_service.get_alerts(employee_id, unresolved_only)

@router.post("/alerts/{alert_id}/resolve")
async def resolve_compliance_alert(alert_id: str):
    """
    Resolve a compliance alert
    
    - **alert_id**: ID of alert to resolve
    """
    try:
        alert = await compliance_service.resolve_alert(alert_id)
        return {"alert_id": alert.alert_id, "resolved": True}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/monitor")
async def monitor_compliance():
    """
    Proactively monitor all compliance items and generate alerts
    """
    try:
        new_alerts = await compliance_service.monitor_compliance()
        return {
            "new_alerts": len(new_alerts),
            "alerts": [alert.model_dump() for alert in new_alerts]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error monitoring compliance: {str(e)}"
        )

@router.post("/audit-report", response_model=AuditReport)
async def generate_audit_report(jurisdiction: Optional[str] = None):
    """
    Generate comprehensive audit readiness report
    
    - **jurisdiction**: Optional jurisdiction to filter report
    """
    try:
        report = await compliance_service.generate_audit_report(jurisdiction)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating audit report: {str(e)}"
        )

@router.get("/requirements/{jurisdiction}")
async def get_jurisdiction_requirements(jurisdiction: str):
    """
    Get required compliance items for a jurisdiction
    
    - **jurisdiction**: Jurisdiction name (e.g., "United States", "United Kingdom")
    """
    requirements = compliance_service.get_required_items_for_jurisdiction(jurisdiction)
    return {
        "jurisdiction": jurisdiction,
        "required_items": requirements
    }

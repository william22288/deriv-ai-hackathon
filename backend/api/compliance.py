"""
API Routes for Phase 3: Compliance Intelligence
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from backend.services.compliance_monitor import ComplianceMonitor
from backend.models.database import get_db, ComplianceRecord, Employee, AuditLog

router = APIRouter()
compliance_monitor = ComplianceMonitor()

class ComplianceRecordRequest(BaseModel):
    employee_id: str
    compliance_type: str
    name: str
    issue_date: datetime
    expiry_date: datetime

class ComplianceReportRequest(BaseModel):
    report_type: str = "summary"
    employee_id: Optional[str] = None

@router.post("/records")
async def create_compliance_record(request: ComplianceRecordRequest, db: Session = Depends(get_db)):
    """Create a new compliance record"""
    
    # Verify employee exists
    employee = db.query(Employee).filter(Employee.employee_id == request.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Create record
    record = ComplianceRecord(
        employee_id=request.employee_id,
        compliance_type=request.compliance_type,
        name=request.name,
        issue_date=request.issue_date,
        expiry_date=request.expiry_date,
        status="active"
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    # Log action
    audit_log = AuditLog(
        action="compliance_record_created",
        user_id="system",
        entity_type="compliance",
        entity_id=str(record.id),
        details=f"Created {request.compliance_type} record for {request.employee_id}"
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "id": record.id,
        "employee_id": record.employee_id,
        "compliance_type": record.compliance_type,
        "name": record.name,
        "status": record.status,
        "expiry_date": record.expiry_date.isoformat()
    }

@router.get("/check")
async def check_compliance(db: Session = Depends(get_db)):
    """
    Check compliance status for all records
    Returns alerts for expiring or expired items
    """
    
    # Fetch all active compliance records
    records = db.query(ComplianceRecord).filter(
        ComplianceRecord.status.in_(["active", "expiring_soon"])
    ).all()
    
    # Convert to dict format
    record_dicts = [
        {
            "id": r.id,
            "employee_id": r.employee_id,
            "compliance_type": r.compliance_type,
            "name": r.name,
            "expiry_date": r.expiry_date,
            "status": r.status
        }
        for r in records
    ]
    
    # Check compliance
    result = compliance_monitor.check_compliance_status(record_dicts)
    
    # Update database status for records that changed
    for alert in result["alerts"]:
        if alert["severity"] == "critical":
            # Mark as expired
            record = db.query(ComplianceRecord).filter(
                ComplianceRecord.employee_id == alert["employee_id"],
                ComplianceRecord.name == alert["name"]
            ).first()
            if record and record.status != "expired":
                record.status = "expired"
        
        elif alert["severity"] == "warning":
            # Mark as expiring soon
            record = db.query(ComplianceRecord).filter(
                ComplianceRecord.employee_id == alert["employee_id"],
                ComplianceRecord.name == alert["name"]
            ).first()
            if record and record.status == "active":
                record.status = "expiring_soon"
    
    db.commit()
    
    # Send alerts if any
    if result["alerts"]:
        alert_result = compliance_monitor.send_alerts(result["alerts"])
        result["notifications"] = alert_result
    
    return result

@router.post("/report")
async def generate_compliance_report(request: ComplianceReportRequest, db: Session = Depends(get_db)):
    """
    Generate AI-powered compliance report
    """
    
    # Get compliance data
    query = db.query(ComplianceRecord)
    if request.employee_id:
        query = query.filter(ComplianceRecord.employee_id == request.employee_id)
    
    records = query.all()
    
    # Convert to dict format
    record_dicts = [
        {
            "id": r.id,
            "employee_id": r.employee_id,
            "compliance_type": r.compliance_type,
            "name": r.name,
            "expiry_date": r.expiry_date,
            "status": r.status
        }
        for r in records
    ]
    
    # Check current status
    compliance_status = compliance_monitor.check_compliance_status(record_dicts)
    
    # Generate report using GenAI
    result = compliance_monitor.generate_compliance_report(
        compliance_status,
        request.report_type
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail="Report generation failed")
    
    # Log action
    audit_log = AuditLog(
        action="compliance_report_generated",
        user_id="system",
        entity_type="report",
        entity_id=request.report_type,
        details=f"Generated {request.report_type} compliance report"
    )
    db.add(audit_log)
    db.commit()
    
    return result

@router.get("/predict-risks")
async def predict_compliance_risks(db: Session = Depends(get_db)):
    """
    Predict future compliance risks using GenAI
    """
    
    # Get historical data (last 12 months)
    cutoff_date = datetime.utcnow() - timedelta(days=365)
    records = db.query(ComplianceRecord).filter(
        ComplianceRecord.created_at >= cutoff_date
    ).all()
    
    historical_data = [
        {
            "employee_id": r.employee_id,
            "compliance_type": r.compliance_type,
            "issue_date": r.issue_date.isoformat(),
            "expiry_date": r.expiry_date.isoformat(),
            "status": r.status,
            "created_at": r.created_at.isoformat()
        }
        for r in records
    ]
    
    result = compliance_monitor.predict_compliance_risks(historical_data)
    
    return result

@router.get("/audit-trail/{entity_id}")
async def get_audit_trail(
    entity_id: str,
    entity_type: str = "employee",
    days: int = 90,
    db: Session = Depends(get_db)
):
    """
    Generate audit trail for an entity
    """
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get audit logs
    logs = db.query(AuditLog).filter(
        AuditLog.entity_type == entity_type,
        AuditLog.entity_id == entity_id,
        AuditLog.timestamp >= start_date,
        AuditLog.timestamp <= end_date
    ).order_by(AuditLog.timestamp.asc()).all()
    
    log_dicts = [
        {
            "action": log.action,
            "user_id": log.user_id,
            "details": log.details,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ]
    
    # Generate AI-powered audit trail
    result = compliance_monitor.generate_audit_trail(
        entity_type=entity_type,
        entity_id=entity_id,
        start_date=start_date,
        end_date=end_date,
        audit_logs=log_dicts
    )
    
    return result

@router.get("/dashboard")
async def get_compliance_dashboard(db: Session = Depends(get_db)):
    """
    Get compliance dashboard overview
    """
    
    # Get all records
    all_records = db.query(ComplianceRecord).all()
    
    # Statistics by type
    by_type = {}
    for record in all_records:
        comp_type = record.compliance_type
        if comp_type not in by_type:
            by_type[comp_type] = {"total": 0, "active": 0, "expiring_soon": 0, "expired": 0}
        
        by_type[comp_type]["total"] += 1
        by_type[comp_type][record.status] = by_type[comp_type].get(record.status, 0) + 1
    
    # Overall status
    record_dicts = [
        {
            "id": r.id,
            "employee_id": r.employee_id,
            "compliance_type": r.compliance_type,
            "name": r.name,
            "expiry_date": r.expiry_date,
            "status": r.status
        }
        for r in all_records
    ]
    
    overall_status = compliance_monitor.check_compliance_status(record_dicts)
    
    return {
        "overview": overall_status,
        "by_type": by_type,
        "total_employees_tracked": len(set(r.employee_id for r in all_records)),
        "last_updated": datetime.utcnow().isoformat()
    }

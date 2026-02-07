"""
Tests for Phase 3: Compliance Service
"""
import pytest
from datetime import date, timedelta

from src.models import ComplianceStatus, ComplianceCheckRequest
from src.services.compliance_service import compliance_service

@pytest.mark.asyncio
async def test_add_compliance_item_valid():
    """Test adding a valid compliance item"""
    item = await compliance_service.add_compliance_item(
        employee_id="EMP001",
        item_type="work_permit",
        name="Work Permit",
        jurisdiction="Singapore",
        issue_date=date.today(),
        expiry_date=date.today() + timedelta(days=365)
    )
    
    assert item.item_id is not None
    assert item.status == ComplianceStatus.COMPLIANT
    assert item.employee_id == "EMP001"

@pytest.mark.asyncio
async def test_add_compliance_item_expiring_soon():
    """Test adding a compliance item expiring soon"""
    item = await compliance_service.add_compliance_item(
        employee_id="EMP002",
        item_type="training",
        name="Safety Training",
        jurisdiction="United States",
        issue_date=date.today() - timedelta(days=335),
        expiry_date=date.today() + timedelta(days=20)
    )
    
    assert item.status == ComplianceStatus.AT_RISK

@pytest.mark.asyncio
async def test_add_compliance_item_expired():
    """Test adding an expired compliance item"""
    item = await compliance_service.add_compliance_item(
        employee_id="EMP003",
        item_type="certification",
        name="Professional Certification",
        jurisdiction="United Kingdom",
        issue_date=date.today() - timedelta(days=400),
        expiry_date=date.today() - timedelta(days=10)
    )
    
    assert item.status == ComplianceStatus.NON_COMPLIANT

@pytest.mark.asyncio
async def test_check_employee_compliance():
    """Test checking compliance for specific employee"""
    # Add some items first
    await compliance_service.add_compliance_item(
        employee_id="EMP004",
        item_type="permit",
        name="Work Permit",
        jurisdiction="Singapore",
        expiry_date=date.today() + timedelta(days=100)
    )
    
    request = ComplianceCheckRequest(employee_id="EMP004")
    result = await compliance_service.check_compliance(request)
    
    assert result["employee_id"] == "EMP004"
    assert result["total_items"] > 0

@pytest.mark.asyncio
async def test_check_jurisdiction_compliance():
    """Test checking compliance for jurisdiction"""
    request = ComplianceCheckRequest(jurisdiction="Singapore")
    result = await compliance_service.check_compliance(request)
    
    assert result["jurisdiction"] == "Singapore"
    assert "total_employees" in result

@pytest.mark.asyncio
async def test_monitor_compliance():
    """Test proactive compliance monitoring"""
    # Add an item that will expire soon
    await compliance_service.add_compliance_item(
        employee_id="EMP005",
        item_type="training",
        name="GDPR Training",
        jurisdiction="European Union",
        expiry_date=date.today() + timedelta(days=25)
    )
    
    alerts = await compliance_service.monitor_compliance()
    assert isinstance(alerts, list)

@pytest.mark.asyncio
async def test_get_alerts():
    """Test retrieving compliance alerts"""
    alerts = compliance_service.get_alerts(unresolved_only=True)
    assert isinstance(alerts, list)

@pytest.mark.asyncio
async def test_resolve_alert():
    """Test resolving an alert"""
    # Add item to generate alert
    item = await compliance_service.add_compliance_item(
        employee_id="EMP006",
        item_type="permit",
        name="Test Permit",
        jurisdiction="United States",
        expiry_date=date.today() + timedelta(days=15)
    )
    
    # Get alerts
    alerts = compliance_service.get_alerts(employee_id="EMP006")
    
    if alerts:
        alert_id = alerts[0].alert_id
        resolved_alert = await compliance_service.resolve_alert(alert_id)
        assert resolved_alert.resolved is True

@pytest.mark.asyncio
async def test_generate_audit_report():
    """Test generating audit report"""
    report = await compliance_service.generate_audit_report()
    
    assert report.report_id is not None
    assert report.generated_at is not None
    assert isinstance(report.recommendations, list)

@pytest.mark.asyncio
async def test_generate_audit_report_by_jurisdiction():
    """Test generating audit report for specific jurisdiction"""
    report = await compliance_service.generate_audit_report(
        jurisdiction="United States"
    )
    
    assert report.jurisdiction == "United States"

def test_get_jurisdiction_requirements():
    """Test getting jurisdiction requirements"""
    requirements = compliance_service.get_required_items_for_jurisdiction(
        "United States"
    )
    
    assert isinstance(requirements, list)
    assert len(requirements) > 0

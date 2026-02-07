"""
Integration tests for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from datetime import date

from main import app

client = TestClient(app)

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "features" in data
    assert len(data["features"]) == 3

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_contract_templates():
    """Test getting contract templates"""
    response = client.get("/api/documents/templates")
    assert response.status_code == 200
    templates = response.json()
    assert isinstance(templates, list)
    assert len(templates) > 0

def test_generate_contract_endpoint():
    """Test contract generation endpoint"""
    request_data = {
        "employee_data": {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "position": "Tester",
            "department": "QA",
            "employment_type": "full_time",
            "start_date": "2024-01-01",
            "salary": 80000.0,
            "currency": "USD",
            "location": "Test City",
            "jurisdiction": "United States"
        },
        "template_id": "us_full_time",
        "require_approval": True
    }
    
    response = client.post("/api/documents/generate", json=request_data)
    assert response.status_code == 200
    contract = response.json()
    assert "contract_id" in contract
    assert contract["status"] == "pending_review"

def test_chat_endpoint():
    """Test chat with HR assistant"""
    request_data = {
        "user_id": "TEST001",
        "message": "What are the company's working hours?"
    }
    
    response = client.post("/api/assistant/chat", json=request_data)
    assert response.status_code == 200
    chat_response = response.json()
    assert "conversation_id" in chat_response
    assert "message" in chat_response

def test_submit_hr_request_endpoint():
    """Test submitting HR request"""
    params = {
        "user_id": "TEST002",
        "request_type": "leave_request",
        "description": "Annual leave request",
        "priority": "medium"
    }
    
    response = client.post("/api/assistant/submit-request", params=params)
    assert response.status_code == 200
    request = response.json()
    assert "request_id" in request
    assert request["status"] == "pending"

def test_check_compliance_endpoint():
    """Test compliance check"""
    request_data = {}
    
    response = client.post("/api/compliance/check", json=request_data)
    assert response.status_code == 200
    result = response.json()
    assert "total_items" in result

def test_add_compliance_item_endpoint():
    """Test adding compliance item"""
    params = {
        "employee_id": "TEST_EMP",
        "item_type": "training",
        "name": "Test Training",
        "jurisdiction": "United States"
    }
    
    response = client.post("/api/compliance/items", params=params)
    assert response.status_code == 200
    item = response.json()
    assert "item_id" in item

def test_get_compliance_alerts_endpoint():
    """Test getting compliance alerts"""
    response = client.get("/api/compliance/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)

def test_generate_audit_report_endpoint():
    """Test generating audit report"""
    response = client.post("/api/compliance/audit-report")
    assert response.status_code == 200
    report = response.json()
    assert "report_id" in report
    assert "recommendations" in report

def test_get_jurisdiction_requirements_endpoint():
    """Test getting jurisdiction requirements"""
    response = client.get("/api/compliance/requirements/United States")
    assert response.status_code == 200
    result = response.json()
    assert "jurisdiction" in result
    assert "required_items" in result

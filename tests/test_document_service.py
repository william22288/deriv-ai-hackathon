"""
Tests for Phase 1: Document Generation Service
"""
import pytest
from datetime import date

from src.models import (
    EmployeeData, ContractGenerationRequest, EmploymentType, ContractStatus
)
from src.services.document_service import document_service

@pytest.mark.asyncio
async def test_generate_contract_basic():
    """Test basic contract generation"""
    employee_data = EmployeeData(
        employee_id="EMP001",
        first_name="John",
        last_name="Doe",
        email="john.doe@company.com",
        position="Software Engineer",
        department="Engineering",
        employment_type=EmploymentType.FULL_TIME,
        start_date=date(2024, 1, 15),
        salary=100000.0,
        currency="USD",
        location="San Francisco, CA",
        jurisdiction="United States"
    )
    
    request = ContractGenerationRequest(
        employee_data=employee_data,
        template_id="us_full_time",
        require_approval=True
    )
    
    contract = await document_service.generate_contract(request)
    
    assert contract.contract_id is not None
    assert contract.employee_id == "EMP001"
    assert contract.status == ContractStatus.PENDING_REVIEW
    assert "EMPLOYMENT CONTRACT" in contract.content
    assert "John Doe" in contract.content

@pytest.mark.asyncio
async def test_generate_contract_without_approval():
    """Test contract generation without requiring approval"""
    employee_data = EmployeeData(
        first_name="Jane",
        last_name="Smith",
        email="jane.smith@company.com",
        position="Product Manager",
        department="Product",
        employment_type=EmploymentType.FULL_TIME,
        start_date=date(2024, 2, 1),
        salary=120000.0,
        location="London",
        jurisdiction="United Kingdom"
    )
    
    request = ContractGenerationRequest(
        employee_data=employee_data,
        template_id="uk_full_time",
        require_approval=False
    )
    
    contract = await document_service.generate_contract(request)
    
    assert contract.status == ContractStatus.DRAFT

@pytest.mark.asyncio
async def test_contract_approval():
    """Test contract approval workflow"""
    employee_data = EmployeeData(
        first_name="Alice",
        last_name="Johnson",
        email="alice@company.com",
        position="Designer",
        department="Design",
        employment_type=EmploymentType.FULL_TIME,
        start_date=date(2024, 3, 1),
        salary=90000.0,
        location="Singapore",
        jurisdiction="Singapore"
    )
    
    request = ContractGenerationRequest(
        employee_data=employee_data,
        template_id="sg_full_time",
        require_approval=True
    )
    
    contract = await document_service.generate_contract(request)
    contract_id = contract.contract_id
    
    # Approve the contract
    approved_contract = await document_service.review_contract(
        contract_id=contract_id,
        reviewer_id="REV001",
        approved=True
    )
    
    assert approved_contract.status == ContractStatus.APPROVED
    assert approved_contract.reviewed_by == "REV001"

@pytest.mark.asyncio
async def test_contract_rejection():
    """Test contract rejection workflow"""
    employee_data = EmployeeData(
        first_name="Bob",
        last_name="Wilson",
        email="bob@company.com",
        position="Analyst",
        department="Finance",
        employment_type=EmploymentType.PART_TIME,
        start_date=date(2024, 4, 1),
        salary=60000.0,
        location="New York",
        jurisdiction="United States"
    )
    
    request = ContractGenerationRequest(
        employee_data=employee_data,
        template_id="us_full_time",
        require_approval=True
    )
    
    contract = await document_service.generate_contract(request)
    
    # Reject the contract
    rejected_contract = await document_service.review_contract(
        contract_id=contract.contract_id,
        reviewer_id="REV002",
        approved=False,
        comments="Salary information needs verification"
    )
    
    assert rejected_contract.status == ContractStatus.REJECTED
    assert "rejection_reason" in rejected_contract.metadata

def test_get_pending_approvals():
    """Test retrieving pending approvals"""
    approvals = document_service.get_pending_approvals()
    assert isinstance(approvals, list)

"""
API Router for Phase 1: Document Generation
"""
from fastapi import APIRouter, HTTPException, status
from typing import List

from src.models import (
    ContractGenerationRequest, GeneratedContract,
    ContractTemplate, EmploymentType
)
from src.services.document_service import document_service

router = APIRouter()

@router.post("/generate", response_model=GeneratedContract)
async def generate_contract(request: ContractGenerationRequest):
    """
    Generate an employment contract using AI
    
    - **employee_data**: Employee information for contract generation
    - **template_id**: Contract template to use (e.g., 'us_full_time', 'uk_full_time')
    - **require_approval**: Whether contract requires human approval before use
    """
    try:
        contract = await document_service.generate_contract(request)
        return contract
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating contract: {str(e)}"
        )

@router.get("/templates", response_model=List[ContractTemplate])
async def get_templates():
    """Get available contract templates"""
    templates = []
    for template_id, config in document_service.templates.items():
        template = ContractTemplate(
            template_id=template_id,
            name=template_id.replace("_", " ").title(),
            jurisdiction=config["jurisdiction"],
            employment_type=config["employment_type"]
        )
        templates.append(template)
    return templates

@router.get("/pending-approvals", response_model=List[GeneratedContract])
async def get_pending_approvals():
    """Get all contracts pending approval"""
    return document_service.get_pending_approvals()

@router.post("/review/{contract_id}")
async def review_contract(
    contract_id: str,
    reviewer_id: str,
    approved: bool,
    comments: str = None
):
    """
    Review and approve/reject a generated contract (Human Oversight)
    
    - **contract_id**: ID of contract to review
    - **reviewer_id**: ID of the reviewer
    - **approved**: Whether the contract is approved
    - **comments**: Optional comments for rejection
    """
    try:
        contract = await document_service.review_contract(
            contract_id,
            reviewer_id,
            approved,
            comments
        )
        return {
            "contract_id": contract.contract_id,
            "status": contract.status,
            "message": "Contract reviewed successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reviewing contract: {str(e)}"
        )

@router.get("/{contract_id}", response_model=GeneratedContract)
async def get_contract(contract_id: str):
    """Get a specific contract by ID"""
    contract = document_service.get_contract(contract_id)
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract {contract_id} not found"
        )
    return contract

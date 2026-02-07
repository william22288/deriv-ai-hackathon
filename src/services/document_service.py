"""
Phase 1: Intelligent Document Generation Service
Auto-creates localized contracts from structured data with human oversight
"""
from typing import Dict, List, Optional
from datetime import datetime
import uuid
import json
from jinja2 import Template

from src.models import (
    EmployeeData, ContractGenerationRequest, GeneratedContract,
    ContractStatus, EmploymentType
)
from src.services.genai_service import genai_service

class DocumentGenerationService:
    """Service for generating employment contracts and documents"""
    
    def __init__(self):
        self.pending_approvals: Dict[str, GeneratedContract] = {}
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, Dict]:
        """Load contract templates for different jurisdictions"""
        # In production, these would be in a database
        return {
            "us_full_time": {
                "jurisdiction": "United States",
                "employment_type": EmploymentType.FULL_TIME,
                "sections": [
                    "employment_terms",
                    "compensation",
                    "benefits",
                    "confidentiality",
                    "termination",
                    "jurisdiction_specific"
                ]
            },
            "uk_full_time": {
                "jurisdiction": "United Kingdom",
                "employment_type": EmploymentType.FULL_TIME,
                "sections": [
                    "employment_terms",
                    "compensation",
                    "benefits",
                    "data_protection",
                    "termination",
                    "jurisdiction_specific"
                ]
            },
            "sg_full_time": {
                "jurisdiction": "Singapore",
                "employment_type": EmploymentType.FULL_TIME,
                "sections": [
                    "employment_terms",
                    "compensation",
                    "benefits",
                    "confidentiality",
                    "termination",
                    "jurisdiction_specific"
                ]
            }
        }
    
    async def generate_contract(
        self,
        request: ContractGenerationRequest
    ) -> GeneratedContract:
        """Generate an employment contract with AI assistance"""
        contract_id = str(uuid.uuid4())
        employee_data = request.employee_data
        
        # Get template
        template_config = self.templates.get(request.template_id)
        if not template_config:
            template_config = self.templates.get("us_full_time")
        
        # Generate contract sections using AI
        contract_sections = {}
        for section in template_config["sections"]:
            section_content = await self._generate_section(
                section,
                employee_data,
                template_config["jurisdiction"]
            )
            contract_sections[section] = section_content
        
        # Assemble full contract
        contract_content = self._assemble_contract(
            employee_data,
            contract_sections,
            template_config["jurisdiction"]
        )
        
        # Create contract record
        contract = GeneratedContract(
            contract_id=contract_id,
            employee_id=employee_data.employee_id or str(uuid.uuid4()),
            template_id=request.template_id,
            content=contract_content,
            status=ContractStatus.PENDING_REVIEW if request.require_approval else ContractStatus.DRAFT,
            created_at=datetime.now(),
            metadata={
                "jurisdiction": template_config["jurisdiction"],
                "employment_type": employee_data.employment_type,
                "requires_approval": request.require_approval
            }
        )
        
        # Add to pending approvals if required
        if request.require_approval:
            self.pending_approvals[contract_id] = contract
        
        return contract
    
    async def _generate_section(
        self,
        section_type: str,
        employee_data: EmployeeData,
        jurisdiction: str
    ) -> str:
        """Generate a contract section using AI"""
        employee_dict = employee_data.model_dump()
        section_content = await genai_service.generate_contract_section(
            section_type,
            employee_dict,
            jurisdiction
        )
        return section_content
    
    def _assemble_contract(
        self,
        employee_data: EmployeeData,
        sections: Dict[str, str],
        jurisdiction: str
    ) -> str:
        """Assemble the full contract from sections"""
        contract_parts = [
            f"EMPLOYMENT CONTRACT",
            f"\n{'='*60}\n",
            f"This Employment Contract is entered into on {datetime.now().strftime('%B %d, %Y')}",
            f"between the Employer and {employee_data.first_name} {employee_data.last_name}.",
            f"\nJurisdiction: {jurisdiction}",
            f"Position: {employee_data.position}",
            f"Department: {employee_data.department}",
            f"Employment Type: {employee_data.employment_type.value.replace('_', ' ').title()}",
            f"\n{'='*60}\n"
        ]
        
        section_titles = {
            "employment_terms": "1. EMPLOYMENT TERMS",
            "compensation": "2. COMPENSATION",
            "benefits": "3. BENEFITS",
            "confidentiality": "4. CONFIDENTIALITY",
            "data_protection": "4. DATA PROTECTION",
            "termination": "5. TERMINATION",
            "jurisdiction_specific": "6. JURISDICTION-SPECIFIC PROVISIONS"
        }
        
        for section_key, content in sections.items():
            title = section_titles.get(section_key, section_key.upper())
            contract_parts.append(f"\n{title}\n")
            contract_parts.append(content)
            contract_parts.append("\n")
        
        contract_parts.append(f"\n{'='*60}\n")
        contract_parts.append("\nSIGNATURES\n")
        contract_parts.append(f"\nEmployee: {employee_data.first_name} {employee_data.last_name}")
        contract_parts.append(f"\nDate: _________________")
        contract_parts.append(f"\n\nEmployer Representative: _________________")
        contract_parts.append(f"\nDate: _________________")
        
        return "\n".join(contract_parts)
    
    async def review_contract(
        self,
        contract_id: str,
        reviewer_id: str,
        approved: bool,
        comments: Optional[str] = None
    ) -> GeneratedContract:
        """Human review and approval of contract"""
        contract = self.pending_approvals.get(contract_id)
        if not contract:
            raise ValueError(f"Contract {contract_id} not found in pending approvals")
        
        contract.reviewed_by = reviewer_id
        contract.approved_at = datetime.now()
        
        if approved:
            contract.status = ContractStatus.APPROVED
        else:
            contract.status = ContractStatus.REJECTED
            if comments:
                contract.metadata["rejection_reason"] = comments
        
        # Remove from pending approvals
        if contract_id in self.pending_approvals:
            del self.pending_approvals[contract_id]
        
        return contract
    
    def get_pending_approvals(self) -> List[GeneratedContract]:
        """Get all contracts pending approval"""
        return list(self.pending_approvals.values())
    
    def get_contract(self, contract_id: str) -> Optional[GeneratedContract]:
        """Get a contract by ID"""
        return self.pending_approvals.get(contract_id)

# Singleton instance
document_service = DocumentGenerationService()

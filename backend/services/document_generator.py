"""
Phase 1: Intelligent Document Generation Service
Uses GenAI to auto-create localized contracts from structured data
"""
import os
from openai import OpenAI
from datetime import datetime
from typing import Dict, Optional
import json

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))

class DocumentGenerator:
    """Service for generating HR documents using GenAI"""
    
    DOCUMENT_TEMPLATES = {
        "employment_contract": {
            "en-US": "US Employment Contract",
            "en-GB": "UK Employment Contract",
            "es-ES": "Spanish Employment Contract",
            "de-DE": "German Employment Contract",
        },
        "offer_letter": {
            "en-US": "US Offer Letter",
            "en-GB": "UK Offer Letter", 
        },
        "nda": {
            "en-US": "Non-Disclosure Agreement",
        }
    }
    
    def __init__(self):
        self.model = os.getenv("OPENAI_MODEL", "gpt-4")
    
    def generate_document(
        self, 
        document_type: str, 
        employee_data: Dict, 
        locale: str = "en-US",
        company_data: Optional[Dict] = None
    ) -> Dict:
        """
        Generate a localized document using GenAI
        
        Args:
            document_type: Type of document (employment_contract, offer_letter, nda)
            employee_data: Structured employee data
            locale: Locale for localization (en-US, es-ES, etc.)
            company_data: Optional company data
            
        Returns:
            Dictionary with generated content and metadata
        """
        
        # Validate document type and locale
        if document_type not in self.DOCUMENT_TEMPLATES:
            raise ValueError(f"Unknown document type: {document_type}")
        
        if locale not in self.DOCUMENT_TEMPLATES[document_type]:
            # Fallback to en-US if locale not supported
            locale = "en-US"
        
        # Build the prompt for GenAI
        prompt = self._build_prompt(document_type, employee_data, locale, company_data)
        
        # Generate document using OpenAI
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt(document_type, locale)
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # Lower temperature for more consistent legal documents
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            
            return {
                "success": True,
                "content": content,
                "document_type": document_type,
                "locale": locale,
                "generated_at": datetime.utcnow().isoformat(),
                "status": "pending_review",  # Requires human oversight
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "document_type": document_type,
                "locale": locale
            }
    
    def _get_system_prompt(self, document_type: str, locale: str) -> str:
        """Get system prompt for specific document type and locale"""
        
        base_prompt = """You are an expert HR legal document generator. 
Generate legally accurate, professional documents based on the provided information.
Include all necessary legal clauses and compliance requirements for the specified jurisdiction.
Use clear, professional language appropriate for official HR documents.
Mark any sections that require human review with [REVIEW REQUIRED] tags."""
        
        locale_instructions = {
            "en-US": "Follow US employment law standards and conventions.",
            "en-GB": "Follow UK employment law standards and conventions.",
            "es-ES": "Follow Spanish labor law standards. Generate document in Spanish.",
            "de-DE": "Follow German labor law standards. Generate document in German.",
        }
        
        return f"{base_prompt}\n\n{locale_instructions.get(locale, locale_instructions['en-US'])}"
    
    def _build_prompt(
        self, 
        document_type: str, 
        employee_data: Dict, 
        locale: str,
        company_data: Optional[Dict]
    ) -> str:
        """Build the user prompt with structured data"""
        
        company_info = company_data or {
            "name": "Deriv International Ltd",
            "address": "123 Business Street, London, UK",
            "registration": "12345678"
        }
        
        if document_type == "employment_contract":
            return f"""Generate an employment contract with the following details:

COMPANY INFORMATION:
- Company Name: {company_info.get('name')}
- Address: {company_info.get('address')}
- Registration: {company_info.get('registration')}

EMPLOYEE INFORMATION:
- Name: {employee_data.get('name')}
- Email: {employee_data.get('email')}
- Position: {employee_data.get('role')}
- Department: {employee_data.get('department')}
- Start Date: {employee_data.get('start_date')}
- Location: {employee_data.get('location')}
- Salary: {employee_data.get('salary', 'To be discussed')}

Include standard clauses for:
- Employment terms and conditions
- Compensation and benefits
- Working hours and leave
- Confidentiality and non-compete
- Termination conditions
- Dispute resolution

Locale: {locale}
"""
        
        elif document_type == "offer_letter":
            return f"""Generate an offer letter with the following details:

COMPANY: {company_info.get('name')}
CANDIDATE: {employee_data.get('name')}
POSITION: {employee_data.get('role')}
DEPARTMENT: {employee_data.get('department')}
START DATE: {employee_data.get('start_date')}
SALARY: {employee_data.get('salary', 'Competitive')}

Include:
- Warm welcome message
- Position details and reporting structure
- Compensation package overview
- Benefits summary
- Next steps and acceptance deadline

Locale: {locale}
"""
        
        elif document_type == "nda":
            return f"""Generate a Non-Disclosure Agreement for:

COMPANY: {company_info.get('name')}
EMPLOYEE: {employee_data.get('name')}
EFFECTIVE DATE: {datetime.utcnow().strftime('%Y-%m-%d')}

Include standard NDA clauses for:
- Definition of confidential information
- Obligations and restrictions
- Term and survival
- Remedies
- General provisions

Locale: {locale}
"""
        
        return ""
    
    def validate_legal_accuracy(self, content: str, document_type: str) -> Dict:
        """
        Use GenAI to perform basic legal accuracy validation
        This adds an additional layer before human review
        """
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a legal compliance checker. Review the document and identify:
1. Missing mandatory clauses
2. Potential legal issues or ambiguities
3. Compliance concerns
Provide a brief analysis."""
                    },
                    {
                        "role": "user",
                        "content": f"Review this {document_type}:\n\n{content}"
                    }
                ],
                temperature=0.2,
                max_tokens=500
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "validation_passed": "[CRITICAL ISSUE]" not in analysis.upper(),
                "analysis": analysis,
                "requires_human_review": True  # Always require human review
            }
            
        except Exception as e:
            return {
                "validation_passed": False,
                "analysis": f"Validation error: {str(e)}",
                "requires_human_review": True
            }

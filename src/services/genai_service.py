"""
GenAI service integration using OpenAI
"""
import os
from typing import List, Dict, Any, Optional
from openai import OpenAI

class GenAIService:
    """Service for GenAI operations using OpenAI"""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "test-key-for-demo")
        self.client = OpenAI(api_key=api_key) if api_key != "test-key-for-demo" else None
        self.model = os.getenv("OPENAI_MODEL", "gpt-4")
        self.mock_mode = api_key == "test-key-for-demo"
    
    async def generate_text(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """Generate text using OpenAI"""
        # Mock mode for testing/demo without API key
        if self.mock_mode:
            return self._generate_mock_response(prompt, system_prompt)
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            # Fallback for demo/testing without API key
            return f"[AI Response Generated - API Error: {str(e)}]"
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> str:
        """Multi-turn chat completion"""
        # Mock mode for testing/demo without API key
        if self.mock_mode:
            last_message = messages[-1]["content"] if messages else ""
            return self._generate_mock_response(last_message, "chat")
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[AI Response Generated - API Error: {str(e)}]"
    
    def _generate_mock_response(self, prompt: str, context: str = None) -> str:
        """Generate mock response for testing/demo"""
        prompt_lower = prompt.lower()
        
        # Contract section responses
        if "employment_terms" in prompt_lower or "employment terms" in prompt_lower:
            return """The Employee agrees to work in the capacity of the specified position, reporting to the designated manager. The employment is at-will, meaning either party may terminate the relationship at any time with appropriate notice. The Employee shall devote their full professional time and attention to the duties of their position."""
        
        if "compensation" in prompt_lower:
            return """The Employee will receive an annual salary as specified, payable in accordance with the company's standard payroll schedule. Compensation is subject to applicable tax withholdings and deductions. Salary reviews will be conducted annually based on performance."""
        
        if "benefits" in prompt_lower:
            return """The Employee is eligible for company benefits including health insurance, retirement plan contributions, paid time off, and other benefits as outlined in the company's benefits handbook. Benefits are subject to plan terms and conditions."""
        
        # HR policy responses
        if any(word in prompt_lower for word in ["leave", "vacation", "time off"]):
            return """Based on our company policy, full-time employees receive 15 days of paid annual leave per year. Leave requests should be submitted at least 2 weeks in advance through your manager. You can check your leave balance in the HR portal or contact the HR team for assistance."""
        
        if "sick" in prompt_lower:
            return """Our sick leave policy provides 10 days of paid sick leave per year. If you're unable to work due to illness, please notify your manager as soon as possible. Medical certificates are required for absences exceeding 3 consecutive days."""
        
        if any(word in prompt_lower for word in ["benefit", "insurance", "health"]):
            return """We offer comprehensive benefits including health insurance for you and your dependents, dental and vision coverage, 401(k) with employer match, life insurance, and professional development allowances. For specific details about your benefits, you can access the benefits portal or contact our benefits team."""
        
        if any(word in prompt_lower for word in ["remote", "work from home", "wfh"]):
            return """Our remote work policy allows eligible employees to work remotely up to 3 days per week. You'll need prior approval from your manager and must maintain core hours (10am-3pm in your local timezone). The company provides necessary equipment for remote work."""
        
        # Sensitive content
        if any(word in prompt_lower for word in ["harassment", "discrimination", "complaint"]):
            return """I understand this is a serious matter that requires immediate attention. I'm flagging this for urgent human review by our HR team. In the meantime, please know that we take all such concerns very seriously. If you need immediate assistance, you can also contact our Employee Relations team directly at hr-urgent@company.com or call the HR hotline."""
        
        # Default response
        return """Thank you for your question. I'm here to help with HR-related inquiries including policies, benefits, leave requests, and general information. For specific personal matters or complex situations, I'll connect you with an HR representative who can provide personalized assistance."""
    
    async def analyze_intent(self, user_message: str) -> Dict[str, Any]:
        """Analyze user intent from message"""
        # Mock mode for testing/demo
        if self.mock_mode:
            return self._analyze_intent_mock(user_message)
        
        system_prompt = """You are an HR assistant intent classifier. 
        Analyze the user message and return the intent and key entities.
        Possible intents: policy_question, leave_request, update_details, 
        benefits_inquiry, complaint, general_inquiry, contract_question, compliance_question
        
        Return in JSON format: {"intent": "intent_name", "entities": {...}}"""
        
        try:
            response = await self.generate_text(
                user_message,
                system_prompt=system_prompt,
                temperature=0.3
            )
            # In production, parse JSON response
            return {"intent": "general_inquiry", "entities": {}, "raw": response}
        except Exception:
            return {"intent": "general_inquiry", "entities": {}}
    
    def _analyze_intent_mock(self, message: str) -> Dict[str, Any]:
        """Mock intent analysis for testing"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["harassment", "discrimination", "complaint"]):
            return {"intent": "complaint", "entities": {}}
        if any(word in message_lower for word in ["leave", "vacation", "time off"]):
            return {"intent": "leave_request", "entities": {}}
        if any(word in message_lower for word in ["benefit", "insurance", "health"]):
            return {"intent": "benefits_inquiry", "entities": {}}
        if any(word in message_lower for word in ["policy", "rule", "procedure"]):
            return {"intent": "policy_question", "entities": {}}
        if any(word in message_lower for word in ["update", "change", "modify"]):
            return {"intent": "update_details", "entities": {}}
        
        return {"intent": "general_inquiry", "entities": {}}
    
    async def generate_contract_section(
        self,
        section_type: str,
        employee_data: Dict[str, Any],
        jurisdiction: str
    ) -> str:
        """Generate a specific contract section"""
        prompt = f"""Generate a {section_type} section for an employment contract.
        
        Employee Details:
        - Name: {employee_data.get('first_name')} {employee_data.get('last_name')}
        - Position: {employee_data.get('position')}
        - Department: {employee_data.get('department')}
        - Start Date: {employee_data.get('start_date')}
        - Jurisdiction: {jurisdiction}
        
        Generate professional, legally appropriate content for this section.
        """
        
        system_prompt = f"""You are a legal document expert specializing in employment contracts 
        for {jurisdiction}. Generate accurate, professional contract language."""
        
        return await self.generate_text(prompt, system_prompt=system_prompt)
    
    async def answer_policy_question(
        self,
        question: str,
        policy_context: str
    ) -> str:
        """Answer HR policy questions"""
        system_prompt = """You are an expert HR assistant. Answer questions about company 
        policies clearly and accurately. Always cite relevant policy sections. 
        If you're unsure, recommend contacting HR directly."""
        
        prompt = f"""Policy Context:\n{policy_context}\n\nQuestion: {question}\n\nAnswer:"""
        
        return await self.generate_text(prompt, system_prompt=system_prompt)
    
    async def generate_compliance_recommendations(
        self,
        compliance_data: Dict[str, Any]
    ) -> List[str]:
        """Generate compliance recommendations"""
        prompt = f"""Based on this compliance data, provide actionable recommendations:
        
        {compliance_data}
        
        Generate 3-5 specific recommendations to improve compliance."""
        
        system_prompt = """You are a compliance expert. Provide specific, actionable 
        recommendations based on compliance data."""
        
        response = await self.generate_text(prompt, system_prompt=system_prompt)
        
        # Parse recommendations (simplified for demo)
        recommendations = [line.strip() for line in response.split('\n') if line.strip() and not line.strip().startswith('#')]
        return recommendations[:5]

# Singleton instance
genai_service = GenAIService()

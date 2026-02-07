"""
GenAI service integration using OpenAI
"""
import os
from typing import List, Dict, Any, Optional
from openai import OpenAI

class GenAIService:
    """Service for GenAI operations using OpenAI"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = os.getenv("OPENAI_MODEL", "gpt-4")
    
    async def generate_text(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """Generate text using OpenAI"""
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
    
    async def analyze_intent(self, user_message: str) -> Dict[str, Any]:
        """Analyze user intent from message"""
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

"""
Phase 2: Conversational HR Assistant
AI-powered chatbot for answering questions, updating details, and routing requests
"""
import os
from typing import Dict, List, Optional
from datetime import datetime
import json

try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "sk-test"))
except Exception as e:
    # Fallback for testing without OpenAI
    client = None

class HRAssistant:
    """Conversational HR Assistant powered by GenAI"""
    
    def __init__(self):
        self.model = os.getenv("OPENAI_MODEL", "gpt-4")
        self.knowledge_base = self._load_knowledge_base()
    
    def _load_knowledge_base(self) -> Dict:
        """Load HR knowledge base for common queries"""
        return {
            "leave_policy": {
                "annual_leave": "Employees are entitled to 25 days of annual leave per year",
                "sick_leave": "10 days of sick leave with medical certificate",
                "parental_leave": "16 weeks of parental leave for primary caregiver"
            },
            "benefits": {
                "health_insurance": "Comprehensive health insurance for employee and dependents",
                "retirement": "401(k) with 5% company match",
                "learning": "Annual learning budget of $2000 per employee"
            },
            "procedures": {
                "update_details": "Contact HR to update personal details via the assistant",
                "payroll_query": "Payroll queries handled by finance department",
                "equipment_request": "Request equipment through IT service desk"
            }
        }
    
    def chat(
        self, 
        message: str, 
        user_id: str,
        session_id: str,
        chat_history: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Process user message and generate response
        
        Args:
            message: User's message
            user_id: User identifier
            session_id: Chat session identifier
            chat_history: Previous conversation history
            
        Returns:
            Dictionary with response and metadata
        """
        
        # Detect intent
        intent = self._detect_intent(message)
        
        # Build context-aware prompt
        system_prompt = self._get_system_prompt()
        
        # Prepare messages with history
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add relevant knowledge base context
        kb_context = self._get_relevant_knowledge(message)
        if kb_context:
            messages.append({
                "role": "system",
                "content": f"Relevant information from knowledge base:\n{kb_context}"
            })
        
        # Add chat history if available
        if chat_history:
            for hist in chat_history[-5:]:  # Last 5 messages for context
                messages.append({"role": "user", "content": hist.get("message", "")})
                messages.append({"role": "assistant", "content": hist.get("response", "")})
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        try:
            # Generate response using OpenAI
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            assistant_response = response.choices[0].message.content
            
            # Check if action is required
            action = self._extract_action(message, intent)
            
            return {
                "success": True,
                "response": assistant_response,
                "intent": intent,
                "action": action,
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "requires_followup": action is not None
            }
            
        except Exception as e:
            return {
                "success": False,
                "response": "I apologize, but I encountered an error. Please try again or contact HR directly.",
                "error": str(e),
                "intent": "error",
                "session_id": session_id
            }
    
    def _get_system_prompt(self) -> str:
        """Get system prompt for HR Assistant"""
        return """You are a helpful and professional HR Assistant for Deriv International.

Your role is to:
1. Answer employee questions about policies, benefits, and procedures
2. Help employees update their personal details
3. Route complex requests to appropriate departments
4. Provide clear, accurate, and friendly responses

Guidelines:
- Be professional but warm and approachable
- Provide specific, actionable information
- If you're unsure, admit it and offer to escalate to human HR
- Respect confidentiality and data privacy
- Always prioritize employee wellbeing

For sensitive topics (complaints, conflicts, termination), immediately escalate to human HR.
"""
    
    def _detect_intent(self, message: str) -> str:
        """Detect the intent of user message"""
        message_lower = message.lower()
        
        intents = {
            "leave_query": ["leave", "vacation", "time off", "pto", "holiday"],
            "benefits_query": ["benefit", "insurance", "401k", "retirement", "health"],
            "update_details": ["update", "change", "modify", "address", "phone", "email"],
            "payroll_query": ["payroll", "salary", "pay", "payslip", "paycheck"],
            "policy_query": ["policy", "procedure", "rule", "guideline"],
            "equipment_request": ["equipment", "laptop", "phone", "device"],
            "complaint": ["complaint", "harassment", "discrimination", "issue", "problem"],
            "general_query": []
        }
        
        for intent, keywords in intents.items():
            if any(keyword in message_lower for keyword in keywords):
                return intent
        
        return "general_query"
    
    def _get_relevant_knowledge(self, message: str) -> str:
        """Retrieve relevant information from knowledge base"""
        message_lower = message.lower()
        relevant_info = []
        
        # Search knowledge base
        if any(word in message_lower for word in ["leave", "vacation", "time off"]):
            relevant_info.append(json.dumps(self.knowledge_base["leave_policy"], indent=2))
        
        if any(word in message_lower for word in ["benefit", "insurance", "401k"]):
            relevant_info.append(json.dumps(self.knowledge_base["benefits"], indent=2))
        
        if any(word in message_lower for word in ["update", "change", "procedure"]):
            relevant_info.append(json.dumps(self.knowledge_base["procedures"], indent=2))
        
        return "\n\n".join(relevant_info) if relevant_info else ""
    
    def _extract_action(self, message: str, intent: str) -> Optional[Dict]:
        """Extract actionable items from message"""
        
        if intent == "update_details":
            return {
                "type": "update_employee_details",
                "requires_approval": True,
                "route_to": "hr_team"
            }
        
        elif intent == "equipment_request":
            return {
                "type": "equipment_request",
                "requires_approval": True,
                "route_to": "it_team"
            }
        
        elif intent == "complaint":
            return {
                "type": "escalation",
                "priority": "high",
                "requires_approval": False,
                "route_to": "hr_manager"
            }
        
        elif intent == "leave_query" and any(word in message.lower() for word in ["apply", "request", "book"]):
            return {
                "type": "leave_request",
                "requires_approval": True,
                "route_to": "manager"
            }
        
        return None
    
    def update_employee_details(
        self, 
        employee_id: str, 
        field: str, 
        new_value: str,
        requested_by: str
    ) -> Dict:
        """
        Process employee detail update request
        Includes human oversight requirement
        """
        
        allowed_fields = ["address", "phone", "emergency_contact", "email"]
        
        if field not in allowed_fields:
            return {
                "success": False,
                "message": f"Field '{field}' cannot be updated via assistant. Please contact HR directly."
            }
        
        # In real implementation, this would update the database after approval
        return {
            "success": True,
            "message": f"Update request for {field} has been submitted for approval.",
            "status": "pending_approval",
            "requires_human_review": True,
            "field": field,
            "new_value": new_value,
            "requested_by": requested_by,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def route_request(self, action: Dict, user_id: str, message: str) -> Dict:
        """Route request to appropriate department"""
        
        routing_map = {
            "hr_team": "hr@company.com",
            "it_team": "it-support@company.com",
            "manager": "manager-approval@company.com",
            "hr_manager": "hr-manager@company.com"
        }
        
        route_to = action.get("route_to", "hr_team")
        
        return {
            "routed": True,
            "department": route_to,
            "contact": routing_map.get(route_to, "hr@company.com"),
            "request_type": action.get("type"),
            "priority": action.get("priority", "normal"),
            "user_id": user_id,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }

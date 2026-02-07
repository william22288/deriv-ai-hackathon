"""
Phase 2: Conversational HR Assistant Service
Bot for answering questions, updating details, and routing requests
"""
from typing import Dict, List, Optional
from datetime import datetime
import uuid

from src.models import (
    ChatRequest, ChatResponse, ConversationMessage,
    EmployeeUpdateRequest, HRRequest, RequestPriority
)
from src.services.genai_service import genai_service

class HRAssistantService:
    """Conversational HR Assistant with GenAI"""
    
    def __init__(self):
        self.conversations: Dict[str, List[ConversationMessage]] = {}
        self.pending_requests: Dict[str, HRRequest] = {}
        self.knowledge_base = self._load_knowledge_base()
    
    def _load_knowledge_base(self) -> Dict[str, str]:
        """Load HR policy knowledge base"""
        # In production, this would be in a vector database
        return {
            "leave_policy": """
            Annual Leave Policy:
            - Full-time employees receive 15 days of paid annual leave per year
            - Part-time employees receive pro-rated leave based on hours worked
            - Leave requests must be submitted at least 2 weeks in advance
            - Maximum carry-over: 5 days to the next year
            - Leave approval is subject to manager discretion
            """,
            "sick_leave": """
            Sick Leave Policy:
            - Employees receive 10 days of paid sick leave per year
            - Medical certificate required for absences exceeding 3 consecutive days
            - Unused sick leave does not carry over
            - Notify manager as soon as possible on the first day of absence
            """,
            "benefits": """
            Employee Benefits:
            - Health Insurance: Comprehensive coverage for employee and dependents
            - Dental and Vision: Optional coverage available
            - Retirement Plan: 401(k) with 5% employer match
            - Life Insurance: 2x annual salary coverage
            - Professional Development: $2000 annual allowance
            - Wellness Program: Gym membership reimbursement
            """,
            "remote_work": """
            Remote Work Policy:
            - Eligible employees may work remotely up to 3 days per week
            - Must maintain core hours (10am-3pm in local timezone)
            - Required equipment provided by company
            - Must have reliable internet connection
            - Prior approval from manager required
            """,
            "performance_review": """
            Performance Review Process:
            - Annual performance reviews conducted in Q4
            - Mid-year check-ins in Q2
            - 360-degree feedback process
            - Reviews include goal setting for upcoming year
            - Performance ratings: Exceeds, Meets, Needs Improvement
            """,
        }
    
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Process chat message and generate response"""
        # Get or create conversation
        conversation_id = request.conversation_id or str(uuid.uuid4())
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        
        # Add user message to conversation
        user_message = ConversationMessage(
            role="user",
            content=request.message,
            timestamp=datetime.now()
        )
        self.conversations[conversation_id].append(user_message)
        
        # Analyze intent
        intent_result = await genai_service.analyze_intent(request.message)
        intent = intent_result.get("intent", "general_inquiry")
        
        # Get relevant context from knowledge base
        context = self._get_relevant_context(request.message, intent)
        
        # Generate response using AI
        response_content = await self._generate_response(
            request.message,
            context,
            intent,
            self.conversations[conversation_id]
        )
        
        # Add assistant message to conversation
        assistant_message = ConversationMessage(
            role="assistant",
            content=response_content,
            timestamp=datetime.now()
        )
        self.conversations[conversation_id].append(assistant_message)
        
        # Determine if human review is needed
        requires_review = self._requires_human_review(intent, request.message)
        
        # Generate suggested actions
        suggested_actions = self._get_suggested_actions(intent)
        
        return ChatResponse(
            conversation_id=conversation_id,
            message=response_content,
            intent=intent,
            suggested_actions=suggested_actions,
            requires_human_review=requires_review
        )
    
    def _get_relevant_context(self, message: str, intent: str) -> str:
        """Get relevant policy context based on message"""
        message_lower = message.lower()
        relevant_policies = []
        
        # Keyword matching for demo (in production, use vector search)
        if any(word in message_lower for word in ["leave", "vacation", "time off"]):
            relevant_policies.append(self.knowledge_base.get("leave_policy", ""))
        if any(word in message_lower for word in ["sick", "illness", "medical"]):
            relevant_policies.append(self.knowledge_base.get("sick_leave", ""))
        if any(word in message_lower for word in ["benefit", "insurance", "health", "dental"]):
            relevant_policies.append(self.knowledge_base.get("benefits", ""))
        if any(word in message_lower for word in ["remote", "work from home", "wfh"]):
            relevant_policies.append(self.knowledge_base.get("remote_work", ""))
        if any(word in message_lower for word in ["review", "performance", "evaluation"]):
            relevant_policies.append(self.knowledge_base.get("performance_review", ""))
        
        return "\n\n".join(relevant_policies) if relevant_policies else "General HR Information"
    
    async def _generate_response(
        self,
        user_message: str,
        context: str,
        intent: str,
        conversation_history: List[ConversationMessage]
    ) -> str:
        """Generate AI response"""
        system_prompt = """You are a helpful and professional HR assistant. 
        Answer questions clearly and accurately based on company policies.
        Be empathetic and supportive. If you don't have enough information, 
        recommend contacting HR directly. Always maintain confidentiality."""
        
        # Build conversation context
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add relevant policy context
        if context and context != "General HR Information":
            messages.append({
                "role": "system",
                "content": f"Relevant Policy Information:\n{context}"
            })
        
        # Add recent conversation history (last 5 messages)
        for msg in conversation_history[-5:]:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        response = await genai_service.chat_completion(messages)
        return response
    
    def _requires_human_review(self, intent: str, message: str) -> bool:
        """Determine if request requires human review"""
        # Sensitive intents that require human review
        sensitive_intents = ["complaint", "grievance", "termination", "legal"]
        if intent in sensitive_intents:
            return True
        
        # Check for sensitive keywords
        sensitive_keywords = [
            "discrimination", "harassment", "lawsuit", "lawyer",
            "terminate", "fire", "quit", "resign", "complaint"
        ]
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in sensitive_keywords)
    
    def _get_suggested_actions(self, intent: str) -> List[str]:
        """Get suggested actions based on intent"""
        action_map = {
            "leave_request": [
                "Submit leave request",
                "View leave balance",
                "Contact manager"
            ],
            "benefits_inquiry": [
                "View benefits details",
                "Update beneficiaries",
                "Contact benefits team"
            ],
            "update_details": [
                "Update personal information",
                "Change emergency contacts",
                "Update direct deposit"
            ],
            "policy_question": [
                "Read full policy document",
                "Schedule HR consultation",
                "View related policies"
            ],
        }
        return action_map.get(intent, ["Contact HR for assistance"])
    
    async def submit_request(
        self,
        user_id: str,
        request_type: str,
        description: str,
        priority: RequestPriority = RequestPriority.MEDIUM
    ) -> HRRequest:
        """Submit an HR request for processing"""
        request_id = str(uuid.uuid4())
        
        request = HRRequest(
            request_id=request_id,
            user_id=user_id,
            request_type=request_type,
            description=description,
            priority=priority,
            status="pending",
            created_at=datetime.now()
        )
        
        self.pending_requests[request_id] = request
        return request
    
    async def process_employee_update(
        self,
        update_request: EmployeeUpdateRequest
    ) -> Dict:
        """Process employee detail update with validation"""
        # In production, this would update a database
        # For now, validate and create an approval request
        
        # Determine if update requires approval
        sensitive_fields = ["salary", "position", "department", "employment_type"]
        requires_approval = any(
            field in sensitive_fields for field in update_request.updates.keys()
        )
        
        if requires_approval:
            # Create approval request
            request = await self.submit_request(
                user_id=update_request.requested_by,
                request_type="employee_update",
                description=f"Update request for employee {update_request.employee_id}: {update_request.reason}",
                priority=RequestPriority.MEDIUM
            )
            return {
                "status": "pending_approval",
                "request_id": request.request_id,
                "message": "Update requires manager approval"
            }
        else:
            # Apply update directly
            return {
                "status": "completed",
                "message": "Employee details updated successfully"
            }
    
    def get_conversation(self, conversation_id: str) -> Optional[List[ConversationMessage]]:
        """Get conversation history"""
        return self.conversations.get(conversation_id)
    
    def get_pending_requests(self, user_id: Optional[str] = None) -> List[HRRequest]:
        """Get pending HR requests"""
        requests = list(self.pending_requests.values())
        if user_id:
            requests = [r for r in requests if r.user_id == user_id]
        return requests

# Singleton instance
hr_assistant = HRAssistantService()

"""
API Routes for Phase 2: HR Assistant
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session

from backend.services.hr_assistant import HRAssistant
from backend.models.database import get_db, ChatHistory, Employee, AuditLog

router = APIRouter()
hr_assistant = HRAssistant()

class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: str

class UpdateDetailsRequest(BaseModel):
    employee_id: str
    field: str
    new_value: str
    requested_by: str

@router.post("/chat")
async def chat_with_assistant(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Chat with HR Assistant
    """
    
    # Get chat history for context
    history = db.query(ChatHistory).filter(
        ChatHistory.session_id == request.session_id
    ).order_by(ChatHistory.created_at.desc()).limit(5).all()
    
    chat_history = [
        {
            "message": h.message,
            "response": h.response
        }
        for h in reversed(history)
    ]
    
    # Process message
    result = hr_assistant.chat(
        message=request.message,
        user_id=request.user_id,
        session_id=request.session_id,
        chat_history=chat_history
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail="Assistant error")
    
    # Save to chat history
    chat_record = ChatHistory(
        session_id=request.session_id,
        user_id=request.user_id,
        message=request.message,
        response=result["response"],
        intent=result.get("intent")
    )
    db.add(chat_record)
    db.commit()
    
    # Handle actions if any
    action_result = None
    if result.get("action"):
        action = result["action"]
        
        # Route request if needed
        if action.get("route_to"):
            action_result = hr_assistant.route_request(
                action, 
                request.user_id, 
                request.message
            )
            
            # Log routing
            audit_log = AuditLog(
                action="request_routed",
                user_id=request.user_id,
                entity_type="routing",
                entity_id=request.session_id,
                details=f"Request routed to {action.get('route_to')}"
            )
            db.add(audit_log)
            db.commit()
    
    return {
        "response": result["response"],
        "intent": result["intent"],
        "action": result.get("action"),
        "action_result": action_result,
        "requires_followup": result.get("requires_followup", False)
    }

@router.post("/update-details")
async def update_employee_details(request: UpdateDetailsRequest, db: Session = Depends(get_db)):
    """
    Request to update employee details
    Requires human approval
    """
    
    result = hr_assistant.update_employee_details(
        employee_id=request.employee_id,
        field=request.field,
        new_value=request.new_value,
        requested_by=request.requested_by
    )
    
    if result.get("success"):
        # Log the update request
        audit_log = AuditLog(
            action="detail_update_requested",
            user_id=request.requested_by,
            entity_type="employee",
            entity_id=request.employee_id,
            details=f"Requested update for {request.field}: {request.new_value}"
        )
        db.add(audit_log)
        db.commit()
    
    return result

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    """Get chat history for a session"""
    
    history = db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id
    ).order_by(ChatHistory.created_at.asc()).all()
    
    return {
        "session_id": session_id,
        "count": len(history),
        "messages": [
            {
                "message": h.message,
                "response": h.response,
                "intent": h.intent,
                "timestamp": h.created_at.isoformat()
            }
            for h in history
        ]
    }

@router.get("/knowledge-base")
async def get_knowledge_base():
    """Get HR knowledge base information"""
    
    return {
        "knowledge_base": hr_assistant.knowledge_base,
        "available_intents": [
            "leave_query",
            "benefits_query", 
            "update_details",
            "payroll_query",
            "policy_query",
            "equipment_request",
            "complaint",
            "general_query"
        ]
    }

"""
API Router for Phase 2: HR Assistant
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Optional

from src.models import (
    ChatRequest, ChatResponse, ConversationMessage,
    EmployeeUpdateRequest, HRRequest, RequestPriority
)
from src.services.hr_assistant_service import hr_assistant

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Chat with the HR Assistant bot
    
    - **user_id**: ID of the user
    - **message**: User's message/question
    - **conversation_id**: Optional conversation ID to continue existing conversation
    - **context**: Optional additional context
    """
    try:
        response = await hr_assistant.chat(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat: {str(e)}"
        )

@router.get("/conversation/{conversation_id}", response_model=List[ConversationMessage])
async def get_conversation(conversation_id: str):
    """Get conversation history"""
    conversation = hr_assistant.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found"
        )
    return conversation

@router.post("/update-employee")
async def update_employee_details(request: EmployeeUpdateRequest):
    """
    Request to update employee details
    
    - **employee_id**: ID of employee to update
    - **updates**: Dictionary of fields to update
    - **requested_by**: ID of user requesting the update
    - **reason**: Reason for the update
    """
    try:
        result = await hr_assistant.process_employee_update(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating employee: {str(e)}"
        )

@router.post("/submit-request", response_model=HRRequest)
async def submit_hr_request(
    user_id: str,
    request_type: str,
    description: str,
    priority: RequestPriority = RequestPriority.MEDIUM
):
    """
    Submit an HR request
    
    - **user_id**: ID of user submitting request
    - **request_type**: Type of request (leave, benefits, complaint, etc.)
    - **description**: Description of the request
    - **priority**: Priority level (low, medium, high, urgent)
    """
    try:
        request = await hr_assistant.submit_request(
            user_id, request_type, description, priority
        )
        return request
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting request: {str(e)}"
        )

@router.get("/requests", response_model=List[HRRequest])
async def get_hr_requests(user_id: Optional[str] = None):
    """
    Get HR requests
    
    - **user_id**: Optional user ID to filter requests
    """
    return hr_assistant.get_pending_requests(user_id)

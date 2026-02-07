"""
Tests for Phase 2: HR Assistant Service
"""
import pytest

from src.models import ChatRequest, EmployeeUpdateRequest, RequestPriority
from src.services.hr_assistant_service import hr_assistant

@pytest.mark.asyncio
async def test_basic_chat():
    """Test basic chat functionality"""
    request = ChatRequest(
        user_id="USER001",
        message="What is the company's leave policy?"
    )
    
    response = await hr_assistant.chat(request)
    
    assert response.conversation_id is not None
    assert response.message is not None
    assert len(response.message) > 0

@pytest.mark.asyncio
async def test_chat_with_policy_question():
    """Test chat with HR policy question"""
    request = ChatRequest(
        user_id="USER002",
        message="How many days of annual leave do I get?"
    )
    
    response = await hr_assistant.chat(request)
    
    assert response.intent is not None
    assert response.message is not None
    assert len(response.suggested_actions) > 0

@pytest.mark.asyncio
async def test_conversation_continuity():
    """Test multi-turn conversation"""
    # First message
    request1 = ChatRequest(
        user_id="USER003",
        message="Tell me about remote work policy"
    )
    
    response1 = await hr_assistant.chat(request1)
    conversation_id = response1.conversation_id
    
    # Follow-up message
    request2 = ChatRequest(
        user_id="USER003",
        message="How many days can I work remotely?",
        conversation_id=conversation_id
    )
    
    response2 = await hr_assistant.chat(request2)
    
    assert response2.conversation_id == conversation_id
    
    # Check conversation history
    history = hr_assistant.get_conversation(conversation_id)
    assert len(history) >= 4  # 2 user messages + 2 assistant responses

@pytest.mark.asyncio
async def test_sensitive_content_detection():
    """Test that sensitive content triggers human review"""
    request = ChatRequest(
        user_id="USER004",
        message="I want to file a harassment complaint"
    )
    
    response = await hr_assistant.chat(request)
    
    assert response.requires_human_review is True

@pytest.mark.asyncio
async def test_employee_update_sensitive_field():
    """Test employee update with sensitive field"""
    update_request = EmployeeUpdateRequest(
        employee_id="EMP001",
        updates={"salary": 110000},
        requested_by="USER001",
        reason="Annual raise"
    )
    
    result = await hr_assistant.process_employee_update(update_request)
    
    assert result["status"] == "pending_approval"
    assert "request_id" in result

@pytest.mark.asyncio
async def test_employee_update_non_sensitive_field():
    """Test employee update with non-sensitive field"""
    update_request = EmployeeUpdateRequest(
        employee_id="EMP002",
        updates={"phone": "555-1234"},
        requested_by="USER002",
        reason="Phone number change"
    )
    
    result = await hr_assistant.process_employee_update(update_request)
    
    assert result["status"] == "completed"

@pytest.mark.asyncio
async def test_submit_hr_request():
    """Test submitting an HR request"""
    request = await hr_assistant.submit_request(
        user_id="USER005",
        request_type="leave_request",
        description="Request for 3 days vacation leave",
        priority=RequestPriority.MEDIUM
    )
    
    assert request.request_id is not None
    assert request.status == "pending"
    assert request.priority == RequestPriority.MEDIUM

def test_get_pending_requests():
    """Test retrieving pending requests"""
    requests = hr_assistant.get_pending_requests()
    assert isinstance(requests, list)

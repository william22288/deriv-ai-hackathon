"""
API Routes for Phase 1: Document Generation
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
from sqlalchemy.orm import Session

from backend.services.document_generator import DocumentGenerator
from backend.models.database import get_db, Document, Employee, AuditLog

router = APIRouter()
doc_generator = DocumentGenerator()

class DocumentRequest(BaseModel):
    document_type: str
    employee_id: str
    locale: str = "en-US"
    company_data: Optional[Dict] = None

class DocumentApprovalRequest(BaseModel):
    document_id: int
    approved: bool
    reviewer_id: str
    comments: Optional[str] = None

@router.post("/generate")
async def generate_document(request: DocumentRequest, db: Session = Depends(get_db)):
    """
    Generate a new document using GenAI
    Requires human review before finalization
    """
    
    # Fetch employee data
    employee = db.query(Employee).filter(Employee.employee_id == request.employee_id).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Prepare employee data
    employee_data = {
        "name": employee.name,
        "email": employee.email,
        "role": employee.role,
        "department": employee.department,
        "location": employee.location,
        "start_date": employee.start_date.strftime("%Y-%m-%d") if employee.start_date else None
    }
    
    # Generate document
    result = doc_generator.generate_document(
        document_type=request.document_type,
        employee_data=employee_data,
        locale=request.locale,
        company_data=request.company_data
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Document generation failed"))
    
    # Validate legal accuracy
    validation = doc_generator.validate_legal_accuracy(
        result["content"], 
        request.document_type
    )
    
    # Save to database
    document = Document(
        document_type=request.document_type,
        employee_id=request.employee_id,
        content=result["content"],
        locale=request.locale,
        status="pending_review",
        generated_by="ai"
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Log action
    audit_log = AuditLog(
        action="document_generated",
        user_id="system",
        entity_type="document",
        entity_id=str(document.id),
        details=f"Generated {request.document_type} for {request.employee_id}"
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "document_id": document.id,
        "content": result["content"],
        "status": document.status,
        "validation": validation,
        "requires_human_review": True,
        "message": "Document generated successfully. Pending human review for approval."
    }

@router.post("/approve")
async def approve_document(request: DocumentApprovalRequest, db: Session = Depends(get_db)):
    """
    Approve or reject a generated document (Human oversight)
    """
    
    document = db.query(Document).filter(Document.id == request.document_id).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if document.status != "pending_review":
        raise HTTPException(status_code=400, detail="Document not in pending review status")
    
    # Update document status
    if request.approved:
        document.status = "approved"
        document.approved_at = datetime.utcnow()
    else:
        document.status = "rejected"
    
    document.reviewed_by = request.reviewer_id
    db.commit()
    
    # Log action
    audit_log = AuditLog(
        action="document_reviewed",
        user_id=request.reviewer_id,
        entity_type="document",
        entity_id=str(document.id),
        details=f"Document {'approved' if request.approved else 'rejected'}. Comments: {request.comments}"
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "document_id": document.id,
        "status": document.status,
        "reviewed_by": request.reviewer_id,
        "approved": request.approved,
        "message": f"Document {'approved' if request.approved else 'rejected'} successfully"
    }

@router.get("/list")
async def list_documents(
    employee_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List documents with optional filters"""
    
    query = db.query(Document)
    
    if employee_id:
        query = query.filter(Document.employee_id == employee_id)
    
    if status:
        query = query.filter(Document.status == status)
    
    documents = query.order_by(Document.created_at.desc()).limit(50).all()
    
    return {
        "count": len(documents),
        "documents": [
            {
                "id": doc.id,
                "document_type": doc.document_type,
                "employee_id": doc.employee_id,
                "locale": doc.locale,
                "status": doc.status,
                "generated_by": doc.generated_by,
                "reviewed_by": doc.reviewed_by,
                "created_at": doc.created_at.isoformat(),
                "approved_at": doc.approved_at.isoformat() if doc.approved_at else None
            }
            for doc in documents
        ]
    }

@router.get("/{document_id}")
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """Get specific document details"""
    
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "id": document.id,
        "document_type": document.document_type,
        "employee_id": document.employee_id,
        "content": document.content,
        "locale": document.locale,
        "status": document.status,
        "generated_by": document.generated_by,
        "reviewed_by": document.reviewed_by,
        "created_at": document.created_at.isoformat(),
        "approved_at": document.approved_at.isoformat() if document.approved_at else None
    }

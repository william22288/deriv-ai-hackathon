"""
Database models and initialization
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hr_platform.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Employee(Base):
    """Employee master data"""
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    department = Column(String)
    role = Column(String)
    location = Column(String)
    start_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Document(Base):
    """Generated documents"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String)  # contract, offer_letter, etc.
    employee_id = Column(String)
    content = Column(Text)
    locale = Column(String)  # en-US, es-ES, etc.
    status = Column(String, default="draft")  # draft, pending_review, approved, signed
    generated_by = Column(String, default="ai")
    reviewed_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)

class ChatHistory(Base):
    """HR Assistant chat history"""
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    user_id = Column(String)
    message = Column(Text)
    response = Column(Text)
    intent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ComplianceRecord(Base):
    """Compliance tracking records"""
    __tablename__ = "compliance_records"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True)
    compliance_type = Column(String)  # work_permit, training, certification
    name = Column(String)
    issue_date = Column(DateTime)
    expiry_date = Column(DateTime)
    status = Column(String, default="active")  # active, expiring_soon, expired
    alert_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    """Audit trail for all actions"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    user_id = Column(String)
    entity_type = Column(String)
    entity_id = Column(String)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

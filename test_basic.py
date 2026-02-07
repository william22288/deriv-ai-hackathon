"""
Test script to verify basic functionality without OpenAI API
"""
import sys
import os

# Set dummy API key for testing
os.environ["OPENAI_API_KEY"] = "test-key"

# Test imports
try:
    from backend.models.database import init_db, SessionLocal, Employee, ComplianceRecord
    from backend.services.document_generator import DocumentGenerator
    from backend.services.hr_assistant import HRAssistant
    from backend.services.compliance_monitor import ComplianceMonitor
    print("✓ All imports successful")
except Exception as e:
    print(f"✗ Import error: {e}")
    sys.exit(1)

# Test database
try:
    init_db()
    db = SessionLocal()
    
    # Check employees
    employees = db.query(Employee).all()
    print(f"✓ Database connected: {len(employees)} employees found")
    
    # Check compliance records
    records = db.query(ComplianceRecord).all()
    print(f"✓ Compliance records: {len(records)} records found")
    
    db.close()
except Exception as e:
    print(f"✗ Database error: {e}")
    sys.exit(1)

# Test services initialization (without API calls)
try:
    doc_gen = DocumentGenerator()
    hr_assist = HRAssistant()
    comp_mon = ComplianceMonitor()
    print("✓ All services initialized")
except Exception as e:
    print(f"✗ Service initialization error: {e}")
    sys.exit(1)

# Test compliance monitoring (doesn't need OpenAI)
try:
    db = SessionLocal()
    records = db.query(ComplianceRecord).all()
    
    record_dicts = [
        {
            "id": r.id,
            "employee_id": r.employee_id,
            "compliance_type": r.compliance_type,
            "name": r.name,
            "expiry_date": r.expiry_date,
            "status": r.status
        }
        for r in records
    ]
    
    result = comp_mon.check_compliance_status(record_dicts)
    
    print(f"✓ Compliance check: {result['total_records']} records")
    print(f"  - Active: {result['active']}")
    print(f"  - Expiring Soon: {result['expiring_soon']}")
    print(f"  - Expired: {result['expired']}")
    print(f"  - Alerts: {len(result['alerts'])}")
    
    db.close()
except Exception as e:
    print(f"✗ Compliance check error: {e}")
    sys.exit(1)

print("\n✅ All basic tests passed!")
print("\nNote: GenAI features (document generation, chat, reports) require a valid OpenAI API key")
print("To use GenAI features, set OPENAI_API_KEY in your .env file")

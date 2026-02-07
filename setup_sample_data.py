"""
Sample data loader for testing the HR platform
Creates sample employees and compliance records
"""
from datetime import datetime, timedelta
from backend.models.database import SessionLocal, Employee, ComplianceRecord, init_db

def create_sample_data():
    """Create sample data for testing"""
    
    # Initialize database
    init_db()
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing = db.query(Employee).first()
        if existing:
            print("Sample data already exists. Skipping...")
            return
        
        # Create sample employees
        employees = [
            Employee(
                employee_id="EMP001",
                name="John Doe",
                email="john.doe@deriv.com",
                department="Engineering",
                role="Senior Software Engineer",
                location="London, UK",
                start_date=datetime(2023, 1, 15)
            ),
            Employee(
                employee_id="EMP002",
                name="Jane Smith",
                email="jane.smith@deriv.com",
                department="Human Resources",
                role="HR Manager",
                location="New York, USA",
                start_date=datetime(2022, 6, 1)
            ),
            Employee(
                employee_id="EMP003",
                name="Carlos Rodriguez",
                email="carlos.rodriguez@deriv.com",
                department="Sales",
                role="Sales Director",
                location="Madrid, Spain",
                start_date=datetime(2021, 3, 10)
            ),
            Employee(
                employee_id="EMP004",
                name="Maria Schmidt",
                email="maria.schmidt@deriv.com",
                department="Finance",
                role="Financial Analyst",
                location="Berlin, Germany",
                start_date=datetime(2023, 9, 1)
            ),
            Employee(
                employee_id="EMP005",
                name="Ahmed Hassan",
                email="ahmed.hassan@deriv.com",
                department="Engineering",
                role="DevOps Engineer",
                location="Dubai, UAE",
                start_date=datetime(2022, 11, 20)
            )
        ]
        
        for emp in employees:
            db.add(emp)
        
        print(f"✓ Created {len(employees)} sample employees")
        
        # Create sample compliance records
        compliance_records = [
            # Active records
            ComplianceRecord(
                employee_id="EMP001",
                compliance_type="work_permit",
                name="UK Work Permit",
                issue_date=datetime.now() - timedelta(days=365),
                expiry_date=datetime.now() + timedelta(days=365),
                status="active"
            ),
            ComplianceRecord(
                employee_id="EMP001",
                compliance_type="training",
                name="Data Protection Training",
                issue_date=datetime.now() - timedelta(days=180),
                expiry_date=datetime.now() + timedelta(days=185),
                status="active"
            ),
            # Expiring soon
            ComplianceRecord(
                employee_id="EMP002",
                compliance_type="certification",
                name="SHRM Certification",
                issue_date=datetime.now() - timedelta(days=700),
                expiry_date=datetime.now() + timedelta(days=25),
                status="active"
            ),
            ComplianceRecord(
                employee_id="EMP003",
                compliance_type="work_permit",
                name="Spain Work Authorization",
                issue_date=datetime.now() - timedelta(days=300),
                expiry_date=datetime.now() + timedelta(days=40),
                status="active"
            ),
            # Expired
            ComplianceRecord(
                employee_id="EMP004",
                compliance_type="training",
                name="Safety Training",
                issue_date=datetime.now() - timedelta(days=400),
                expiry_date=datetime.now() - timedelta(days=5),
                status="expired"
            ),
            # More active records
            ComplianceRecord(
                employee_id="EMP005",
                compliance_type="work_permit",
                name="UAE Work Visa",
                issue_date=datetime.now() - timedelta(days=200),
                expiry_date=datetime.now() + timedelta(days=165),
                status="active"
            ),
            ComplianceRecord(
                employee_id="EMP005",
                compliance_type="certification",
                name="AWS Certification",
                issue_date=datetime.now() - timedelta(days=100),
                expiry_date=datetime.now() + timedelta(days=630),
                status="active"
            ),
        ]
        
        for record in compliance_records:
            db.add(record)
        
        print(f"✓ Created {len(compliance_records)} sample compliance records")
        
        # Commit all changes
        db.commit()
        
        print("\n✅ Sample data created successfully!")
        print("\nYou can now:")
        print("- Generate documents for employees: EMP001, EMP002, EMP003, EMP004, EMP005")
        print("- Chat with the HR Assistant")
        print("- View compliance dashboard with real data")
        print("- Check compliance status to see active, expiring, and expired records")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating sample data for HR Platform...")
    print("-" * 50)
    create_sample_data()

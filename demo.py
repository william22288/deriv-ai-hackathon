"""
Demo script to showcase the AI-Powered HR Platform capabilities
"""
import asyncio
from datetime import date, timedelta
import json

from src.models import (
    EmployeeData, ContractGenerationRequest, EmploymentType,
    ChatRequest, RequestPriority, ComplianceCheckRequest
)
from src.services.document_service import document_service
from src.services.hr_assistant_service import hr_assistant
from src.services.compliance_service import compliance_service

async def demo_document_generation():
    """Demo Phase 1: Intelligent Document Generation"""
    print("\n" + "="*60)
    print("PHASE 1: INTELLIGENT DOCUMENT GENERATION")
    print("="*60)
    
    # Create employee data
    employee_data = EmployeeData(
        employee_id="EMP001",
        first_name="Sarah",
        last_name="Johnson",
        email="sarah.johnson@company.com",
        position="Senior Software Engineer",
        department="Engineering",
        employment_type=EmploymentType.FULL_TIME,
        start_date=date(2024, 3, 1),
        salary=120000.0,
        currency="USD",
        location="San Francisco, CA",
        jurisdiction="United States",
        benefits=["Health Insurance", "401k", "Stock Options"]
    )
    
    print("\n1. Generating employment contract for Sarah Johnson...")
    print(f"   Position: {employee_data.position}")
    print(f"   Jurisdiction: {employee_data.jurisdiction}")
    
    # Generate contract
    request = ContractGenerationRequest(
        employee_data=employee_data,
        template_id="us_full_time",
        require_approval=True
    )
    
    contract = await document_service.generate_contract(request)
    
    print(f"\n✓ Contract generated successfully!")
    print(f"   Contract ID: {contract.contract_id}")
    print(f"   Status: {contract.status}")
    print(f"   Requires human review: Yes")
    
    print("\n2. Contract Preview (first 500 characters):")
    print("-" * 60)
    print(contract.content[:500] + "...")
    print("-" * 60)
    
    # Human review
    print("\n3. Submitting for human review...")
    approved_contract = await document_service.review_contract(
        contract_id=contract.contract_id,
        reviewer_id="HR_MANAGER_001",
        approved=True
    )
    
    print(f"✓ Contract approved by HR Manager")
    print(f"   New Status: {approved_contract.status}")
    
    return contract

async def demo_hr_assistant():
    """Demo Phase 2: Conversational HR Assistant"""
    print("\n" + "="*60)
    print("PHASE 2: CONVERSATIONAL HR ASSISTANT")
    print("="*60)
    
    # Scenario 1: Policy Question
    print("\n1. Employee asks about leave policy...")
    request1 = ChatRequest(
        user_id="EMP002",
        message="How many days of annual leave do I get as a full-time employee?"
    )
    
    response1 = await hr_assistant.chat(request1)
    print(f"\n   User: {request1.message}")
    print(f"   Assistant: {response1.message[:300]}...")
    print(f"   Intent Detected: {response1.intent}")
    print(f"   Suggested Actions: {response1.suggested_actions[:2]}")
    
    # Scenario 2: Benefits Inquiry
    print("\n2. Employee asks about benefits...")
    request2 = ChatRequest(
        user_id="EMP003",
        message="What health insurance options are available?"
    )
    
    response2 = await hr_assistant.chat(request2)
    print(f"\n   User: {request2.message}")
    print(f"   Assistant: {response2.message[:300]}...")
    
    # Scenario 3: Sensitive Topic (triggers human review)
    print("\n3. Employee mentions sensitive topic...")
    request3 = ChatRequest(
        user_id="EMP004",
        message="I need to report a workplace harassment incident"
    )
    
    response3 = await hr_assistant.chat(request3)
    print(f"\n   User: {request3.message}")
    print(f"   Assistant: {response3.message[:200]}...")
    print(f"   ⚠ Requires Human Review: {response3.requires_human_review}")
    
    # Submit HR Request
    print("\n4. Employee submits leave request...")
    request = await hr_assistant.submit_request(
        user_id="EMP005",
        request_type="leave_request",
        description="Request for 5 days annual leave from March 15-19",
        priority=RequestPriority.MEDIUM
    )
    
    print(f"✓ Leave request submitted")
    print(f"   Request ID: {request.request_id}")
    print(f"   Status: {request.status}")
    print(f"   Priority: {request.priority}")

async def demo_compliance_intelligence():
    """Demo Phase 3: Proactive Compliance Intelligence"""
    print("\n" + "="*60)
    print("PHASE 3: PROACTIVE COMPLIANCE INTELLIGENCE")
    print("="*60)
    
    # Add compliance items for different employees
    print("\n1. Adding compliance tracking items...")
    
    # Valid item
    item1 = await compliance_service.add_compliance_item(
        employee_id="EMP001",
        item_type="work_permit",
        name="H1-B Work Visa",
        jurisdiction="United States",
        issue_date=date.today() - timedelta(days=100),
        expiry_date=date.today() + timedelta(days=900)
    )
    print(f"   ✓ Added: {item1.name} for EMP001 - Status: {item1.status}")
    
    # Item expiring soon (at risk)
    item2 = await compliance_service.add_compliance_item(
        employee_id="EMP002",
        item_type="training",
        name="Safety Training Certification",
        jurisdiction="United States",
        issue_date=date.today() - timedelta(days=340),
        expiry_date=date.today() + timedelta(days=25)
    )
    print(f"   ⚠ Added: {item2.name} for EMP002 - Status: {item2.status}")
    
    # Expired item
    item3 = await compliance_service.add_compliance_item(
        employee_id="EMP003",
        item_type="certification",
        name="GDPR Training",
        jurisdiction="European Union",
        issue_date=date.today() - timedelta(days=400),
        expiry_date=date.today() - timedelta(days=5)
    )
    print(f"   ✗ Added: {item3.name} for EMP003 - Status: {item3.status}")
    
    # Check compliance
    print("\n2. Checking overall compliance status...")
    check_request = ComplianceCheckRequest()
    status = await compliance_service.check_compliance(check_request)
    
    print(f"\n   Total Employees: {status['total_employees']}")
    print(f"   Total Items: {status['total_items']}")
    print(f"   ✓ Compliant: {status['compliant']}")
    print(f"   ⚠ At Risk: {status['at_risk']}")
    print(f"   ✗ Non-Compliant: {status['non_compliant']}")
    
    # Proactive monitoring
    print("\n3. Running proactive compliance monitoring...")
    alerts = await compliance_service.monitor_compliance()
    print(f"   Generated {len(alerts)} new alerts")
    
    # Get all alerts
    all_alerts = compliance_service.get_alerts(unresolved_only=True)
    print(f"\n4. Current unresolved alerts: {len(all_alerts)}")
    
    for i, alert in enumerate(all_alerts[:3], 1):
        print(f"\n   Alert {i}:")
        print(f"   - Type: {alert.alert_type}")
        print(f"   - Severity: {alert.severity}")
        print(f"   - Message: {alert.message}")
        print(f"   - Employee: {alert.employee_id}")
    
    # Generate audit report
    print("\n5. Generating audit readiness report...")
    report = await compliance_service.generate_audit_report()
    
    print(f"\n   Report ID: {report.report_id}")
    print(f"   Jurisdiction: {report.jurisdiction}")
    print(f"   Total Employees: {report.total_employees}")
    print(f"   Compliance Rate: {report.compliant_count}/{report.total_employees}")
    
    print("\n   AI-Generated Recommendations:")
    for i, rec in enumerate(report.recommendations[:3], 1):
        if rec.strip():
            print(f"   {i}. {rec.strip()}")
    
    # Get jurisdiction requirements
    print("\n6. Checking jurisdiction-specific requirements...")
    requirements = compliance_service.get_required_items_for_jurisdiction(
        "United States"
    )
    print(f"   United States requires {len(requirements)} compliance items:")
    for req in requirements[:3]:
        print(f"   - {req['name']} ({req['type']})")

async def main():
    """Main demo function"""
    print("\n" + "="*60)
    print("AI-POWERED SELF-SERVICE HR PLATFORM DEMO")
    print("Making HR Operations 'Invisible'")
    print("="*60)
    
    # Run all demos
    await demo_document_generation()
    await demo_hr_assistant()
    await demo_compliance_intelligence()
    
    print("\n" + "="*60)
    print("DEMO COMPLETE")
    print("="*60)
    print("\nKey Features Demonstrated:")
    print("✓ AI-powered contract generation with human oversight")
    print("✓ Conversational HR assistant with intent detection")
    print("✓ Proactive compliance monitoring and alerts")
    print("✓ Automated audit report generation")
    print("✓ Multi-jurisdiction support")
    print("\nAll features maintain legal accuracy and human oversight!")
    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(main())

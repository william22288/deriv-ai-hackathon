"""
Phase 3: Proactive Compliance Intelligence
Monitors permits, training, and ensures audit readiness
"""
import os
from datetime import datetime, timedelta
from typing import Dict, List
import json

try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "sk-test"))
except Exception as e:
    # Fallback for testing without OpenAI
    client = None

class ComplianceMonitor:
    """Proactive compliance monitoring and intelligence system"""
    
    def __init__(self):
        self.model = os.getenv("OPENAI_MODEL", "gpt-4")
        self.alert_thresholds = {
            "work_permit": 60,  # Alert 60 days before expiry
            "training": 30,      # Alert 30 days before expiry
            "certification": 45   # Alert 45 days before expiry
        }
    
    def check_compliance_status(
        self, 
        compliance_records: List[Dict]
    ) -> Dict:
        """
        Check compliance status for all records
        
        Args:
            compliance_records: List of compliance records from database
            
        Returns:
            Dictionary with compliance status and alerts
        """
        
        results = {
            "total_records": len(compliance_records),
            "active": 0,
            "expiring_soon": 0,
            "expired": 0,
            "alerts": [],
            "compliant": True,
            "checked_at": datetime.utcnow().isoformat()
        }
        
        current_date = datetime.utcnow()
        
        for record in compliance_records:
            expiry_date = record.get("expiry_date")
            if not expiry_date:
                continue
            
            # Convert to datetime if string
            if isinstance(expiry_date, str):
                expiry_date = datetime.fromisoformat(expiry_date.replace('Z', '+00:00'))
            
            days_until_expiry = (expiry_date - current_date).days
            compliance_type = record.get("compliance_type")
            threshold = self.alert_thresholds.get(compliance_type, 30)
            
            # Categorize status
            if days_until_expiry < 0:
                results["expired"] += 1
                results["compliant"] = False
                results["alerts"].append({
                    "severity": "critical",
                    "type": compliance_type,
                    "employee_id": record.get("employee_id"),
                    "name": record.get("name"),
                    "message": f"{compliance_type} expired {abs(days_until_expiry)} days ago",
                    "action_required": "immediate_renewal"
                })
            
            elif days_until_expiry <= threshold:
                results["expiring_soon"] += 1
                results["alerts"].append({
                    "severity": "warning",
                    "type": compliance_type,
                    "employee_id": record.get("employee_id"),
                    "name": record.get("name"),
                    "message": f"{compliance_type} expires in {days_until_expiry} days",
                    "action_required": "schedule_renewal"
                })
            
            else:
                results["active"] += 1
        
        return results
    
    def generate_compliance_report(
        self, 
        compliance_data: Dict,
        report_type: str = "summary"
    ) -> Dict:
        """
        Generate AI-powered compliance report
        
        Args:
            compliance_data: Compliance status data
            report_type: Type of report (summary, detailed, audit)
            
        Returns:
            Dictionary with generated report
        """
        
        prompt = self._build_report_prompt(compliance_data, report_type)
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a compliance reporting specialist. 
Generate clear, professional compliance reports that highlight risks, provide actionable insights, 
and ensure audit readiness. Use data-driven language and include specific recommendations."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            report_content = response.choices[0].message.content
            
            return {
                "success": True,
                "report": report_content,
                "report_type": report_type,
                "generated_at": datetime.utcnow().isoformat(),
                "data_snapshot": compliance_data
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "report_type": report_type
            }
    
    def _build_report_prompt(self, compliance_data: Dict, report_type: str) -> str:
        """Build prompt for compliance report generation"""
        
        if report_type == "summary":
            return f"""Generate a concise compliance summary report based on this data:

Total Records: {compliance_data.get('total_records', 0)}
Active: {compliance_data.get('active', 0)}
Expiring Soon: {compliance_data.get('expiring_soon', 0)}
Expired: {compliance_data.get('expired', 0)}
Overall Compliance Status: {'COMPLIANT' if compliance_data.get('compliant') else 'NON-COMPLIANT'}

Alerts:
{json.dumps(compliance_data.get('alerts', []), indent=2)}

Include:
- Executive summary
- Key findings
- Risk assessment
- Immediate action items
"""
        
        elif report_type == "audit":
            return f"""Generate an audit-ready compliance report:

Compliance Data:
{json.dumps(compliance_data, indent=2)}

Include:
- Audit trail summary
- Compliance verification status
- Documentation completeness
- Risk register
- Remediation plan for any issues
- Recommendations for improvement
"""
        
        return f"Generate a detailed compliance report based on: {json.dumps(compliance_data, indent=2)}"
    
    def predict_compliance_risks(
        self, 
        historical_data: List[Dict]
    ) -> Dict:
        """
        Use GenAI to predict potential compliance risks
        
        Args:
            historical_data: Historical compliance data
            
        Returns:
            Risk predictions and recommendations
        """
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a predictive compliance analyst. 
Analyze historical compliance data to identify patterns, predict potential risks, 
and provide proactive recommendations."""
                    },
                    {
                        "role": "user",
                        "content": f"""Analyze this historical compliance data and predict risks:

{json.dumps(historical_data, indent=2)}

Identify:
1. Patterns in expiries and renewals
2. High-risk areas or employee groups
3. Seasonal trends
4. Predictive insights for next 3-6 months
5. Proactive recommendations
"""
                    }
                ],
                temperature=0.5,
                max_tokens=800
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "success": True,
                "risk_prediction": analysis,
                "analyzed_records": len(historical_data),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def send_alerts(
        self, 
        alerts: List[Dict]
    ) -> Dict:
        """
        Send compliance alerts to relevant stakeholders
        In production, this would integrate with email/notification systems
        """
        
        notifications = []
        
        for alert in alerts:
            severity = alert.get("severity")
            employee_id = alert.get("employee_id")
            message = alert.get("message")
            
            # Different notification strategies based on severity
            if severity == "critical":
                notifications.append({
                    "recipient": "hr-manager@company.com",
                    "cc": ["compliance@company.com"],
                    "subject": f"URGENT: Compliance Alert - {employee_id}",
                    "message": message,
                    "priority": "high"
                })
            
            elif severity == "warning":
                notifications.append({
                    "recipient": "hr-team@company.com",
                    "subject": f"Compliance Alert - {employee_id}",
                    "message": message,
                    "priority": "normal"
                })
        
        return {
            "alerts_processed": len(alerts),
            "notifications_created": len(notifications),
            "notifications": notifications,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def generate_audit_trail(
        self, 
        entity_type: str, 
        entity_id: str,
        start_date: datetime,
        end_date: datetime,
        audit_logs: List[Dict]
    ) -> Dict:
        """
        Generate comprehensive audit trail using GenAI
        
        Args:
            entity_type: Type of entity (employee, document, etc.)
            entity_id: Entity identifier
            start_date: Start of audit period
            end_date: End of audit period
            audit_logs: Relevant audit log entries
            
        Returns:
            Formatted audit trail report
        """
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are an audit specialist. Generate clear, comprehensive 
audit trails that document all actions, changes, and decisions with timestamps and actors."""
                    },
                    {
                        "role": "user",
                        "content": f"""Generate an audit trail report:

Entity Type: {entity_type}
Entity ID: {entity_id}
Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}

Audit Logs:
{json.dumps(audit_logs, indent=2)}

Create a chronological audit trail with:
- All actions and changes
- Who performed each action
- When each action occurred
- What was changed (before/after values where applicable)
- Any compliance-relevant notes
"""
                    }
                ],
                temperature=0.2,
                max_tokens=1000
            )
            
            audit_trail = response.choices[0].message.content
            
            return {
                "success": True,
                "audit_trail": audit_trail,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "period": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "log_entries": len(audit_logs),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

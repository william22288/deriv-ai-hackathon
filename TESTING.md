# Testing Guide for AI-Powered HR Platform

## Prerequisites

1. Python 3.9+ installed
2. All dependencies installed: `pip install -r requirements.txt`
3. OpenAI API key (optional for full testing, but recommended)

## Setup

### 1. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key if available
```

### 2. Initialize Database and Sample Data

```bash
python setup_sample_data.py
```

This creates:
- 5 sample employees (EMP001 - EMP005)
- 7 compliance records with various statuses

### 3. Run Basic Tests

```bash
python test_basic.py
```

This verifies:
- All imports work correctly
- Database connectivity
- Service initialization
- Compliance monitoring (no API key needed)

## Running the Application

### Start the Server

```bash
python main.py
```

The application will be available at: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## Testing Each Phase

### Phase 1: Intelligent Document Generation

#### Via Web Interface
1. Navigate to http://localhost:8000
2. Click "Documents" tab
3. Fill in the form:
   - Document Type: Employment Contract
   - Employee ID: EMP001
   - Locale: en-US
4. Click "Generate Document"
5. Review the AI-generated document
6. Note the validation results
7. Click "Approve" or "Reject" (demonstrates human oversight)

#### Via API (with curl)

**Generate Document:**
```bash
curl -X POST "http://localhost:8000/api/documents/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "document_type": "employment_contract",
    "employee_id": "EMP001",
    "locale": "en-US"
  }'
```

**List Documents:**
```bash
curl "http://localhost:8000/api/documents/list"
```

**Approve Document:**
```bash
curl -X POST "http://localhost:8000/api/documents/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": 1,
    "approved": true,
    "reviewer_id": "reviewer_001"
  }'
```

#### Expected Results
- ✅ Document generated with localized content
- ✅ AI validation analysis provided
- ✅ Status: "pending_review" (human oversight required)
- ✅ After approval: Status changes to "approved"
- ✅ All actions logged in audit trail

### Phase 2: Conversational HR Assistant

#### Via Web Interface
1. Navigate to http://localhost:8000
2. Click "HR Assistant" tab
3. Try these queries:
   - "How much annual leave do I have?"
   - "What are my health insurance benefits?"
   - "How do I update my address?"
   - "What is the retirement plan?"
4. Use quick help topic buttons
5. Observe context-aware responses
6. Try requesting an update: "I need to update my phone number"

#### Via API

**Chat with Assistant:**
```bash
curl -X POST "http://localhost:8000/api/assistant/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How much annual leave do I have?",
    "user_id": "EMP001",
    "session_id": "test_session_001"
  }'
```

**Update Details Request:**
```bash
curl -X POST "http://localhost:8000/api/assistant/update-details" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "field": "phone",
    "new_value": "+1234567890",
    "requested_by": "EMP001"
  }'
```

**Get Chat History:**
```bash
curl "http://localhost:8000/api/assistant/history/test_session_001"
```

#### Expected Results
- ✅ Relevant answers from knowledge base
- ✅ Context-aware conversation
- ✅ Intent detection (leave_query, benefits_query, etc.)
- ✅ Automatic routing for update requests
- ✅ Human approval required for sensitive operations

### Phase 3: Proactive Compliance Intelligence

#### Via Web Interface
1. Navigate to http://localhost:8000
2. Click "Compliance" tab
3. View the dashboard showing:
   - Total records
   - Active, Expiring, and Expired counts
   - Active alerts
4. Add a new compliance record
5. Click "Check Compliance Status" to see alerts
6. Click "Generate Report" for AI-powered summary
7. Click "Predict Risks" for predictive analysis

#### Via API

**Add Compliance Record:**
```bash
curl -X POST "http://localhost:8000/api/compliance/records" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "compliance_type": "training",
    "name": "Security Awareness Training",
    "issue_date": "2024-01-01T00:00:00Z",
    "expiry_date": "2025-01-01T00:00:00Z"
  }'
```

**Check Compliance:**
```bash
curl "http://localhost:8000/api/compliance/check"
```

**Generate Report:**
```bash
curl -X POST "http://localhost:8000/api/compliance/report" \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "summary"
  }'
```

**Predict Risks:**
```bash
curl "http://localhost:8000/api/compliance/predict-risks"
```

**Get Dashboard:**
```bash
curl "http://localhost:8000/api/compliance/dashboard"
```

**Get Audit Trail:**
```bash
curl "http://localhost:8000/api/compliance/audit-trail/EMP001?entity_type=employee&days=90"
```

#### Expected Results
- ✅ Real-time compliance monitoring
- ✅ Automatic categorization (active, expiring, expired)
- ✅ Alerts with severity levels
- ✅ AI-generated compliance reports
- ✅ Predictive risk analysis
- ✅ Complete audit trails

## Test Scenarios

### Scenario 1: New Employee Onboarding
1. Generate offer letter for new employee
2. HR reviews and approves
3. Generate employment contract
4. Add compliance records (work permit, training)
5. Monitor compliance status

### Scenario 2: Employee Inquiry
1. Employee asks about benefits via chatbot
2. Gets instant response from knowledge base
3. Requests address update
4. Request routed to HR with approval workflow

### Scenario 3: Compliance Alert
1. System detects expiring work permit (< 60 days)
2. Generates alert
3. Sends notification to HR
4. Creates audit record

### Scenario 4: Audit Preparation
1. Generate compliance report
2. Review all expired/expiring items
3. Get audit trail for specific employee
4. Use AI to predict future risks

## Verification Checklist

### GenAI Integration ✅
- [ ] OpenAI GPT-4 used for document generation
- [ ] OpenAI used for chat assistant
- [ ] OpenAI used for compliance reports
- [ ] OpenAI used for risk predictions

### Legal Accuracy ✅
- [ ] AI validation layer before human review
- [ ] Multiple locale support with proper legal language
- [ ] Clear marking of sections requiring review
- [ ] Structured templates for each document type

### Human Oversight ✅
- [ ] All documents require approval
- [ ] Update requests need authorization
- [ ] Audit logs for all critical actions
- [ ] Manual review points clearly identified

### Compliance Intelligence ✅
- [ ] Automatic expiry tracking
- [ ] Configurable alert thresholds
- [ ] Proactive notifications
- [ ] Predictive analytics

## Troubleshooting

### No OpenAI API Key
If you don't have an OpenAI API key:
- Basic functionality (database, compliance monitoring) will work
- Document generation, chat, and AI reports will fail gracefully
- Error messages will indicate missing API key

### Database Issues
If database errors occur:
```bash
rm hr_platform.db  # Delete existing database
python setup_sample_data.py  # Recreate with sample data
```

### Port Already in Use
If port 8000 is busy:
```bash
# Edit main.py and change port
# Or kill the process using the port
lsof -ti:8000 | xargs kill -9
```

## Performance Notes

- **Document Generation**: 2-5 seconds per document
- **Chat Response**: 1-3 seconds per message
- **Compliance Check**: < 1 second (no API call)
- **AI Report Generation**: 3-7 seconds

## Security Testing

1. Verify audit logs created for all actions
2. Check approval workflows enforced
3. Confirm sensitive operations require authorization
4. Review data privacy in chat history

## Success Criteria

✅ All three phases implemented and functional
✅ GenAI integrated throughout the platform
✅ Human oversight mechanisms in place
✅ Legal accuracy validation layers active
✅ Compliance monitoring proactive and accurate
✅ Complete audit trails maintained
✅ Web interface functional and responsive
✅ API endpoints documented and working

## Next Steps

1. Add real OpenAI API key for full GenAI features
2. Configure email/SMS for real notifications
3. Integrate with existing HR systems
4. Add authentication and authorization
5. Deploy to production environment

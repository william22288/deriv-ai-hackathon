# API Reference

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the API does not require authentication. In production, implement OAuth2 or JWT authentication.

## Endpoints

### General

#### Get Application Info

```http
GET /
```

**Response:**
```json
{
  "message": "Welcome to AI-Powered Self-Service HR Platform",
  "version": "1.0.0",
  "features": [
    "Intelligent Document Generation",
    "Conversational HR Assistant",
    "Proactive Compliance Intelligence"
  ]
}
```

#### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "hr-platform"
}
```

---

## Phase 1: Document Generation

### Generate Contract

```http
POST /api/documents/generate
```

**Request Body:**
```json
{
  "employee_data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "position": "Software Engineer",
    "department": "Engineering",
    "employment_type": "full_time",
    "start_date": "2024-01-15",
    "salary": 100000.0,
    "location": "San Francisco, CA",
    "jurisdiction": "United States"
  },
  "template_id": "us_full_time",
  "require_approval": true
}
```

**Response:**
```json
{
  "contract_id": "uuid",
  "employee_id": "EMP001",
  "template_id": "us_full_time",
  "content": "EMPLOYMENT CONTRACT...",
  "status": "pending_review",
  "created_at": "2024-01-01T10:00:00",
  "metadata": {}
}
```

### List Templates

```http
GET /api/documents/templates
```

**Response:**
```json
[
  {
    "template_id": "us_full_time",
    "name": "Us Full Time",
    "jurisdiction": "United States",
    "employment_type": "full_time"
  }
]
```

### Get Pending Approvals

```http
GET /api/documents/pending-approvals
```

### Review Contract

```http
POST /api/documents/review/{contract_id}?reviewer_id=REV001&approved=true
```

**Query Parameters:**
- `reviewer_id` (required): ID of the reviewer
- `approved` (required): true or false
- `comments` (optional): Rejection comments

### Get Contract

```http
GET /api/documents/{contract_id}
```

---

## Phase 2: HR Assistant

### Chat with Assistant

```http
POST /api/assistant/chat
```

**Request Body:**
```json
{
  "user_id": "USER001",
  "message": "What is the company leave policy?",
  "conversation_id": "optional-uuid",
  "context": {}
}
```

**Response:**
```json
{
  "conversation_id": "uuid",
  "message": "Based on our company policy...",
  "intent": "policy_question",
  "suggested_actions": ["Read full policy", "Contact HR"],
  "requires_human_review": false
}
```

### Get Conversation History

```http
GET /api/assistant/conversation/{conversation_id}
```

### Update Employee Details

```http
POST /api/assistant/update-employee
```

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "updates": {
    "phone": "555-1234"
  },
  "requested_by": "USER001",
  "reason": "Phone number change"
}
```

### Submit HR Request

```http
POST /api/assistant/submit-request
```

**Query Parameters:**
- `user_id` (required): User ID
- `request_type` (required): Type of request
- `description` (required): Description
- `priority` (optional): low, medium, high, urgent

### Get HR Requests

```http
GET /api/assistant/requests?user_id=USER001
```

---

## Phase 3: Compliance Intelligence

### Check Compliance

```http
POST /api/compliance/check
```

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "jurisdiction": "United States",
  "item_type": "training"
}
```

**Response:**
```json
{
  "employee_id": "EMP001",
  "total_items": 5,
  "compliant": 3,
  "at_risk": 1,
  "non_compliant": 1,
  "items": []
}
```

### Add Compliance Item

```http
POST /api/compliance/items
```

**Query Parameters:**
- `employee_id` (required)
- `item_type` (required): permit, training, certification, etc.
- `name` (required): Item name
- `jurisdiction` (required)
- `issue_date` (optional): ISO date
- `expiry_date` (optional): ISO date
- `details` (optional): JSON object

### Get Compliance Alerts

```http
GET /api/compliance/alerts?employee_id=EMP001&unresolved_only=true
```

**Response:**
```json
[
  {
    "alert_id": "uuid",
    "employee_id": "EMP001",
    "item_id": "uuid",
    "alert_type": "expiring",
    "severity": "high",
    "message": "Training is expiring soon",
    "created_at": "2024-01-01T10:00:00",
    "resolved": false
  }
]
```

### Resolve Alert

```http
POST /api/compliance/alerts/{alert_id}/resolve
```

### Monitor Compliance

```http
POST /api/compliance/monitor
```

**Response:**
```json
{
  "new_alerts": 2,
  "alerts": []
}
```

### Generate Audit Report

```http
POST /api/compliance/audit-report?jurisdiction=United%20States
```

**Response:**
```json
{
  "report_id": "uuid",
  "generated_at": "2024-01-01T10:00:00",
  "jurisdiction": "United States",
  "total_employees": 50,
  "compliant_count": 45,
  "at_risk_count": 3,
  "non_compliant_count": 2,
  "items_summary": {},
  "recommendations": [
    "Schedule training renewals",
    "Update expired certifications"
  ]
}
```

### Get Jurisdiction Requirements

```http
GET /api/compliance/requirements/{jurisdiction}
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "detail": "Error message describing what went wrong"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented. For production, implement rate limiting based on your requirements.

## Interactive Documentation

When the server is running, access interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

# AI-Powered Self-Service HR Platform

An intelligent HR platform that makes operations "invisible" by automating manual tasks with GenAI, reducing HR workload while maintaining legal accuracy and human oversight.

## Overview

This platform addresses the challenges of HR teams overwhelmed by manual tasks like customizing contracts, answering repetitive policy questions, and tracking compliance across multiple jurisdictions.

## Features

### Phase 1: Intelligent Document Generation
- **Auto-creates localized contracts** from structured employee data
- Supports multiple jurisdictions (US, UK, Singapore, EU)
- Different employment types (Full-time, Part-time, Contract, Intern)
- **Human oversight**: All generated contracts require review and approval
- GenAI-powered section generation for legal accuracy
- Template-based system for consistency

### Phase 2: Conversational HR Assistant
- **AI-powered chatbot** for HR policy questions
- Natural language understanding with intent classification
- Multi-turn conversations with context retention
- Automated employee detail updates with approval workflows
- Request routing and prioritization
- **Human review triggers** for sensitive topics (harassment, legal, termination)
- Built-in knowledge base with company policies

### Phase 3: Proactive Compliance Intelligence
- **Automated compliance monitoring** for permits, training, and certifications
- Multi-jurisdiction support with specific requirements
- Expiry tracking and proactive alerts
- Automated audit report generation
- AI-powered compliance recommendations
- Risk assessment (Compliant, At Risk, Non-Compliant)

## Architecture

```
├── main.py                 # FastAPI application entry point
├── src/
│   ├── models/            # Pydantic data models
│   ├── services/          # Business logic
│   │   ├── genai_service.py         # GenAI integration
│   │   ├── document_service.py      # Phase 1 implementation
│   │   ├── hr_assistant_service.py  # Phase 2 implementation
│   │   └── compliance_service.py    # Phase 3 implementation
│   └── api/               # FastAPI routers
│       ├── document_generation.py
│       ├── hr_assistant.py
│       └── compliance.py
└── tests/                 # Comprehensive test suite
```

## Installation

1. **Clone the repository:**
```bash
git clone https://github.com/william22288/deriv-ai-hackathon.git
cd deriv-ai-hackathon
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

## Running the Application

### Start the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### API Documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Usage Examples

### 1. Generate Employment Contract

```bash
curl -X POST "http://localhost:8000/api/documents/generate" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 2. Chat with HR Assistant

```bash
curl -X POST "http://localhost:8000/api/assistant/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER001",
    "message": "What is the company leave policy?"
  }'
```

### 3. Check Compliance Status

```bash
curl -X POST "http://localhost:8000/api/compliance/check" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001"
  }'
```

### 4. Generate Audit Report

```bash
curl -X POST "http://localhost:8000/api/compliance/audit-report?jurisdiction=United%20States"
```

## Testing

Run the test suite:
```bash
pytest tests/ -v
```

Run specific test file:
```bash
pytest tests/test_document_service.py -v
pytest tests/test_hr_assistant.py -v
pytest tests/test_compliance_service.py -v
pytest tests/test_api.py -v
```

Run with coverage:
```bash
pytest tests/ --cov=src --cov-report=html
```

## Key Design Principles

### 1. Legal Accuracy
- AI-generated contracts use jurisdiction-specific templates
- All contracts require human review before use
- Built-in validation and compliance checks
- Maintains audit trails

### 2. Human Oversight
- Sensitive topics automatically flagged for human review
- Approval workflows for critical operations
- HR team maintains final decision authority
- Transparent AI decision-making

### 3. Scalability
- Multi-jurisdiction support
- Template-based approach for easy expansion
- API-first design for integration
- Stateless services for horizontal scaling

### 4. Security
- Sensitive data handling with proper access controls
- Environment-based configuration
- No hard-coded credentials
- Comprehensive input validation

## API Endpoints

### Document Generation
- `POST /api/documents/generate` - Generate employment contract
- `GET /api/documents/templates` - List available templates
- `GET /api/documents/pending-approvals` - Get contracts pending review
- `POST /api/documents/review/{contract_id}` - Review and approve/reject contract
- `GET /api/documents/{contract_id}` - Get specific contract

### HR Assistant
- `POST /api/assistant/chat` - Chat with HR assistant
- `GET /api/assistant/conversation/{conversation_id}` - Get conversation history
- `POST /api/assistant/update-employee` - Request employee detail update
- `POST /api/assistant/submit-request` - Submit HR request
- `GET /api/assistant/requests` - Get pending requests

### Compliance
- `POST /api/compliance/check` - Check compliance status
- `POST /api/compliance/items` - Add compliance item
- `GET /api/compliance/alerts` - Get compliance alerts
- `POST /api/compliance/alerts/{alert_id}/resolve` - Resolve alert
- `POST /api/compliance/monitor` - Run proactive monitoring
- `POST /api/compliance/audit-report` - Generate audit report
- `GET /api/compliance/requirements/{jurisdiction}` - Get jurisdiction requirements

## Technology Stack

- **Backend Framework**: FastAPI
- **AI/GenAI**: OpenAI GPT-4
- **Data Validation**: Pydantic
- **Testing**: Pytest
- **Documentation**: OpenAPI/Swagger

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Authentication and authorization
- Email notifications for alerts
- Document storage integration
- Advanced analytics dashboard
- Mobile application
- Multi-language support
- Integration with HRIS systems
- Workflow automation engine
- Advanced reporting capabilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the GitHub repository.
# AI-Powered Self-Service HR Platform

An intelligent, GenAI-powered HR platform that makes operations "invisible" through automation, intelligent assistance, and proactive compliance monitoring.

## 🎯 Overview

This platform implements three integrated phases to revolutionize HR operations:

### Phase 1: Intelligent Document Generation
- **Auto-creates localized contracts** from structured employee data
- Supports multiple document types (employment contracts, offer letters, NDAs)
- **Multi-locale support** (English US/UK, Spanish, German)
- **AI-powered legal validation** before human review
- **Human oversight required** for all generated documents

### Phase 2: Conversational HR Assistant
- **AI-powered chatbot** for instant employee support
- Answers questions about policies, benefits, and procedures
- **Updates employee details** with approval workflows
- **Routes requests** to appropriate departments
- **Context-aware conversations** with chat history

### Phase 3: Proactive Compliance Intelligence
- **Monitors permits, training, and certifications**
- **Automated expiry alerts** with configurable thresholds
- **AI-generated compliance reports** and audit trails
- **Predictive risk analysis** using historical data
- **Audit-ready documentation** at all times

## 🚀 Key Features

✅ **GenAI Integration**: Powered by OpenAI GPT-4 for intelligent document generation, conversational AI, and predictive analytics

✅ **Legal Accuracy**: Multi-layer validation including AI pre-validation and mandatory human review for all legal documents

✅ **Human Oversight**: Built-in approval workflows, review processes, and audit trails ensure human control over critical operations

✅ **Compliance Monitoring**: Proactive tracking of work permits, training, certifications with automated alerts

✅ **Localization**: Support for multiple languages and regional legal requirements

✅ **Audit Trail**: Complete logging of all actions, changes, and decisions for compliance and accountability

## 🏗️ Architecture

```
deriv-ai-hackathon/
├── backend/
│   ├── api/                    # FastAPI route handlers
│   │   ├── document_generation.py   # Phase 1 API
│   │   ├── hr_assistant.py          # Phase 2 API
│   │   └── compliance.py            # Phase 3 API
│   ├── services/               # Business logic & GenAI integration
│   │   ├── document_generator.py    # Document generation service
│   │   ├── hr_assistant.py          # HR chatbot service
│   │   └── compliance_monitor.py    # Compliance monitoring service
│   └── models/                 # Database models
│       └── database.py              # SQLAlchemy models
├── frontend/
│   ├── templates/              # HTML templates
│   │   └── index.html
│   └── static/                 # CSS & JavaScript
│       ├── css/style.css
│       └── js/app.js
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Python dependencies
└── .env.example               # Environment configuration template
```

## 📋 Prerequisites

- Python 3.9+
- OpenAI API key (for GenAI features)
- pip package manager

## 🔧 Installation

1. **Clone the repository**:
```bash
git clone https://github.com/william22288/deriv-ai-hackathon.git
cd deriv-ai-hackathon
```

2. **Create and activate virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: Model to use (default: gpt-4)
- `DATABASE_URL`: Database connection string (default: SQLite)

## 🚀 Running the Application

1. **Start the server**:
```bash
python main.py
```

2. **Access the application**:
Open your browser and navigate to: `http://localhost:8000`

3. **API Documentation**:
Interactive API docs available at: `http://localhost:8000/docs`

## 📖 Usage Guide

### Phase 1: Document Generation

1. Navigate to the "Documents" tab
2. Select document type (contract, offer letter, or NDA)
3. Enter employee ID and select locale
4. Click "Generate Document"
5. Review AI-generated document and validation results
6. **Human Review Required**: Approve or reject the document

**Example API Usage**:
```bash
curl -X POST "http://localhost:8000/api/documents/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "document_type": "employment_contract",
    "employee_id": "EMP001",
    "locale": "en-US"
  }'
```

### Phase 2: HR Assistant

1. Navigate to the "HR Assistant" tab
2. Type your question or use quick help topics
3. Get instant AI-powered responses
4. Request updates or route issues to relevant departments

**Supported Queries**:
- Leave policies and entitlements
- Benefits information
- Personal detail updates
- Equipment requests
- General HR policies

**Example API Usage**:
```bash
curl -X POST "http://localhost:8000/api/assistant/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How much annual leave do I have?",
    "user_id": "user123",
    "session_id": "session_xyz"
  }'
```

### Phase 3: Compliance Intelligence

1. Navigate to the "Compliance" tab
2. View real-time compliance dashboard
3. Add compliance records (permits, training, certifications)
4. Check compliance status to see alerts
5. Generate AI-powered compliance reports
6. Get predictive risk analysis

**Example API Usage**:
```bash
# Add compliance record
curl -X POST "http://localhost:8000/api/compliance/records" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "compliance_type": "work_permit",
    "name": "UK Work Permit",
    "issue_date": "2024-01-01T00:00:00Z",
    "expiry_date": "2025-12-31T23:59:59Z"
  }'

# Check compliance status
curl "http://localhost:8000/api/compliance/check"

# Generate report
curl -X POST "http://localhost:8000/api/compliance/report" \
  -H "Content-Type: application/json" \
  -d '{"report_type": "summary"}'
```

## 🔒 Security Features

- **Human Oversight**: All critical operations require human approval
- **Audit Trails**: Complete logging of all actions and changes
- **Data Privacy**: Sensitive data handling with proper access controls
- **Validation Layers**: Multiple validation steps for legal documents
- **Secure APIs**: CORS-enabled with proper authentication hooks

## 🧪 Testing

### Manual Testing

1. **Document Generation**:
   - Test generating documents in different locales
   - Verify human review workflow
   - Check validation results

2. **HR Assistant**:
   - Test various query types
   - Verify routing functionality
   - Check conversation context

3. **Compliance**:
   - Add test compliance records
   - Verify alert generation
   - Test report generation

### Sample Data

Create sample employees for testing:
```python
# In Python shell or script
from backend.models.database import SessionLocal, Employee
from datetime import datetime

db = SessionLocal()
employee = Employee(
    employee_id="EMP001",
    name="John Doe",
    email="john.doe@company.com",
    department="Engineering",
    role="Senior Developer",
    location="London, UK",
    start_date=datetime(2024, 1, 1)
)
db.add(employee)
db.commit()
```

## 📊 API Endpoints

### Document Generation
- `POST /api/documents/generate` - Generate new document
- `POST /api/documents/approve` - Approve/reject document
- `GET /api/documents/list` - List documents
- `GET /api/documents/{id}` - Get document details

### HR Assistant
- `POST /api/assistant/chat` - Chat with assistant
- `POST /api/assistant/update-details` - Update employee details
- `GET /api/assistant/history/{session_id}` - Get chat history
- `GET /api/assistant/knowledge-base` - Get knowledge base info

### Compliance Intelligence
- `POST /api/compliance/records` - Create compliance record
- `GET /api/compliance/check` - Check compliance status
- `POST /api/compliance/report` - Generate compliance report
- `GET /api/compliance/predict-risks` - Predict compliance risks
- `GET /api/compliance/audit-trail/{id}` - Get audit trail
- `GET /api/compliance/dashboard` - Get dashboard overview

## 🛠️ Technology Stack

- **Backend**: FastAPI (Python)
- **Database**: SQLAlchemy with SQLite (production: PostgreSQL/MySQL)
- **AI/ML**: OpenAI GPT-4
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API Docs**: OpenAPI/Swagger

## 🔮 Future Enhancements

- [ ] Multi-language UI support
- [ ] Email/SMS notification integration
- [ ] Advanced role-based access control (RBAC)
- [ ] Integration with existing HR systems (Workday, BambooHR)
- [ ] Mobile app support
- [ ] Advanced analytics dashboard
- [ ] Voice-based HR assistant
- [ ] Blockchain-based document verification

## 📝 License

This project is part of the Deriv AI Hackathon.

## 👥 Contributing

This is a hackathon project. For contributions, please reach out to the repository owner.

## 📧 Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for the Deriv AI Hackathon**

*Making HR operations truly invisible through AI-powered automation, intelligent assistance, and proactive compliance.*
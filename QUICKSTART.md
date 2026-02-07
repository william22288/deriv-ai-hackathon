# Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/william22288/deriv-ai-hackathon.git
cd deriv-ai-hackathon

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the demo (works without API key!)
python demo.py
```

## Quick Demo

The demo script showcases all three phases:

```bash
python demo.py
```

**Output includes:**
- ✅ Contract generation with AI
- ✅ HR assistant conversations
- ✅ Compliance monitoring and alerts
- ✅ Audit report generation

## Start the API Server

```bash
python main.py
```

The server starts at `http://localhost:8000`

**Interactive Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Run Tests

```bash
# Run all tests
pytest tests/ -v

# Quick test
pytest tests/test_api.py -v
```

**Expected result:** 35 tests passing

## Example API Calls

### 1. Generate a Contract

```bash
curl -X POST http://localhost:8000/api/documents/generate \
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
      "location": "San Francisco",
      "jurisdiction": "United States"
    },
    "template_id": "us_full_time",
    "require_approval": true
  }'
```

### 2. Chat with HR Assistant

```bash
curl -X POST http://localhost:8000/api/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER001",
    "message": "What is the company leave policy?"
  }'
```

### 3. Check Compliance

```bash
curl -X POST http://localhost:8000/api/compliance/check \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 4. Generate Audit Report

```bash
curl -X POST http://localhost:8000/api/compliance/audit-report
```

## Project Structure

```
deriv-ai-hackathon/
├── main.py              # Start here - FastAPI app
├── demo.py              # Quick demo script
├── requirements.txt     # Python dependencies
├── README.md            # Full documentation
├── API.md               # API reference
├── DEPLOYMENT.md        # Deployment guide
├── ARCHITECTURE.md      # System design
├── SUMMARY.md           # Implementation summary
├── src/
│   ├── api/            # REST endpoints
│   ├── models/         # Data models
│   └── services/       # Business logic
└── tests/              # Test suite
```

## Key Features

### Phase 1: Document Generation
- Auto-generates employment contracts
- Multi-jurisdiction support
- Human approval required

### Phase 2: HR Assistant
- AI chatbot for policy questions
- Conversation history
- Sensitive content detection

### Phase 3: Compliance Intelligence
- Proactive monitoring
- Automated alerts
- Audit reports

## Configuration (Optional)

For production use with real OpenAI API:

```bash
# Copy example config
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=your_api_key_here
```

**Note:** The system works without an API key using mock mode for testing!

## Common Issues

**Import Error?**
```bash
# Make sure you're in the venv
source venv/bin/activate
pip install -r requirements.txt
```

**Port 8000 in use?**
```bash
# Use a different port
uvicorn main:app --port 8001
```

**Tests failing?**
```bash
# Update pytest
pip install --upgrade pytest pytest-asyncio
```

## Next Steps

1. ✅ Run the demo: `python demo.py`
2. ✅ Start the API: `python main.py`
3. ✅ Run tests: `pytest tests/ -v`
4. ✅ Read the docs: `README.md`, `API.md`
5. ✅ Try the API at: http://localhost:8000/docs

## Support

- 📖 Documentation: See README.md
- 🐛 Issues: GitHub Issues
- 💬 Questions: Open a discussion

## What's Included

✅ 35 passing tests  
✅ 16 API endpoints  
✅ 3 complete phases  
✅ Multi-jurisdiction support  
✅ GenAI integration  
✅ Human oversight  
✅ Comprehensive docs  
✅ Production-ready code  

## Time to First Success

- **Demo**: < 2 minutes
- **API Server**: < 3 minutes
- **First API Call**: < 5 minutes
- **Full Understanding**: < 30 minutes

Start with `python demo.py` to see everything in action!

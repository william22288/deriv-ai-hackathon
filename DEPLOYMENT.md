# Deployment Guide

## Prerequisites

- Python 3.8 or higher
- pip package manager
- OpenAI API key (for production use)

## Local Development

### 1. Setup Environment

```bash
# Clone repository
git clone https://github.com/william22288/deriv-ai-hackathon.git
cd deriv-ai-hackathon

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy example configuration
cp .env.example .env

# Edit .env and set your OpenAI API key
# OPENAI_API_KEY=your_actual_api_key_here
```

### 3. Run Application

```bash
# Start the server
python main.py

# Or with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Run Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html

# Run specific test file
pytest tests/test_document_service.py -v
```

### 5. Run Demo

```bash
python demo.py
```

## Production Deployment

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t hr-platform .
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key hr-platform
```

### Cloud Deployment Options

#### AWS Elastic Beanstalk

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize and deploy:
```bash
eb init -p python-3.11 hr-platform
eb create hr-platform-env
eb setenv OPENAI_API_KEY=your_key
eb deploy
```

#### Google Cloud Run

```bash
gcloud run deploy hr-platform \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars OPENAI_API_KEY=your_key
```

#### Heroku

```bash
heroku create hr-platform-app
heroku config:set OPENAI_API_KEY=your_key
git push heroku main
```

### Production Considerations

1. **Database**: Replace in-memory storage with PostgreSQL or MongoDB
2. **Authentication**: Implement OAuth2/JWT authentication
3. **Rate Limiting**: Add rate limiting for API endpoints
4. **Monitoring**: Set up logging and monitoring (e.g., Sentry, DataDog)
5. **Secrets Management**: Use AWS Secrets Manager or similar
6. **Load Balancing**: Configure load balancer for high availability
7. **HTTPS**: Enable SSL/TLS certificates
8. **Backup**: Implement database backup strategy

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| OPENAI_API_KEY | OpenAI API key | Yes (production) | test-key-for-demo |
| OPENAI_MODEL | OpenAI model to use | No | gpt-4 |
| DATABASE_URL | Database connection URL | No | sqlite:///./hr_platform.db |
| SECRET_KEY | Secret key for JWT | No | your_secret_key_here |
| DEBUG | Debug mode | No | True |
| APP_NAME | Application name | No | AI-Powered HR Platform |

## Security Best Practices

1. Never commit `.env` file or API keys to version control
2. Use environment variables for sensitive data
3. Implement proper authentication and authorization
4. Validate and sanitize all user inputs
5. Use HTTPS in production
6. Regular security audits and updates
7. Implement rate limiting and CORS policies
8. Monitor for unusual activity

## Monitoring and Logging

### Application Logs

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Health Checks

The application provides health check endpoints:

- `/health` - Basic health check
- `/` - Application information

### Metrics to Monitor

- API response times
- GenAI API usage and costs
- Error rates
- Request volumes
- Compliance alert trends
- Contract generation rates

## Scaling Considerations

### Horizontal Scaling

- Deploy multiple instances behind a load balancer
- Use shared database for state
- Consider Redis for session management

### Vertical Scaling

- Increase memory for GenAI operations
- Optimize database queries
- Cache frequently accessed data

### Database Scaling

- Use connection pooling
- Implement read replicas
- Consider sharding for large datasets

## Troubleshooting

### Common Issues

1. **OpenAI API Error**
   - Check API key is valid
   - Verify account has credits
   - Check rate limits

2. **Import Errors**
   - Ensure all dependencies are installed
   - Check Python version compatibility

3. **Database Connection**
   - Verify DATABASE_URL is correct
   - Check database server is running

4. **Port Already in Use**
   - Change port: `uvicorn main:app --port 8001`
   - Kill existing process: `lsof -ti:8000 | xargs kill`

## Support

For issues and questions:
- GitHub Issues: https://github.com/william22288/deriv-ai-hackathon/issues
- Documentation: See README.md

## License

MIT License - See LICENSE file for details

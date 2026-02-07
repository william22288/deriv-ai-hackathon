"""
AI-Powered Self-Service HR Platform
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from src.api import document_generation, hr_assistant, compliance

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title=os.getenv("APP_NAME", "AI-Powered HR Platform"),
    version=os.getenv("APP_VERSION", "1.0.0"),
    description="An AI-powered self-service HR platform with intelligent document generation, conversational assistant, and proactive compliance monitoring"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(document_generation.router, prefix="/api/documents", tags=["Document Generation"])
app.include_router(hr_assistant.router, prefix="/api/assistant", tags=["HR Assistant"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])

@app.get("/")
async def root():
    """Root endpoint with platform information"""
    return {
        "message": "Welcome to AI-Powered Self-Service HR Platform",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "features": [
            "Intelligent Document Generation",
            "Conversational HR Assistant",
            "Proactive Compliance Intelligence"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "hr-platform"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

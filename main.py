"""
AI-Powered Self-Service HR Platform
Main application entry point with FastAPI
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from pathlib import Path

from backend.api.document_generation import router as doc_router
from backend.api.hr_assistant import router as assistant_router
from backend.api.compliance import router as compliance_router
from backend.models.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    init_db()
    yield
    # Shutdown: cleanup if needed

app = FastAPI(
    title="AI-Powered HR Platform",
    description="Self-service HR platform with GenAI for document generation, conversational assistant, and compliance intelligence",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
templates = Jinja2Templates(directory="frontend/templates")

# Include API routers
app.include_router(doc_router, prefix="/api/documents", tags=["Document Generation"])
app.include_router(assistant_router, prefix="/api/assistant", tags=["HR Assistant"])
app.include_router(compliance_router, prefix="/api/compliance", tags=["Compliance Intelligence"])

@app.get("/")
async def root(request: Request):
    """Main landing page"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "HR Platform is running"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

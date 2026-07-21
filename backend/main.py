from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)
from backend.db.database import engine, Base
import backend.models.models # Ensure models are loaded

# Create all tables in the database (SQLite)
Base.metadata.create_all(bind=engine)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "https://surge-api-4yll.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to the Enterprise AI Sales Intelligence Platform API"}

from backend.api.api import api_router

app.include_router(api_router, prefix=settings.API_V1_STR)

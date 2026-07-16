from fastapi import APIRouter
from backend.api.routes import auth, billing, pipeline, reports, companies

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(billing.router, prefix="/billing", tags=["billing"])
api_router.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])

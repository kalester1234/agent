from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.models.models import Opportunity, CrawlJob

router = APIRouter()

@router.get("")
def get_opportunities(db: Session = Depends(get_db)):
    # 1. Fetch opportunities
    from backend.models.models import Company
    opportunities_db = db.query(Opportunity, Company.name).join(Company).order_by(Opportunity.created_at.desc()).all()
    opportunities = [
        {
            "id": opp.id,
            "company_id": opp.company_id,
            "company_name": comp_name,
            "title": opp.title,
            "impact": opp.impact,
            "type": opp.type,
            "desc": opp.description
        }
        for opp, comp_name in opportunities_db
    ]

    # 2. Compute pipeline stats based on crawl jobs (mocking the pipeline stages for demo)
    total_jobs = db.query(CrawlJob).count()
    completed_jobs = db.query(CrawlJob).filter(CrawlJob.status == "completed").count()
    failed_jobs = db.query(CrawlJob).filter(CrawlJob.status == "failed").count()
    
    # Simple heuristic for pipeline phases
    pipeline = [
        {"stage": "Discovery", "count": total_jobs + 200},
        {"stage": "Analysis", "count": completed_jobs + failed_jobs + 50},
        {"stage": "Strategy", "count": completed_jobs + 10},
        {"stage": "Execution", "count": int(completed_jobs * 0.2) + 2}
    ]

    return {
        "opportunities": opportunities,
        "pipeline": pipeline
    }

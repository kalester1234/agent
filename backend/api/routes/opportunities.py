from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.models.models import Opportunity, CrawlJob

router = APIRouter()

@router.get("")
def get_opportunities(db: Session = Depends(get_db)):
    # 1. Fetch opportunities
    from backend.models.models import Company
    
    latest_opp = db.query(Opportunity).order_by(Opportunity.created_at.desc()).first()
    
    if latest_opp:
        latest_company_id = latest_opp.company_id
        opportunities_db = (
            db.query(Opportunity, Company.name)
            .join(Company)
            .filter(Opportunity.company_id == latest_company_id)
            .order_by(Opportunity.created_at.desc())
            .all()
        )
    else:
        opportunities_db = []

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

@router.post("/{opp_id}/generate-message")
async def generate_outreach(opp_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    from backend.models.models import Company, PainPoint
    from backend.agents.outreach import OutreachAgent
    
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    company = db.query(Company).filter(Company.id == opp.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    # Get pain points
    pain_points_db = db.query(PainPoint).filter(PainPoint.company_id == company.id).all()
    pain_points = [p.title for p in pain_points_db]
    
    agent = OutreachAgent()
    result = await agent.generate_outreach(
        company_name=company.name,
        opportunity_title=opp.title,
        opportunity_desc=opp.description,
        pain_points=pain_points
    )
    
    return result

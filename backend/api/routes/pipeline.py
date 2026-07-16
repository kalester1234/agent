import asyncio
import uuid
import json
from fastapi import APIRouter, Request, Depends, HTTPException
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session

from backend.db.database import get_db
from backend.schemas.pipeline import CompanyInput
from backend.models.models import Company, CrawlJob
from backend.evidence_engine.resolver import CompanyResolver
from backend.workers.tasks import trigger_workflow_task

router = APIRouter()

@router.post("/start")
async def start_pipeline(input_data: CompanyInput, db: Session = Depends(get_db)):
    resolver = CompanyResolver()
    
    # 1. Resolve domain
    try:
        resolved_domain = await resolver.resolve(name=input_data.name, domain=input_data.domain)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to resolve company domain: {str(e)}")
    
    # Determine official name
    official_name = input_data.name or resolved_domain.split(".")[0].capitalize()
    
    # 2. Check if Company already exists, otherwise create it
    company = db.query(Company).filter(Company.domain == resolved_domain).first()
    if not company:
        company = Company(
            name=official_name,
            domain=resolved_domain,
            logo_url=f"https://logo.clearbit.com/{resolved_domain}"
        )
        db.add(company)
        db.commit()
        db.refresh(company)

    # 3. Create CrawlJob
    job_id = str(uuid.uuid4())
    crawl_job = CrawlJob(
        id=job_id,
        company_id=company.id,
        status="pending",
        progress=0.0,
        current_task="Queued"
    )
    db.add(crawl_job)
    db.commit()
    
    # 4. Trigger Celery Workflow
    trigger_workflow_task.delay(job_id, company.id)
    
    return {
        "job_id": job_id,
        "company_id": company.id,
        "status": "started"
    }

@router.get("/status/{job_id}")
def get_pipeline_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": job.id,
        "company_id": job.company_id,
        "status": job.status,
        "progress": job.progress,
        "current_task": job.current_task,
        "error_message": job.error_message
    }

@router.get("/stream/{job_id}")
async def stream_pipeline(job_id: str, request: Request, db: Session = Depends(get_db)):
    async def event_generator():
        last_progress = -1.0
        last_task = ""
        while True:
            if await request.is_disconnected():
                break
            
            # Fetch fresh state
            job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
            if not job:
                yield {
                    "event": "pipeline.failed",
                    "data": json.dumps({"error": "Job not found"})
                }
                break
            
            # Yield event only on state changes
            if job.progress != last_progress or job.current_task != last_task:
                last_progress = job.progress
                last_task = job.current_task or ""
                yield {
                    "event": "message",
                    "data": json.dumps({
                        "event": "job.progress",
                        "data": {
                            "job_id": job.id,
                            "company_id": job.company_id,
                            "status": job.status,
                            "progress": job.progress,
                            "current_task": job.current_task,
                            "error_message": job.error_message
                        }
                    })
                }
            
            if job.status in ["completed", "failed"]:
                # Standard event payload to notify completion to the UI
                yield {
                    "event": "message",
                    "data": json.dumps({
                        "event": "report.completed",
                        "data": {
                            "status": job.status,
                            "company_id": job.company_id
                        }
                    })
                }
                break
                
            await asyncio.sleep(1.0)
            db.refresh(job)

    return EventSourceResponse(event_generator())

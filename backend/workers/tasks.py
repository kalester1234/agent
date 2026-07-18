import asyncio
import logging
from celery import chain
from backend.core.celery_app import celery_app
from backend.db.database import SessionLocal
from backend.models.models import Company, CrawlJob
from backend.collectors.collectors import (
    CompanyDiscoveryCollector, WebsiteCrawlerCollector, TechDetectorCollector,
    SEOCollector, PerformanceCollector, NewsCollector, SocialCollector,
    ReviewCollector, HiringCollector, CompetitorCollector, FinancialCollector
)
from backend.collectors.advanced import ExecutiveCollector, PricingCollector, ComplianceCollector

logger = logging.getLogger(__name__)

# Hard per-collector timeout in seconds
COLLECTOR_TIMEOUT = 45

def get_db():
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        logger.error(f"Error opening DB session: {e}")
        raise

def run_async(coro):
    """Always creates a fresh event loop — safe inside Celery worker threads."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()

def update_job_progress(db, job_id: str, progress: float, current_task: str, status: str = "processing", error_msg: str = None):
    job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
    if job:
        job.progress = progress
        job.current_task = current_task
        job.status = status
        if error_msg:
            job.error_message = error_msg
        db.commit()

async def run_with_timeout(coro, timeout: int = COLLECTOR_TIMEOUT, label: str = "collector"):
    """Runs a coroutine with a hard timeout. Logs but never raises."""
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        logger.warning(f"[TIMEOUT] {label} timed out after {timeout}s — skipping.")
    except Exception as e:
        logger.error(f"[ERROR] {label} failed: {e}")

@celery_app.task(name="backend.workers.tasks.discover_company_task", bind=True, max_retries=2, default_retry_delay=5)
def discover_company_task(self, job_id: str, company_id: int):
    logger.info(f"Task: Discover Company for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 10.0, "Company Discovery")
        run_async(run_with_timeout(CompanyDiscoveryCollector(db, company_id).run(), label="CompanyDiscovery"))
        update_job_progress(db, job_id, 20.0, "Discovery Completed")
    except Exception as e:
        logger.error(f"Error in discover_company_task: {e}")
        update_job_progress(db, job_id, 20.0, "Discovery Failed", error_msg=str(e))
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.website_and_tech_task", bind=True, max_retries=2, default_retry_delay=5)
def website_and_tech_task(self, job_id: str, company_id: int):
    logger.info(f"Task: Website & Tech Detection for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 30.0, "Website Intelligence")

        async def run_all():
            await asyncio.gather(
                run_with_timeout(WebsiteCrawlerCollector(db, company_id).run(), label="WebsiteCrawler"),
                run_with_timeout(TechDetectorCollector(db, company_id).run(), label="TechDetector"),
                run_with_timeout(PerformanceCollector(db, company_id).run(), label="PerformanceCollector"),
                run_with_timeout(ExecutiveCollector(db, company_id).run(), label="ExecutiveCollector"),
                run_with_timeout(PricingCollector(db, company_id).run(), label="PricingCollector"),
                run_with_timeout(ComplianceCollector(db, company_id).run(), label="ComplianceCollector"),
            )

        run_async(run_all())
        update_job_progress(db, job_id, 60.0, "Website & Tech Completed")
    except Exception as e:
        logger.error(f"Error in website_and_tech_task: {e}")
        update_job_progress(db, job_id, 60.0, "Website/Tech Failed", error_msg=str(e))
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.social_and_news_task", bind=True, max_retries=2, default_retry_delay=5)
def social_and_news_task(self, job_id: str, company_id: int):
    logger.info(f"Task: Social & News Aggregation for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 75.0, "Social & News Aggregation")

        async def run_all():
            await asyncio.gather(
                run_with_timeout(SocialCollector(db, company_id).run(), label="SocialCollector"),
                run_with_timeout(NewsCollector(db, company_id).run(), label="NewsCollector"),
                run_with_timeout(ReviewCollector(db, company_id).run(), label="ReviewCollector"),
            )

        run_async(run_all())
        update_job_progress(db, job_id, 85.0, "Social & News Completed")
    except Exception as e:
        logger.error(f"Error in social_and_news_task: {e}")
        update_job_progress(db, job_id, 85.0, "Social/News Failed", error_msg=str(e))
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.seo_and_tech_task", bind=True, max_retries=2, default_retry_delay=5)
def seo_and_tech_task(self, job_id: str, company_id: int):
    """Legacy task kept for backwards compatibility."""
    db = get_db()
    try:
        update_job_progress(db, job_id, 50.0, "SEO & Tech Audit")
        run_async(run_with_timeout(SEOCollector(db, company_id).run(), label="SEOCollector"))
        update_job_progress(db, job_id, 65.0, "SEO Audited")
    except Exception as e:
        logger.error(f"Error in seo_and_tech_task: {e}")
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.hiring_and_market_task", bind=True, max_retries=2, default_retry_delay=5)
def hiring_and_market_task(self, job_id: str, company_id: int):
    logger.info(f"Task: Hiring and Market Analysis for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 90.0, "Hiring, Competitors & Funding")

        # Run all three concurrently with individual hard timeouts
        async def run_all():
            await asyncio.gather(
                run_with_timeout(HiringCollector(db, company_id).run(), timeout=COLLECTOR_TIMEOUT, label="HiringCollector"),
                run_with_timeout(CompetitorCollector(db, company_id).run(), timeout=COLLECTOR_TIMEOUT, label="CompetitorCollector"),
                run_with_timeout(FinancialCollector(db, company_id).run(), timeout=COLLECTOR_TIMEOUT, label="FinancialCollector"),
            )

        run_async(run_all())
    except Exception as e:
        logger.error(f"Error in hiring_and_market_task: {e}")
    finally:
        # Move on to pain points, don't complete at 100% yet
        try:
            update_job_progress(db, job_id, 95.0, "Market Analysis Completed")
        except Exception as fe:
            logger.error(f"Failed to mark hiring job: {fe}")
        db.close()

@celery_app.task(name="backend.workers.tasks.seo_collector_task", bind=True, max_retries=2, default_retry_delay=5)
def seo_collector_task(self, job_id: str, company_id: int):
    """Module 4: SEO Collector."""
    logger.info(f"Task: SEO Collection for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 65.0, "SEO Analysis")
        run_async(run_with_timeout(SEOCollector(db, company_id).run(), label="SEOCollector"))
        update_job_progress(db, job_id, 75.0, "SEO Completed")
    except Exception as e:
        logger.error(f"Error in seo_collector_task: {e}")
        update_job_progress(db, job_id, 75.0, "SEO Failed", error_msg=str(e))
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.pain_point_analysis_task", bind=True, max_retries=2, default_retry_delay=5)
def pain_point_analysis_task(self, job_id: str, company_id: int):
    """Module: Automatic AI Pain Point Analysis"""
    logger.info(f"Task: AI Pain Point Analysis for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 95.0, "AI Synthesizing Pain Points")
        from backend.collectors.pain_point_collector import run_pain_point_analysis
        
        async def run_ai_analysis():
            # Long timeout for the LLM call (e.g. 60 seconds)
            await run_with_timeout(run_pain_point_analysis(company_id, db), timeout=60, label="PainPointAnalysis")
            
        run_async(run_ai_analysis())
    except Exception as e:
        logger.error(f"Error in pain_point_analysis_task: {e}")
    finally:
        try:
            update_job_progress(db, job_id, 98.0, "Pain Points Completed")
        except Exception as fe:
            logger.error(f"Failed to mark pain points complete: {fe}")
        db.close()


@celery_app.task(name="backend.workers.tasks.deep_analysis_task", bind=True, max_retries=2, default_retry_delay=5)
def deep_analysis_task(self, job_id: str, company_id: int):
    """Module 9: Deep Company Study Generation"""
    logger.info(f"Task: Deep Company Analysis for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 98.0, "Generating Deep Study")
        from backend.collectors.collectors import StudyCollector
        
        async def run_ai_study():
            await run_with_timeout(StudyCollector(db, company_id).run(), timeout=90, label="StudyCollector")
            
        run_async(run_ai_study())
    except Exception as e:
        logger.error(f"Error in deep_analysis_task: {e}")
    finally:
        try:
            update_job_progress(db, job_id, 99.0, "Deep Study Completed")
        except Exception as fe:
            logger.error(f"Failed to mark deep study complete: {fe}")
        db.close()


@celery_app.task(name="backend.workers.tasks.opportunity_generation_task", bind=True, max_retries=2, default_retry_delay=5)
def opportunity_generation_task(self, job_id: str, company_id: int):
    """Module 10: Opportunity Generation"""
    logger.info(f"Task: Generating Opportunities for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 99.0, "Generating Opportunities")
        from backend.collectors.collectors import OpportunityCollector
        
        async def run_ai_opps():
            await run_with_timeout(OpportunityCollector(db, company_id).run(), timeout=60, label="OpportunityCollector")
            
        run_async(run_ai_opps())
    except Exception as e:
        logger.error(f"Error in opportunity_generation_task: {e}")
    finally:
        try:
            update_job_progress(db, job_id, 100.0, "Completed", status="completed")
            logger.info(f"Job {job_id} marked completed for company {company_id}")
        except Exception as fe:
            logger.error(f"Failed to mark job complete: {fe}")
        db.close()


@celery_app.task(name="backend.workers.tasks.trigger_workflow_task")
def trigger_workflow_task(job_id: str, company_id: int):
    """Orchestrator: discover -> website+tech -> SEO -> social+news -> hiring+market -> AI pain points."""
    workflow = chain(
        discover_company_task.si(job_id, company_id),
        website_and_tech_task.si(job_id, company_id),
        seo_collector_task.si(job_id, company_id),
        social_and_news_task.si(job_id, company_id),
        hiring_and_market_task.si(job_id, company_id),
        pain_point_analysis_task.si(job_id, company_id),
        deep_analysis_task.si(job_id, company_id),
        opportunity_generation_task.si(job_id, company_id)
    )
    workflow.delay()
    return {"job_id": job_id, "status": "workflow_queued"}

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

logger = logging.getLogger(__name__)

def get_db():
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        logger.error(f"Error opening DB session: {e}")
        raise

def update_job_progress(db, job_id: str, progress: float, current_task: str, status: str = "processing", error_msg: str = None):
    job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
    if job:
        job.progress = progress
        job.current_task = current_task
        job.status = status
        if error_msg:
            job.error_message = error_msg
        db.commit()

@celery_app.task(name="backend.workers.tasks.discover_company_task", bind=True, max_retries=3, default_retry_delay=10)
def discover_company_task(self, job_id: str, company_id: int):
    logger.info(f"Task: Discover Company for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 10.0, "Company Discovery")
        collector = CompanyDiscoveryCollector(db, company_id)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(collector.run())
        update_job_progress(db, job_id, 20.0, "Discovery Completed")
    except Exception as e:
        logger.error(f"Error in discover_company_task: {e}")
        update_job_progress(db, job_id, 20.0, "Discovery Failed", error_msg=str(e))
        self.retry(exc=e)
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.website_and_tech_task", bind=True, max_retries=3, default_retry_delay=10)
def website_and_tech_task(self, job_id: str, company_id: int):
    """Module 2 (Website Intelligence) + Module 3 (Tech Detection) run concurrently."""
    logger.info(f"Task: Website & Tech Detection for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 30.0, "Website Intelligence")

        async def run_both():
            website_col = WebsiteCrawlerCollector(db, company_id)
            tech_col = TechDetectorCollector(db, company_id)
            perf_col = PerformanceCollector(db, company_id)
            # Run concurrently — website crawl, tech detection, and performance
            await asyncio.gather(
                website_col.run(),
                tech_col.run(),
                perf_col.run(),
                return_exceptions=True
            )

        loop = asyncio.get_event_loop()
        loop.run_until_complete(run_both())
        update_job_progress(db, job_id, 60.0, "Website & Tech Completed")
    except Exception as e:
        logger.error(f"Error in website_and_tech_task: {e}")
        update_job_progress(db, job_id, 60.0, "Website/Tech Failed", error_msg=str(e))
        self.retry(exc=e)
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.social_and_news_task", bind=True, max_retries=3, default_retry_delay=10)
def social_and_news_task(self, job_id: str, company_id: int):
    logger.info(f"Task: Social Scraping for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 70.0, "Social Aggregation")

        social_col = SocialCollector(db, company_id)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(social_col.run())

        update_job_progress(db, job_id, 100.0, "Completed", status="completed")
    except Exception as e:
        logger.error(f"Error in social_and_news_task: {e}")
        update_job_progress(db, job_id, 100.0, "Social Scraping Failed", status="failed", error_msg=str(e))
        self.retry(exc=e)
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.seo_and_tech_task", bind=True, max_retries=3, default_retry_delay=10)
def seo_and_tech_task(self, job_id: str, company_id: int):
    """Legacy task kept for backwards compatibility."""
    logger.info(f"Task: SEO and Tech Detection for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 50.0, "SEO & Tech Audit")
        seo_col = SEOCollector(db, company_id)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(seo_col.run())
        update_job_progress(db, job_id, 65.0, "SEO Audited")
    except Exception as e:
        logger.error(f"Error in seo_and_tech_task: {e}")
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.hiring_and_market_task", bind=True, max_retries=3, default_retry_delay=10)
def hiring_and_market_task(self, job_id: str, company_id: int):
    logger.info(f"Task: Hiring and Market Analysis for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 90.0, "Hiring, Competitors & Funding")
        hiring_col = HiringCollector(db, company_id)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(hiring_col.run())
        competitors_col = CompetitorCollector(db, company_id)
        loop.run_until_complete(competitors_col.run())
        funding_col = FinancialCollector(db, company_id)
        loop.run_until_complete(funding_col.run())
        update_job_progress(db, job_id, 100.0, "Completed", status="completed")
    except Exception as e:
        logger.error(f"Error in hiring_and_market_task: {e}")
        update_job_progress(db, job_id, 100.0, "Hiring/Market Failed", status="failed", error_msg=str(e))
        self.retry(exc=e)
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.seo_collector_task", bind=True, max_retries=3, default_retry_delay=10)
def seo_collector_task(self, job_id: str, company_id: int):
    """Module 4: SEO Collector — robots, sitemap, meta, schema, OG, headings, broken links."""
    logger.info(f"Task: SEO Collection for ID: {company_id}")
    db = get_db()
    try:
        update_job_progress(db, job_id, 65.0, "SEO Analysis")
        from backend.collectors.collectors import SEOCollector
        seo_col = SEOCollector(db, company_id)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(seo_col.run())
        update_job_progress(db, job_id, 75.0, "SEO Completed")
    except Exception as e:
        logger.error(f"Error in seo_collector_task: {e}")
        update_job_progress(db, job_id, 75.0, "SEO Failed", error_msg=str(e))
        self.retry(exc=e)
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.trigger_workflow_task")
def trigger_workflow_task(job_id: str, company_id: int):
    """Orchestrator: discover → website+tech (concurrent) → SEO → social."""
    workflow = chain(
        discover_company_task.si(job_id, company_id),
        website_and_tech_task.si(job_id, company_id),
        seo_collector_task.si(job_id, company_id),
        social_and_news_task.si(job_id, company_id)
    )
    workflow.delay()
    return {"job_id": job_id, "status": "workflow_queued"}

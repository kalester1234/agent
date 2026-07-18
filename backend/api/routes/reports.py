from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.models.models import (
    Company, CompanyProfile, CompanyWebsite, WebsitePage,
    TechnologyStack, SEOData, PerformanceMetrics, SocialProfile,
    NewsArticle, Review, Job, Competitor, Funding, CrawlJob
)

router = APIRouter()

@router.get("")
def get_reports(db: Session = Depends(get_db)):
    companies = db.query(Company).order_by(Company.created_at.desc()).all()
    results = []
    for c in companies:
        # Get status from latest crawl job
        job = db.query(CrawlJob).filter(CrawlJob.company_id == c.id).order_by(CrawlJob.created_at.desc()).first()
        status = job.status if job else "completed"
        results.append({
            "id": c.id,
            "company_name": c.name,
            "company_domain": c.domain,
            "created_at": c.created_at,
            "status": status
        })
    return results

@router.get("/{report_id}")
def get_report(report_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == report_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    job = db.query(CrawlJob).filter(CrawlJob.company_id == report_id).order_by(CrawlJob.created_at.desc()).first()
    status = job.status if job else "completed"

    # Assemble legacy JSON format
    profile = company.profile
    pages = company.pages
    techs = company.technology_stack
    seo = company.seo_data
    perf = company.performance_metrics
    socials = company.social_profiles
    news = company.news_articles
    reviews = company.reviews
    jobs = company.jobs
    competitors = company.competitors
    fundings = company.funding

    assembled_report = {
        "company": {
            "official_name": company.name,
            "official_domain": company.domain,
            "logo_url": company.logo_url,
            "industry": profile.industry if profile else "Unknown",
            "headquarters": profile.headquarters if profile else "Unknown",
            "founded_year": profile.founded_year if profile else None,
            "employee_count": profile.employee_count if profile else None,
            "revenue_estimate": profile.revenue_estimate if profile else None,
            "business_model": profile.business_model if profile else None,
            "description": profile.description if profile else "",
            "founders": profile.founders if profile else None,
            "confidence_score": 1.0,
            "country": profile.headquarters if profile else "Unknown"
        },
        "website": {
            "success": True if pages else False,
            "url": f"https://{company.domain}",
            "text": pages[0].content_text if pages else "",
            "pages": [
                {
                    "url": p.url,
                    "title": p.title,
                    "meta_description": p.meta_description
                }
                for p in pages
            ]
        },
        "social": {
            "success": True if socials else False,
            "profiles": [
                {
                    "platform": s.platform,
                    "url": s.url,
                    "follower_count": s.follower_count
                }
                for s in socials
            ]
        },
        "analysis": {
            "tech_stack": [t.name for t in techs],
            "seo": {
                "score": seo.score if seo else 0,
                "headings": seo.headings_structure if seo else {}
            },
            "performance": {
                "score": perf.performance_score if perf else 0,
                "weight": f"{(perf.page_weight_bytes / 1024) if perf else 0:.1f} KB"
            },
            "news": [
                {
                    "title": n.headline,
                    "source": n.source,
                    "published": n.published_date.strftime("%Y-%m-%d") if n.published_date else None
                }
                for n in news
            ],
            "reviews": [
                {
                    "platform": r.platform,
                    "rating": r.rating,
                    "text": r.review_text
                }
                for r in reviews
            ],
            "jobs": [
                {
                    "title": j.title,
                    "department": j.department,
                    "location": j.location
                }
                for j in jobs
            ],
            "competitors": [c.competitor_name for c in competitors],
            "funding": [
                {
                    "stage": f.stage,
                    "amount": f.amount,
                    "investors": f.investors
                }
                for f in fundings
            ]
        }
    }

    return {
        "id": company.id,
        "company_name": company.name,
        "company_domain": company.domain,
        "created_at": company.created_at,
        "status": status,
        "report": assembled_report
    }

@router.delete("/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == report_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db.delete(company)
    db.commit()
    return {"status": "success", "message": "Report deleted successfully"}

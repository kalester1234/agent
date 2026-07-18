from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional, Dict, Any

from backend.db.database import get_db
from backend.models.models import (
    Company, CompanyProfile, CompanyWebsite, WebsitePage,
    TechnologyStack, SEOData, PerformanceMetrics, SocialProfile,
    NewsArticle, Review, Job, Competitor, Funding, Acquisition, IPOInfo,
    Source, Evidence, CrawlJob, PainPoint
)

router = APIRouter()

@router.get("/search")
def search_companies(
    q: Optional[str] = Query(None, description="Search by name, domain, or industry"),
    industry: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    min_employees: Optional[int] = Query(None),
    max_employees: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Company)
    
    # Apply filters
    if q:
        search_filter = or_(
            Company.name.ilike(f"%{q}%"),
            Company.domain.ilike(f"%{q}%")
        )
        # Also search in profile description/industry if exists
        query = query.join(CompanyProfile, isouter=True).filter(
            or_(
                search_filter,
                CompanyProfile.industry.ilike(f"%{q}%"),
                CompanyProfile.description.ilike(f"%{q}%")
            )
        )
    
    if industry:
        query = query.join(CompanyProfile, isouter=True).filter(CompanyProfile.industry.ilike(f"%{industry}%"))
        
    if location:
        query = query.join(CompanyProfile, isouter=True).filter(
            or_(
                CompanyProfile.headquarters.ilike(f"%{location}%"),
                CompanyProfile.locations.ilike(f"%{location}%")
            )
        )
        
    if min_employees is not None or max_employees is not None:
        query = query.join(CompanyProfile, isouter=True)
        if min_employees is not None:
            query = query.filter(CompanyProfile.employee_count >= min_employees)
        if max_employees is not None:
            query = query.filter(CompanyProfile.employee_count <= max_employees)

    companies = query.order_by(Company.created_at.desc()).all()
    
    results = []
    for c in companies:
        results.append({
            "id": c.id,
            "name": c.name,
            "domain": c.domain,
            "logo_url": c.logo_url,
            "industry": c.profile.industry if c.profile else None,
            "employee_count": c.profile.employee_count if c.profile else None,
            "headquarters": c.profile.headquarters if c.profile else None,
            "created_at": c.created_at
        })
    return results

@router.get("/{company_id}")
def get_company_basic(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get latest crawl job status if exists
    crawl_job = db.query(CrawlJob).filter(CrawlJob.company_id == company_id).order_by(CrawlJob.created_at.desc()).first()
    
    return {
        "id": company.id,
        "name": company.name,
        "domain": company.domain,
        "logo_url": company.logo_url,
        "status": crawl_job.status if crawl_job else "completed",
        "progress": crawl_job.progress if crawl_job else 100.0,
        "current_task": crawl_job.current_task if crawl_job else "Completed",
        "created_at": company.created_at
    }

@router.get("/{company_id}/overview")
def get_company_overview(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    profile = company.profile
    facts = company.facts

    fact_list = []
    for f in facts:
        fact_list.append({
            "fact_name": f.fact_name,
            "fact_value": f.fact_value,
            "source": f.source,
            "url": f.url,
            "confidence": f.confidence
        })

    if not profile:
        return {
            "founded_year": None,
            "employee_count": None,
            "industry": "Unknown",
            "headquarters": "Unknown",
            "country": "Unknown",
            "locations": None,
            "revenue_estimate": None,
            "business_model": "Unknown",
            "description": "",
            "founders": None,
            "facts": fact_list
        }
        
    return {
        "founded_year": profile.founded_year,
        "employee_count": profile.employee_count,
        "industry": profile.industry,
        "headquarters": profile.headquarters,
        "country": profile.country or "United States",
        "locations": profile.locations,
        "revenue_estimate": profile.revenue_estimate,
        "business_model": profile.business_model,
        "description": profile.description,
        "founders": profile.founders,
        "products": profile.products or [],
        "services": profile.services or [],
        "facts": fact_list
    }

@router.get("/{company_id}/website")
def get_company_website(company_id: int, db: Session = Depends(get_db)):
    pages = db.query(WebsitePage).filter(WebsitePage.company_id == company_id).all()
    return [
        {
            "id": p.id,
            "url": p.url,
            "title": p.title,
            "meta_description": p.meta_description,
            "page_type": p.page_type or "other",
            "content_snippet": p.content_text[:300] if p.content_text else "",
            "structured_data": p.structured_data
        }
        for p in pages
    ]

@router.get("/{company_id}/technology")
def get_company_technology(company_id: int, db: Session = Depends(get_db)):
    techs = db.query(TechnologyStack).filter(TechnologyStack.company_id == company_id).all()
    grouped = {}
    for t in techs:
        if t.category not in grouped:
            grouped[t.category] = []
        grouped[t.category].append({
            "name": t.name,
            "version": t.version,
            "detected_at": t.detected_at
        })
    return grouped

@router.get("/{company_id}/seo")
def get_company_seo(company_id: int, db: Session = Depends(get_db)):
    seo = db.query(SEOData).filter(SEOData.company_id == company_id).first()
    if not seo:
        raise HTTPException(status_code=404, detail="SEO data not found for this company")
    return {
        "meta_title":           seo.meta_title,
        "meta_description":     seo.meta_description_text,
        "sitemap_url":          seo.sitemap_url,
        "sitemap_urls":         seo.sitemap_urls or [],
        "robots_txt":           seo.robots_txt,
        "robots_rules":         seo.robots_rules or [],
        "canonical_url":        seo.canonical_url,
        "schema_org_json":      seo.schema_org_json or [],
        "schema_types":         seo.schema_types or [],
        "open_graph_tags":      seo.open_graph_tags or {},
        "twitter_card_tags":    seo.twitter_card_tags or {},
        "headings_structure":   seo.headings_structure or {},
        "broken_links_count":   seo.broken_links_count,
        "broken_links_detail":  seo.broken_links_detail or [],
        "score":                seo.score,
        "score_breakdown":      seo.score_breakdown or {},
        "confidence_score":     seo.confidence_score,
        "evidence_summary":     seo.evidence_summary or []
    }

@router.get("/{company_id}/news")
def get_company_news(company_id: int, db: Session = Depends(get_db)):
    articles = db.query(NewsArticle).filter(NewsArticle.company_id == company_id).all()
    return [
        {
            "id": a.id,
            "headline": a.headline,
            "source": a.source,
            "published_date": a.published_date,
            "category": a.category,
            "url": a.url,
            "summary": a.summary,
            "full_content": a.full_content,
            "sentiment": a.sentiment,
        }
        for a in articles
    ]

@router.get("/{company_id}/study")
def get_company_study(company_id: int, db: Session = Depends(get_db)):
    from backend.models.models import CompanyStudy
    study = db.query(CompanyStudy).filter(CompanyStudy.company_id == company_id).first()
    if not study:
        return None
    return {
        "executive_summary": study.executive_summary,
        "market_position": study.market_position,
        "risks_and_opportunities": study.risks_and_opportunities,
        "conclusion": study.conclusion,
        "generated_at": study.generated_at
    }

@router.get("/{company_id}/social")
def get_company_social(company_id: int, db: Session = Depends(get_db)):
    profiles = db.query(SocialProfile).filter(SocialProfile.company_id == company_id).all()
    return [
        {
            "id": p.id,
            "platform": p.platform,
            "url": p.url,
            "follower_count": p.follower_count,
            "posting_frequency": p.posting_frequency,
            "latest_posts": p.latest_posts,
            "engagement_score": p.engagement_score,
        }
        for p in profiles
    ]

@router.get("/{company_id}/reviews")
def get_company_reviews(company_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.company_id == company_id).all()
    return [
        {
            "id": r.id,
            "platform": r.platform,
            "rating": r.rating,
            "review_text": r.review_text,
            "date": r.date,
            "source": r.source,
            "reviewer_metadata": r.reviewer_metadata,
        }
        for r in reviews
    ]

@router.get("/{company_id}/executives")
def get_company_executives(company_id: int, db: Session = Depends(get_db)):
    from backend.models.models import KeyExecutive
    executives = db.query(KeyExecutive).filter(KeyExecutive.company_id == company_id).all()
    return [{"name": e.name, "title": e.title, "linkedin_url": e.linkedin_url} for e in executives]

@router.get("/{company_id}/pricing")
def get_company_pricing(company_id: int, db: Session = Depends(get_db)):
    from backend.models.models import PricingTier
    tiers = db.query(PricingTier).filter(PricingTier.company_id == company_id).all()
    return [{"tier_name": t.tier_name, "price": t.price, "features": t.features} for t in tiers]

@router.get("/{company_id}/compliance")
def get_company_compliance(company_id: int, db: Session = Depends(get_db)):
    from backend.models.models import CompliancePosture
    c = db.query(CompliancePosture).filter(CompliancePosture.company_id == company_id).first()
    if not c:
        return None
    return {
        "soc2": c.soc2, "gdpr": c.gdpr, "hipaa": c.hipaa, 
        "iso27001": c.iso27001, "other_certifications": c.other_certifications
    }

@router.get("/{company_id}/hiring")
def get_company_hiring(company_id: int, db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.company_id == company_id).all()
    return [
        {
            "id": j.id,
            "title": j.title,
            "department": j.department,
            "location": j.location,
            "skills": j.skills,
            "hiring_trends": j.hiring_trends,
            "description": j.description,
            "posted_at": j.posted_at,
        }
        for j in jobs
    ]

@router.get("/{company_id}/competitors")
def get_company_competitors(company_id: int, db: Session = Depends(get_db)):
    comps = db.query(Competitor).filter(Competitor.company_id == company_id).all()
    return [
        {
            "id": c.id,
            "competitor_name": c.competitor_name,
            "industry": c.industry,
            "products": c.products,
            "positioning": c.positioning,
        }
        for c in comps
    ]

@router.get("/{company_id}/financial")
def get_company_financial(company_id: int, db: Session = Depends(get_db)):
    funding = db.query(Funding).filter(Funding.company_id == company_id).all()
    acquisitions = db.query(Acquisition).filter(Acquisition.company_id == company_id).all()
    ipo = db.query(IPOInfo).filter(IPOInfo.company_id == company_id).first()
    return {
        "funding": [
            {
                "id": f.id,
                "stage": f.stage,
                "amount": f.amount,
                "currency": f.currency,
                "date": f.date,
                "investors": f.investors,
            }
            for f in funding
        ],
        "acquisitions": [
            {
                "id": a.id,
                "target_name": a.target_name,
                "amount": a.amount,
                "currency": a.currency,
                "date": a.date,
                "acquirer_name": a.acquirer_name,
            }
            for a in acquisitions
        ],
        "ipo": {
            "id": ipo.id if ipo else None,
            "status": ipo.status if ipo else None,
            "expected_date": ipo.expected_date if ipo else None,
            "valuation": ipo.valuation if ipo else None,
            "currency": ipo.currency if ipo else None,
        } if ipo else None,
    }

@router.get("/{company_id}/performance")
def get_company_performance(company_id: int, db: Session = Depends(get_db)):
    metrics = db.query(PerformanceMetrics).filter(PerformanceMetrics.company_id == company_id).first()
    if not metrics:
        raise HTTPException(status_code=404, detail="Performance metrics not found")
    return {
        "performance_score": metrics.performance_score,
        "page_weight_bytes": metrics.page_weight_bytes,
        "core_web_vitals": metrics.core_web_vitals,
        "image_optimization_score": metrics.image_optimization_score,
        "compression_enabled": metrics.compression_enabled,
        "caching_score": metrics.caching_score,
        "confidence_score": metrics.confidence_score,
        "evidence_summary": metrics.evidence_summary or []
    }

@router.get("/{company_id}/social")
def get_company_social(company_id: int, db: Session = Depends(get_db)):
    profiles = db.query(SocialProfile).filter(SocialProfile.company_id == company_id).all()
    return [
        {
            "id": p.id,
            "platform": p.platform,
            "url": p.url,
            "follower_count": p.follower_count,
            "posting_frequency": p.posting_frequency,
            "engagement_score": p.engagement_score
        }
        for p in profiles
    ]

@router.get("/{company_id}/news")
def get_company_news(company_id: int, db: Session = Depends(get_db)):
    news = db.query(NewsArticle).filter(NewsArticle.company_id == company_id).order_by(NewsArticle.published_date.desc()).all()
    return [
        {
            "id": n.id,
            "headline": n.headline,
            "source": n.source,
            "published_date": n.published_date,
            "category": n.category,
            "url": n.url,
            "summary": n.summary,
            "sentiment": n.sentiment
        }
        for n in news
    ]

@router.get("/{company_id}/reviews")
def get_company_reviews(company_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.company_id == company_id).order_by(Review.date.desc()).all()
    return [
        {
            "id": r.id,
            "platform": r.platform,
            "rating": r.rating,
            "review_text": r.review_text,
            "date": r.date,
            "source": r.source,
            "reviewer_metadata": r.reviewer_metadata
        }
        for r in reviews
    ]

@router.get("/{company_id}/jobs")
def get_company_jobs(company_id: int, db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.company_id == company_id).order_by(Job.posted_at.desc()).all()
    return [
        {
            "id": j.id,
            "title": j.title,
            "department": j.department,
            "location": j.location,
            "skills": j.skills,
            "hiring_trends": j.hiring_trends,
            "description": j.description,
            "posted_at": j.posted_at
        }
        for j in jobs
    ]

@router.get("/{company_id}/competitors")
def get_company_competitors(company_id: int, db: Session = Depends(get_db)):
    competitors = db.query(Competitor).filter(Competitor.company_id == company_id).all()
    fundings = db.query(Funding).filter(Funding.company_id == company_id).order_by(Funding.date.desc()).all()
    
    comp_list = [
        {
            "id": c.id,
            "name": c.competitor_name,
            "industry": c.industry,
            "products": c.products,
            "positioning": c.positioning
        }
        for c in competitors
    ]
    
    funding_list = [
        {
            "id": f.id,
            "stage": f.stage,
            "amount": f.amount,
            "currency": f.currency,
            "date": f.date,
            "investors": f.investors
        }
        for f in fundings
    ]

    return {
        "competitors": comp_list,
        "funding": funding_list
    }

@router.get("/{company_id}/sources")
def get_company_sources(company_id: int, db: Session = Depends(get_db)):
    sources = db.query(Source).filter(Source.company_id == company_id).all()
    evidence = db.query(Evidence).filter(Evidence.company_id == company_id).all()
    return {
        "sources": [
            {
                "url": s.url,
                "reliability_score": s.reliability_score,
                "last_fetched": s.last_fetched
            }
            for s in sources
        ],
        "evidence": [
            {
                "category": e.category,
                "source_url": e.source_url,
                "confidence": e.confidence,
                "raw_evidence": e.raw_evidence[:200] + "..." if len(e.raw_evidence) > 200 else e.raw_evidence
            }
            for e in evidence
        ]
    }

@router.get("/{company_id}/pain-points")
def get_pain_points(company_id: int, db: Session = Depends(get_db)):
    pps = db.query(PainPoint).filter(PainPoint.company_id == company_id).order_by(PainPoint.created_at.desc()).all()
    return [
        {
            "id": pp.id,
            "category": pp.category,
            "title": pp.title,
            "description": pp.description,
            "severity": pp.severity,
            "source": pp.source,
            "evidence": pp.evidence,
            "created_at": pp.created_at,
        }
        for pp in pps
    ]

@router.post("/{company_id}/pain-points/analyze")
async def analyze_pain_points(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    from backend.collectors.pain_point_collector import run_pain_point_analysis
    results = await run_pain_point_analysis(company_id, db)
    return {
        "status": "ok",
        "count": len(results),
        "pain_points": [
            {
                "id": pp.id,
                "category": pp.category,
                "title": pp.title,
                "description": pp.description,
                "severity": pp.severity,
                "source": pp.source,
                "evidence": pp.evidence,
            }
            for pp in results
        ]
    }

from pydantic import BaseModel
from fastapi.responses import StreamingResponse
class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]

@router.post("/{company_id}/chat")
async def chat_with_company(company_id: int, req: ChatRequest, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    from backend.agents.chat_agent import ChatAgent
    agent = ChatAgent()
    
    # Return a StreamingResponse directly from the generator
    return StreamingResponse(
        agent.chat_stream(company_id, db, req.messages),
        media_type="text/event-stream"
    )

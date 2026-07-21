"""
PainPointCollector — AI-powered engine that derives company pain points
by analyzing signals across 4 factors: Internal, External, Social, Government.
"""

from typing import List
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import logging
from backend.models.models import (
    PainPoint, Review, NewsArticle, Job, Funding, CompanyProfile, Competitor, SocialProfile, Company
)
from backend.agents.base import BaseAgent

logger = logging.getLogger(__name__)

class PainPointSchema(BaseModel):
    category: str = Field(..., description="Must start with exactly one of: [Internal], [External], [Social], [Government & Regulatory] followed by a specific sub-category.")
    title: str
    description: str
    severity: str = Field(..., description="Must be one of: Low, Medium, High, Critical")
    source: str = Field(..., description="Must be one of: reviews, news, hiring, financial, social, competitors")
    evidence: str = Field(..., description="A direct quote or specific data point proving the pain point.")

class PainPointsOutput(BaseModel):
    pain_points: List[PainPointSchema]

class PainPointAgent(BaseAgent):
    async def analyze(self, company_id: int, db: Session) -> List[PainPoint]:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            return []

        # 1. Gather all data context
        reviews = db.query(Review).filter(Review.company_id == company_id).all()
        news = db.query(NewsArticle).filter(NewsArticle.company_id == company_id).all()
        jobs = db.query(Job).filter(Job.company_id == company_id).all()
        profile = db.query(CompanyProfile).filter(CompanyProfile.company_id == company_id).first()
        funding = db.query(Funding).filter(Funding.company_id == company_id).all()
        competitors = db.query(Competitor).filter(Competitor.company_id == company_id).all()
        socials = db.query(SocialProfile).filter(SocialProfile.company_id == company_id).all()

        # Build context string
        context = f"Company Name: {company.name}\n\n"
        
        context += "--- REVIEWS ---\n"
        for r in reviews[:15]:
            context += f"Rating: {r.rating}/5 | Platform: {r.platform}\n{r.review_text}\n"

        context += "\n--- RECENT NEWS ---\n"
        for n in news[:15]:
            context += f"[{n.published_date}] {n.headline} - {n.summary}\n"

        context += "\n--- OPEN JOBS (HIRING) ---\n"
        for j in jobs:
            context += f"Title: {j.title} | Dept: {j.department} | Desc: {j.description}\n"

        context += "\n--- FINANCIALS & PROFILE ---\n"
        if profile:
            context += f"Estimated Revenue: {profile.revenue_estimate}\n"
            context += f"Employee Count: {profile.employee_count}\n"
        if funding:
            for f in funding:
                context += f"Funding: {f.amount} ({f.stage})\n"
        else:
            context += "No external funding data found.\n"

        context += "\n--- COMPETITORS ---\n"
        for c in competitors:
            context += f"- {c.competitor_name}\n"

        context += "\n--- SOCIAL MEDIA ---\n"
        for s in socials:
            context += f"Platform: {s.platform} | Followers: {s.follower_count} | Engagement: {s.engagement_score}\n"

        prompt = f"""
You are an expert corporate analyst. Review the provided data for {company.name} and identify key pain points, risks, and vulnerabilities.
You MUST categorize every pain point into one of four macro factors by prepending the EXACT prefix to the category name:
1. [Internal] (e.g., product bugs, poor support, leadership issues, financial health)
2. [External] (e.g., fierce competition, market headwinds, lost customers, lack of funding)
3. [Social] (e.g., brand backlash, poor engagement, DEI/ESG controversies, bad PR)
4. [Government & Regulatory] (e.g., lawsuits, data privacy (GDPR), fines, government investigations)

Be deeply analytical. Read between the lines. For example, if there is massive hiring in Customer Success but terrible reviews, it means high churn.
If there are no competitors, maybe there is no market. If there is a massive drop in engagement, brand trust is eroding.

Return a maximum of 8 critical/high/medium pain points. Ensure the category strictly starts with one of the 4 prefixes!

Data Context:
{context}
"""
        logger.info(f"Calling LLM for pain point analysis on {company.name}...")
        
        # Use BaseAgent to call the LLM, preferring openrouter or groq
        from backend.agents.base import BaseAgent
        agent = BaseAgent()
        result: PainPointsOutput = await agent._call_llm(prompt, PainPointsOutput, preferred_provider="groq")
        
        # Clear old pain points
        db.query(PainPoint).filter(PainPoint.company_id == company_id).delete()
        db.commit()
        
        saved_points = []
        for pp_data in result.pain_points:
            # Ensure safety on category prefix
            cat = pp_data.category
            if not any(cat.startswith(p) for p in ["[Internal]", "[External]", "[Social]", "[Government & Regulatory]"]):
                cat = f"[Internal] {cat}" # Default fallback
                
            pp = PainPoint(
                company_id=company_id,
                category=cat,
                title=pp_data.title,
                description=pp_data.description,
                severity=pp_data.severity,
                source=pp_data.source,
                evidence=pp_data.evidence
            )
            db.add(pp)
            saved_points.append(pp)
            
        db.commit()
        logger.info(f"AI generated {len(saved_points)} pain points.")
        return saved_points

async def run_pain_point_analysis(company_id: int, db: Session) -> List[PainPoint]:
    agent = PainPointAgent()
    return await agent.analyze(company_id, db)

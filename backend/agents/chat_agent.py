import logging
from sqlalchemy.orm import Session
import httpx
from backend.core.config import settings
from backend.models.models import (
    Company, CompanyProfile, Job, Competitor, Funding, NewsArticle, Review, PainPoint
)

logger = logging.getLogger(__name__)

import json

class ChatAgent:
    def __init__(self):
        pass

    def _build_system_context(self, company_id: int, db: Session) -> str:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            return "Company not found."

        profile = db.query(CompanyProfile).filter(CompanyProfile.company_id == company_id).first()
        jobs = db.query(Job).filter(Job.company_id == company_id).all()
        comps = db.query(Competitor).filter(Competitor.company_id == company_id).all()
        funds = db.query(Funding).filter(Funding.company_id == company_id).all()
        news = db.query(NewsArticle).filter(NewsArticle.company_id == company_id).all()
        reviews = db.query(Review).filter(Review.company_id == company_id).all()
        pain_points = db.query(PainPoint).filter(PainPoint.company_id == company_id).all()

        context = f"Company Context for {company.name} (Domain: {company.domain}):\n\n"
        
        if profile:
            context += f"OVERVIEW:\n"
            context += f"- Industry: {profile.industry}\n"
            context += f"- Employees: {profile.employee_count or 'Unknown'}\n"
            context += f"- Revenue: {profile.revenue_estimate or 'Unknown'}\n"
            context += f"- HQ: {profile.headquarters}\n"
            context += f"- Description: {profile.description}\n\n"

        if pain_points:
            context += f"PAIN POINTS & RISKS:\n"
            for p in pain_points:
                context += f"- [{p.severity}] {p.category}: {p.title} - {p.description}\n"
            context += "\n"

        if jobs:
            context += f"OPEN JOBS:\n"
            for j in jobs:
                context += f"- {j.title} ({j.department}) in {j.location}. Skills: {', '.join(j.skills)}\n"
            context += "\n"

        if comps:
            context += f"COMPETITORS:\n"
            for c in comps:
                context += f"- {c.competitor_name}: {c.positioning}\n"
            context += "\n"

        if funds:
            context += f"FINANCIALS / FUNDING:\n"
            for f in funds:
                context += f"- {f.stage}: ${f.amount}M. Investors: {', '.join(f.investors)}\n"
            context += "\n"

        return context

    async def chat_stream(self, company_id: int, db: Session, user_messages: list):
        system_context = self._build_system_context(company_id, db)
        
        # Convert user_messages into a single string for Gemini for now
        # Ideally, we map roles to Gemini's format, but a concatenated prompt is fine for this demo
        chat_history = ""
        for msg in user_messages:
            role = "User" if msg.get("role") == "user" else "Assistant"
            chat_history += f"{role}: {msg.get('content')}\n\n"
            
        prompt = f"""
        You are a highly intelligent AI assistant embedded in a business intelligence dashboard.
        You are talking to a user who is viewing a profile for a company.
        Use the following internal database context to answer their questions accurately and professionally.
        If the answer is not in the context, clearly state that the data isn't currently available in the system.
        Keep your answers extremely concise and format them in markdown.
        
        ### INTERNAL SYSTEM CONTEXT ###
        {system_context}
        
        ### CHAT HISTORY ###
        {chat_history}
        
        Assistant:
        """

        try:
            import groq
            if not settings.get_groq_api_key:
                yield f"data: {json.dumps({'text': 'Groq API key is not configured'})}\n\n"
                return
                
            client = groq.Groq(api_key=settings.get_groq_api_key)
            
            groq_messages = [
                {"role": "system", "content": "You are a highly intelligent AI assistant embedded in a business intelligence dashboard. Answer questions using the provided context. Keep answers extremely concise and format them in markdown.\\n\\nCONTEXT:\\n" + system_context}
            ]
            
            for msg in user_messages:
                # Map roles correctly to system/user/assistant
                role = msg.get("role", "user")
                if role not in ["user", "assistant", "system"]:
                    role = "user"
                groq_messages.append({"role": role, "content": msg.get("content", "")})
            
            stream = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=groq_messages,
                stream=True,
                temperature=0.3
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield f"data: {json.dumps({'text': chunk.choices[0].delta.content})}\n\n"
                    
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"ChatAgent stream error: {e}")
            yield f"data: {json.dumps({'text': f'Error generating response: {str(e)}'})}\n\n"

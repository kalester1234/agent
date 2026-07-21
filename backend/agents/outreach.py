import logging
from typing import List
from pydantic import BaseModel, Field
from backend.agents.base import BaseAgent

logger = logging.getLogger(__name__)

class OutreachOutput(BaseModel):
    email_subject: str = Field(description="Subject line for the cold email")
    email_body: str = Field(description="The body of the cold email")
    linkedin_message: str = Field(description="A shorter, punchy message for LinkedIn outreach (max 300 chars)")

class OutreachAgent(BaseAgent):
    """Generates personalized outreach messages based on opportunities and company intel."""

    async def generate_outreach(self, company_name: str, opportunity_title: str, opportunity_desc: str, pain_points: List[str]) -> dict:
        logger.info(f"Generating outreach for {company_name} - {opportunity_title}")
        
        pain_points_text = "\n".join(f"- {p}" for p in pain_points) if pain_points else "None specified"
        
        prompt = f"""
        You are an elite enterprise B2B sales executive. Your goal is to draft a highly personalized, compelling cold outreach sequence for {company_name}.
        
        Opportunity Target: {opportunity_title}
        Opportunity Context: {opportunity_desc}
        
        Known Company Pain Points:
        {pain_points_text}
        
        Draft a cold email and a LinkedIn connection message targeting an executive decision-maker (e.g., CTO, VP of Sales, or CEO) at {company_name}.
        
        Rules:
        - The email must be consultative, not overly salesy. Focus on their specific pain points and the opportunity.
        - The email subject must be catchy and relevant.
        - The LinkedIn message must be under 300 characters and spark curiosity.
        """
        
        try:
            result: OutreachOutput = await self._call_llm(prompt, OutreachOutput, preferred_provider="openrouter")
            return {
                "email_subject": result.email_subject,
                "email_body": result.email_body,
                "linkedin_message": result.linkedin_message
            }
        except Exception as e:
            logger.error(f"Error generating outreach: {e}")
            return {
                "email_subject": "Quick Question",
                "email_body": f"Hi there,\n\nI noticed some interesting opportunities regarding {opportunity_title} at {company_name}. Let's chat.\n\nBest,\nSales Team",
                "linkedin_message": f"Hi, I saw {company_name}'s recent developments and have some ideas around {opportunity_title}. Let's connect!"
            }

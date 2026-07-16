from typing import List
from pydantic import BaseModel
from backend.agents.base import BaseAgent
from backend.schemas.pipeline import PainPoint, Opportunity

class OpportunitiesOutput(BaseModel):
    opportunities: List[Opportunity]

class OpportunityDetectionAgent(BaseAgent):
    async def run(self, pain_points: List[PainPoint]) -> List[Opportunity]:
        prompt = f"""
        Transform the following problems into opportunities:
        {[p.model_dump() for p in pain_points]}
        
        Every opportunity must include: opportunity (title), reason, business_value, difficulty (Easy, Medium, Hard), estimated_timeline, potential_impact, and priority.
        """
        
        result = await self._call_llm(prompt, OpportunitiesOutput)
        return result.opportunities

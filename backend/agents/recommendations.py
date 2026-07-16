from typing import List
from pydantic import BaseModel
from backend.agents.base import BaseAgent
from backend.schemas.pipeline import PainPoint, Recommendation

class RecommendationsOutput(BaseModel):
    recommendations: List[Recommendation]

class RecommendationEngine(BaseAgent):
    async def run(self, pain_points: List[PainPoint]) -> List[Recommendation]:
        prompt = f"""
        Generate implementation-ready recommendations for the following pain points:
        {[p.model_dump() for p in pain_points]}
        
        Every recommendation must follow this structure:
        Problem -> Evidence -> Root Cause -> Business Impact -> Solution -> Implementation Steps -> Estimated Effort -> Priority -> Expected Outcome -> Success Metrics.
        Never generate vague recommendations.
        """
        
        result = await self._call_llm(prompt, RecommendationsOutput)
        return result.recommendations

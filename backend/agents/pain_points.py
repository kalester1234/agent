from typing import List
from pydantic import BaseModel
from backend.agents.base import BaseAgent
from backend.schemas.pipeline import PainPoint
from backend.agents.synthesis import SynthesisOutput

class PainPointsOutput(BaseModel):
    pain_points: List[PainPoint]

class PainPointDetectionAgent(BaseAgent):
    async def run(self, synthesis: SynthesisOutput) -> List[PainPoint]:
        prompt = f"""
        Categorize the issues found in the synthesized insights:
        {synthesis.model_dump_json(indent=2)}
        
        Identify pain points across categories (e.g., Marketing, Sales, Technology, Security, SEO).
        Each pain point MUST include: problem, evidence_references (URLs or sources), severity (Low, Medium, High, Critical), business_impact, confidence, priority (Low, Medium, High).
        """
        
        result = await self._call_llm(prompt, PainPointsOutput)
        return result.pain_points

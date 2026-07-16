from typing import List, Dict, Any
from pydantic import BaseModel
from backend.agents.base import BaseAgent
from backend.agents.specialized_ai import SpecializedAIResult

class SynthesisOutput(BaseModel):
    synthesized_insights: List[str]
    relationships_discovered: List[str]

class InsightSynthesisAgent(BaseAgent):
    async def run(self, ai_results: Dict[str, SpecializedAIResult]) -> SynthesisOutput:
        prompt = "You are the Insight Synthesis Engine. Combine the following specialized AI analyses to discover cross-domain relationships.\n\n"
        for ai_name, result in ai_results.items():
            prompt += f"--- {ai_name} ---\n"
            prompt += f"Score: {result.score}/100\n"
            prompt += f"Findings: {result.findings}\n"
            prompt += f"Critical Issues: {result.critical_issues}\n\n"
            
        prompt += """
        Generate evidence-backed conclusions based on these specialized inputs. Never invent relationships.
        Output MUST be structured with 'synthesized_insights' (list of strings) and 'relationships_discovered' (list of strings).
        """
        
        return await self._call_llm(prompt, SynthesisOutput)

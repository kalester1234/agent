from typing import List
from backend.agents.base import BaseAgent
from backend.schemas.pipeline import ValidatedEvidence, AnalysisResult

class GenericAnalyzer(BaseAgent):
    async def analyze(self, category: str, evidences: List[ValidatedEvidence]) -> AnalysisResult:
        # Filter evidences for this category
        relevant_evidences = [e for e in evidences if e.category == category]
        
        if not relevant_evidences:
            return AnalysisResult(category=category, findings=[], confidence=0.0)
            
        evidence_texts = "\\n---\\n".join([e.raw_evidence for e in relevant_evidences])
        
        prompt = f"""
        You are an expert analyst for the domain: {category}.
        Analyze the following validated evidence:
        
        {evidence_texts}
        
        Provide a structured analysis. 'findings' must be a list of strings containing key insights (not objects).
        Assign a confidence score (0.0 to 1.0) for your analysis.
        """
        
        return await self._call_llm(prompt, AnalysisResult)

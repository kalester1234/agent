from typing import Dict, Any, List
from pydantic import BaseModel
from backend.agents.base import BaseAgent
from backend.agents.specialized_ai import SpecializedAIResult
from backend.agents.synthesis import SynthesisOutput

class ReportSection(BaseModel):
    title: str
    content: str
    evidence_citations: List[str]

class ReportAssemblyOutput(BaseModel):
    sections: List[ReportSection]

class ReportAssemblyAgent(BaseAgent):
    async def run(self, company_name: str, structured_json: Dict[str, Any], synthesis: SynthesisOutput, ai_results: Dict[str, SpecializedAIResult]) -> ReportAssemblyOutput:
        prompt = f"""
        Assemble the final company intelligence report for {company_name}.
        You have the following data:
        Raw Extracted JSON Data: {structured_json}
        Specialized AI Findings: {[f"{k}: {v.model_dump()}" for k, v in ai_results.items()]}
        Synthesized Insights: {synthesis.model_dump()}
        
        Generate the report into distinct, highly organized sections. You MUST include exactly these 5 pillars:
        - "1. Target Qualification (Workflow Chaos)": Document all evidence of disorganized workflows, meetings, and siloed communication based on reviews/careers.
        - "2. Competitor Displacement Strategy": Identify the project management tool they currently use (Jira, Asana, etc.) and explain exactly why Workfast.ai is superior.
        - "3. Financial Pitch Positioning": Based on their financials, explicitly display the exact Annual Revenue, exact Profit/Loss, exact Company Valuation, and exact Employee Count directly in the report. If these were not explicitly scraped from 3rd-party sources by the backend, state "Not publicly disclosed in search data" (DO NOT GUESS). Then state if the sales team should pitch "Scaling Workflows" or "Tool Consolidation for Cost Savings".
        - "4. The Workfast.ai Value Proposition": A custom 30-day rollout strategy for this specific company.
        - "5. Auto-Generated Outreach Email": A highly psychological, ready-to-send cold email tailored to their specific workflow chaos and financial context, designed to book a demo.
        
        Every section must cite supporting evidence URLs where applicable. Do not invent facts.
        CRITICAL FORMATTING RULE: You MUST use standard Markdown for formatting. NEVER output raw HTML tags (like <br> or <b>). Use standard Markdown newlines or bullet points to separate list items.
        """
        
        result = await self._call_llm(prompt, ReportAssemblyOutput, preferred_provider="cerebras")
        return result

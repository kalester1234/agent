from typing import Dict, Any, List
from pydantic import BaseModel
from backend.agents.base import BaseAgent
import logging

logger = logging.getLogger(__name__)

class SpecializedAIResult(BaseModel):
    findings: List[str]
    critical_issues: List[str]
    score: int  # 0 to 100

class WorkflowChaosAI(BaseAgent):
    async def analyze(self, company_name: str, data: Dict[str, Any]) -> SpecializedAIResult:
        logger.info(f"WorkflowChaosAI analyzing {company_name}")
        chaos_data = {
            "Reviews": data.get("Reviews", ""),
            "Careers": data.get("Careers", ""),
            "News": data.get("News", "")
        }
        prompt = f"""
        You are an expert Sales Intelligence AI for Workfast.ai (a project management tool).
        Analyze the following culture and review data for {company_name}:
        {chaos_data}
        
        Hunt aggressively for explicit pain points related to disorganized communication, siloed teams, meeting fatigue, or chaotic project management.
        Provide key findings (direct quotes if possible), critical workflow issues, and an overall Workflow Chaos score (0 = perfectly organized, 100 = absolute chaos). High scores mean they desperately need Workfast.ai.
        """
        return await self._call_llm(prompt, SpecializedAIResult)

class TechStackDisplacementAI(BaseAgent):
    async def analyze(self, company_name: str, data: Dict[str, Any]) -> SpecializedAIResult:
        logger.info(f"TechStackDisplacementAI analyzing {company_name}")
        tech_data = {
            "Careers": data.get("Careers", ""),
            "Tech Detect": data.get("Tech Detect", ""),
            "Website Crawl": data.get("Website Crawl", "")
        }
        prompt = f"""
        You are an expert Competitor Intelligence AI for Workfast.ai.
        Analyze the following data for {company_name}:
        {tech_data}
        
        Your ONLY goal is to deduce what project management software they currently use (e.g., Jira, Asana, Monday, Trello, Slack). Look at job descriptions for clues (e.g., "Must know Jira").
        Provide key findings on their current tech stack, critical displacement opportunities (why their current tool sucks compared to Workfast.ai), and a Displacement Feasibility score (0-100).
        """
        return await self._call_llm(prompt, SpecializedAIResult)

class FinancialContextAI(BaseAgent):
    async def analyze(self, company_name: str, data: Dict[str, Any]) -> SpecializedAIResult:
        logger.info(f"FinancialContextAI analyzing {company_name}")
        finance_data = {
            "Financials": data.get("Financials", ""),
            "News": data.get("News", "")
        }
        prompt = f"""
        You are an expert Financial Sales AI for Workfast.ai.
        Analyze the following financial and news data for {company_name}:
        {finance_data}
        
        Determine if they have budget to scale (recently funded, growing revenue) OR if they are struggling (layoffs, missing targets).
        You MUST extract hard numbers if available: exact annual revenue, exact profit/loss, exact company valuation, and exact number of employees.
        CRITICAL: NEVER guess or assume these numbers based on industry standards. ONLY use the explicit numbers found in the provided 3rd-party financial search data. If the exact number is missing, output "Not publicly disclosed".
        If growing, position Workfast.ai to "Help them scale without chaos". 
        If struggling, position Workfast.ai as "Tool Consolidation to save subscription money".
        Provide key findings (including the hard financial/employee numbers), the recommended financial pitch strategy, and a Budget Health score (0-100).
        """
        return await self._call_llm(prompt, SpecializedAIResult)

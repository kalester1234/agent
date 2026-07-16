from backend.agents.base import BaseAgent
from backend.schemas.pipeline import CompanyResolutionResult, ResearchPlanResult

class ResearchPlanningAgent(BaseAgent):
    async def run(self, company_info: CompanyResolutionResult) -> ResearchPlanResult:
        prompt = f"""
        Create a detailed research plan for the company "{company_info.official_name}" (Domain: {company_info.official_domain}).
        
        The research plan should consist of independent tasks that can be executed in parallel where possible.
        Each task MUST have:
        - name (e.g., "Website Research", "SEO Analysis", "Performance Audit", "Reviews")
        - priority (1 = Highest, 5 = Lowest)
        - dependencies (List of task names this task depends on. Leave empty if none)
        - expected_duration_sec (integer, estimated seconds)
        - retry_policy (e.g., "exponential_backoff")
        
        Generate a comprehensive plan covering at minimum these specific categories:
        1. Overview (Must extract: Founder's name, CEO name, Headquarters location, Founding Year).
        2. Finance (Must extract: Current year's profit, Total Investment/Funding, Annual Revenue, Number of Employees).
        3. Technology & Business Model.
        4. Competitors & SEO.
        """
        
        result = await self._call_llm(prompt, ResearchPlanResult)
        return result

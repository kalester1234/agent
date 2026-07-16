from backend.agents.base import BaseAgent
from backend.schemas.pipeline import CompanyInput, CompanyResolutionResult

class CompanyResolutionAgent(BaseAgent):
    async def run(self, input_data: CompanyInput) -> CompanyResolutionResult:
        prompt = f"""
        Given the following company input, determine the official company details.
        
        Input Data:
        Name: {input_data.name}
        Domain: {input_data.domain}
        URL: {input_data.url}
        
        Please provide the official company name, official domain, industry, headquarters,
        LinkedIn URL (if discoverable), social profiles (as a list of URLs),
        country, and a confidence score (0.0 to 1.0).
        CRITICAL: The official_domain MUST be a fully qualified domain name (e.g., 'cisco.com', 'google.com', 'pepul.com'). NEVER return just the company name as the domain.
        If the input is complete gibberish, set needs_clarification to true. Otherwise, make your best guess.
        Output MUST be in the requested JSON format.
        """
        
        result = await self._call_llm(prompt, CompanyResolutionResult, preferred_provider="cerebras")
        return result

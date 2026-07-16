from datetime import datetime
import json
from backend.agents.base import BaseAgent
from backend.schemas.pipeline import CompanyResolutionResult, CollectedEvidence
from pydantic import BaseModel, Field

from typing import List

class CollectorOutput(BaseModel):
    raw_evidence: str
    extracted_metadata: List[str]
    source_reliability: float

class GenericCollector(BaseAgent):
    async def collect(self, company: CompanyResolutionResult, category: str) -> CollectedEvidence:
        prompt = f"""
        You are a specialized Data Collector for the category: {category}.
        Simulate collecting raw data and extracting metadata for the company:
        Name: {company.official_name}
        Domain: {company.official_domain}
        
        Return realistic findings based on the domain and category as 'raw_evidence'.
        Extract key technical/business data into 'extracted_metadata' (key-value pairs).
        
        CRITICAL: If the category is "Overview", ensure you extract and return Founder's name, CEO name, Headquarters location, and Founding Year.
        CRITICAL: If the category is "Finance", ensure you extract and return Current Year's Profit, Total Investment/Funding, Annual Revenue, and Number of Employees.
        
        Assign a 'source_reliability' score (0.0 to 1.0) simulating how reliable this hypothetical source is.
        """
        
        result = await self._call_llm(prompt, CollectorOutput)
        
        # In a real app, this would hit the DB. For now we just return the schema
        return CollectedEvidence(
            source_url=f"https://{company.official_domain}/{category.lower()}",
            category=category,
            raw_evidence=result.raw_evidence,
            extracted_metadata=result.extracted_metadata,
            source_reliability=result.source_reliability,
            retrieval_timestamp=datetime.utcnow().isoformat()
        )

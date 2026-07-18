import logging
from pydantic import BaseModel, Field
from backend.collectors.collectors import BaseCollector, DataValidationLayer
from backend.models.models import KeyExecutive, PricingTier, CompliancePosture

logger = logging.getLogger(__name__)

class ExecutiveCollector(BaseCollector):
    async def run(self):
        query = f'"{self.company.name}" ("CEO" OR "CTO" OR "Founder" OR "VP") site:linkedin.com/in OR site:{self.domain}/about'
        search_results = await self._perform_web_search(query)
        if not search_results:
            return

        class ExecutiveOutput(BaseModel):
            executives: list[dict] = Field(description="List of executives with keys: name, title, linkedin_url")

        prompt = f"""
        Extract key executives from the search results for {self.company.name}:
        {search_results}
        Return a list of executives.
        """
        from backend.agents.base import BaseAgent
        agent = BaseAgent()
        result = await agent._call_llm(prompt, ExecutiveOutput, preferred_provider="groq")
        if result and result.executives:
            for ex in result.executives:
                db_ex = KeyExecutive(
                    company_id=self.company_id,
                    name=ex.get('name', 'Unknown'),
                    title=ex.get('title', 'Unknown'),
                    linkedin_url=ex.get('linkedin_url', '')
                )
                self.db.add(db_ex)
            self.db.commit()

class PricingCollector(BaseCollector):
    async def run(self):
        query = f'"{self.company.name}" pricing tiers OR "pricing" site:{self.domain}/pricing'
        search_results = await self._perform_web_search(query)
        if not search_results:
            return

        class PricingOutput(BaseModel):
            tiers: list[dict] = Field(description="List of tiers with keys: tier_name, price, features (list of str)")

        prompt = f"""
        Extract pricing tiers from the search results for {self.company.name}:
        {search_results}
        Return a list of pricing tiers.
        """
        from backend.agents.base import BaseAgent
        agent = BaseAgent()
        result = await agent._call_llm(prompt, PricingOutput, preferred_provider="groq")
        if result and result.tiers:
            for t in result.tiers:
                db_t = PricingTier(
                    company_id=self.company_id,
                    tier_name=t.get('tier_name', 'Unknown'),
                    price=t.get('price', 'Custom'),
                    features=t.get('features', [])
                )
                self.db.add(db_t)
            self.db.commit()

class ComplianceCollector(BaseCollector):
    async def run(self):
        query = f'"{self.company.name}" ("SOC2" OR "GDPR" OR "HIPAA" OR "ISO 27001" OR "compliance") site:{self.domain}/security'
        search_results = await self._perform_web_search(query)
        if not search_results:
            return

        class ComplianceOutput(BaseModel):
            soc2: bool
            gdpr: bool
            hipaa: bool
            iso27001: bool
            other: list[str]

        prompt = f"""
        Extract security and compliance information for {self.company.name}:
        {search_results}
        """
        from backend.agents.base import BaseAgent
        agent = BaseAgent()
        result = await agent._call_llm(prompt, ComplianceOutput, preferred_provider="groq")
        if result:
            db_c = CompliancePosture(
                company_id=self.company_id,
                soc2=result.soc2,
                gdpr=result.gdpr,
                hipaa=result.hipaa,
                iso27001=result.iso27001,
                other_certifications=result.other
            )
            self.db.add(db_c)
            self.db.commit()

from pydantic import BaseModel
from backend.agents.base import BaseAgent
from backend.agents.report_assembly import ReportAssemblyOutput

class QAOutput(BaseModel):
    is_valid: bool
    issues_found: list[str]
    corrected_report: ReportAssemblyOutput

class QualityAssuranceAgent(BaseAgent):
    async def run(self, draft_report: ReportAssemblyOutput) -> QAOutput:
        prompt = f"""
        You are the Quality Assurance Agent. Verify the following drafted report:
        {draft_report.model_dump_json(indent=2)}
        
        Checklist:
        - Every section exists and has content.
        - Every claim has evidence citations.
        - No hallucinations or contradictory findings.
        
        If it fails validation, correct the issues and output the corrected_report. Set is_valid to true if it passed initially or after your corrections.
        """
        
        return await self._call_llm(prompt, QAOutput)

import hashlib
import asyncio
from typing import List, Optional
from backend.agents.base import BaseAgent
from backend.schemas.pipeline import CollectedEvidence, ValidatedEvidence
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class ValidationOutput(BaseModel):
    confidence: float
    is_valid: bool
    merged_evidence_raw: str

class EvidenceValidationAgent(BaseAgent):
    async def _validate_single(self, ev: CollectedEvidence) -> Optional[ValidatedEvidence]:
        prompt = f"""
        Validate the following collected evidence:
        Category: {ev.category}
        Source Reliability: {ev.source_reliability}
        Raw Evidence: {ev.raw_evidence}
        
        Detect conflicts, remove spam, and determine a final confidence score (0.0 to 1.0).
        Set is_valid to true if the evidence passes validation.
        If valid, output the (possibly cleaned) merged_evidence_raw.
        """
        try:
            result = await self._call_llm(prompt, ValidationOutput)
            if result.is_valid:
                # Hash the content to ensure we don't have exact duplicates
                content_hash = hashlib.sha256(result.merged_evidence_raw.encode('utf-8')).hexdigest()
                
                return ValidatedEvidence(
                    source_url=ev.source_url,
                    category=ev.category,
                    raw_evidence=result.merged_evidence_raw,
                    extracted_metadata=ev.extracted_metadata,
                    source_reliability=ev.source_reliability,
                    retrieval_timestamp=ev.retrieval_timestamp,
                    confidence=result.confidence,
                    hash=content_hash
                )
        except Exception as e:
            logger.error(f"Validation failed for {ev.category}: {e}")
        return None

    async def run(self, evidences: List[CollectedEvidence]) -> List[ValidatedEvidence]:
        tasks = [self._validate_single(ev) for ev in evidences]
        results = await asyncio.gather(*tasks)
        
        # Filter out None values (failed validations)
        return [r for r in results if r is not None]

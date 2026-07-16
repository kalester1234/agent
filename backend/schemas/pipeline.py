from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CompanyInput(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    url: Optional[str] = None

class CompanyResolutionResult(BaseModel):
    official_name: str
    official_domain: str
    industry: str
    headquarters: str
    linkedin_url: Optional[str] = None
    social_profiles: List[str] = Field(default_factory=list)
    country: str
    confidence_score: float
    needs_clarification: bool = False

class ResearchTask(BaseModel):
    name: str
    priority: int
    dependencies: List[str]
    expected_duration_sec: int
    retry_policy: str = "exponential_backoff"

class ResearchPlanResult(BaseModel):
    tasks: List[ResearchTask]

class CollectedEvidence(BaseModel):
    source_url: str
    category: str
    raw_evidence: str
    extracted_metadata: List[str] = Field(default_factory=list)
    source_reliability: float
    retrieval_timestamp: str

class ValidatedEvidence(CollectedEvidence):
    confidence: float
    hash: str

class AnalysisResult(BaseModel):
    category: str
    findings: List[str]
    confidence: float

class PainPoint(BaseModel):
    category: str
    problem: str
    evidence_references: List[str]
    severity: str
    business_impact: str
    confidence: float
    priority: str

class Opportunity(BaseModel):
    opportunity: str
    reason: str
    business_value: str
    difficulty: str
    estimated_timeline: str
    potential_impact: str
    priority: str

class Recommendation(BaseModel):
    problem: str
    evidence_references: List[str]
    root_cause: str
    business_impact: str
    solution: str
    implementation_steps: List[str]
    estimated_effort: str
    priority: str
    expected_outcome: str
    success_metrics: List[str]

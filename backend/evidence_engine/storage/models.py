from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, DateTime, Float, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from backend.db.database import Base

class Company(Base):
    __tablename__ = "company"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    domain = Column(String, unique=True, nullable=False)
    verified = Column(String, default="false")  # could be boolean, kept simple
    created_at = Column(DateTime, default=datetime.utcnow)

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("company.id"), index=True)
    category = Column(String, nullable=False)  # e.g. "Revenue", "Tech Stack"
    value = Column(JSON)                     # normalized structured value
    source_url = Column(String, nullable=False)
    source_type = Column(String)             # "official", "third_party"
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    page_title = Column(String)
    extraction_method = Column(String)       # "html", "json-ld", "playwright"
    confidence = Column(Float)               # 0.0 - 1.0
    snippet = Column(Text)                  # short excerpt supporting the fact
    raw_html = Column(Text, nullable=True)  # optional raw snapshot for audit

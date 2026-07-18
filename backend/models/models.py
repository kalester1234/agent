from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    domain = Column(String, unique=True, index=True, nullable=False)
    logo_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    profile = relationship("CompanyProfile", back_populates="company", uselist=False, cascade="all, delete-orphan")
    website = relationship("CompanyWebsite", back_populates="company", uselist=False, cascade="all, delete-orphan")
    pages = relationship("WebsitePage", back_populates="company", cascade="all, delete-orphan")
    technology_stack = relationship("TechnologyStack", back_populates="company", cascade="all, delete-orphan")
    seo_data = relationship("SEOData", back_populates="company", uselist=False, cascade="all, delete-orphan")
    performance_metrics = relationship("PerformanceMetrics", back_populates="company", uselist=False, cascade="all, delete-orphan")
    social_profiles = relationship("SocialProfile", back_populates="company", cascade="all, delete-orphan")
    news_articles = relationship("NewsArticle", back_populates="company", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="company", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")
    competitors = relationship("Competitor", back_populates="company", cascade="all, delete-orphan")
    funding = relationship("Funding", back_populates="company", cascade="all, delete-orphan")
    sources = relationship("Source", back_populates="company", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="company", cascade="all, delete-orphan")
    facts = relationship("CompanyFact", back_populates="company", cascade="all, delete-orphan")
    crawl_jobs = relationship("CrawlJob", back_populates="company", cascade="all, delete-orphan")
    
    # New relationships for acquisitions and IPO info
    acquisitions = relationship("Acquisition", back_populates="company", cascade="all, delete-orphan")
    ipo_info = relationship("IPOInfo", back_populates="company", uselist=False, cascade="all, delete-orphan")
    pain_points = relationship("PainPoint", back_populates="company", cascade="all, delete-orphan")
    executives = relationship("KeyExecutive", back_populates="company", cascade="all, delete-orphan")
    pricing_tiers = relationship("PricingTier", back_populates="company", cascade="all, delete-orphan")
    compliance = relationship("CompliancePosture", back_populates="company", uselist=False, cascade="all, delete-orphan")
    study = relationship("CompanyStudy", back_populates="company", uselist=False, cascade="all, delete-orphan")
    opportunities = relationship("Opportunity", back_populates="company", cascade="all, delete-orphan")

class CompanyStudy(Base):
    __tablename__ = "company_studies"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    executive_summary = Column(Text, nullable=True)
    market_position = Column(Text, nullable=True)
    risks_and_opportunities = Column(Text, nullable=True)
    conclusion = Column(Text, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="study")

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    impact = Column(String, nullable=False) # High, Critical, Medium
    type = Column(String, nullable=False)   # Strategic, Defensive, Operational
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="opportunities")

class KeyExecutive(Base):
    __tablename__ = "key_executives"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    linkedin_url = Column(String, nullable=True)
    company = relationship("Company", back_populates="executives")

class PricingTier(Base):
    __tablename__ = "pricing_tiers"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    tier_name = Column(String, nullable=False)
    price = Column(String, nullable=False)
    features = Column(JSON, nullable=True)
    company = relationship("Company", back_populates="pricing_tiers")

class CompliancePosture(Base):
    __tablename__ = "compliance_posture"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), unique=True, nullable=False)
    soc2 = Column(Boolean, default=False)
    gdpr = Column(Boolean, default=False)
    hipaa = Column(Boolean, default=False)
    iso27001 = Column(Boolean, default=False)
    other_certifications = Column(JSON, nullable=True)
    company = relationship("Company", back_populates="compliance")

class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), unique=True, nullable=False)
    founded_year = Column(Integer, nullable=True)
    employee_count = Column(Integer, nullable=True)
    industry = Column(String, index=True, nullable=True)
    headquarters = Column(String, nullable=True)
    country = Column(String, nullable=True)
    locations = Column(Text, nullable=True) # Stored as comma-separated or json string
    revenue_estimate = Column(String, nullable=True)
    business_model = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    founders = Column(String, nullable=True)
    products = Column(JSON, nullable=True)
    services = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="profile")

class CompanyWebsite(Base):
    __tablename__ = "company_websites"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), unique=True, nullable=False)
    last_crawled_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, nullable=False, default="pending") # pending, crawling, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="website")

class WebsitePage(Base):
    __tablename__ = "website_pages"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    url = Column(String, index=True, nullable=False)
    title = Column(String, nullable=True)
    meta_description = Column(Text, nullable=True)
    content_text = Column(Text, nullable=True)
    html_content = Column(Text, nullable=True)
    page_type = Column(String, nullable=True, index=True)  # home, about, products, services, pricing, blog, careers, contact, legal, privacy, resources, press
    structured_data = Column(JSON, nullable=True)  # Extracted structured content (product list, pricing plans, etc.)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="pages")

class TechnologyStack(Base):
    __tablename__ = "technology_stack"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, index=True, nullable=False) # Frontend, Backend, Hosting, CDN, Analytics, CMS, etc.
    name = Column(String, index=True, nullable=False)
    version = Column(String, nullable=True)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="technology_stack")

class SEOData(Base):
    __tablename__ = "seo_data"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), unique=True, nullable=False)
    # Title & Meta
    meta_title = Column(String, nullable=True)
    meta_description_text = Column(Text, nullable=True)
    # Robots & Sitemap
    sitemap_url = Column(String, nullable=True)
    sitemap_urls = Column(JSON, nullable=True)       # All sitemap URLs discovered
    robots_txt = Column(Text, nullable=True)
    robots_rules = Column(JSON, nullable=True)        # Parsed allow/disallow rules
    # Canonical & Schema
    canonical_url = Column(String, nullable=True)
    schema_org_json = Column(JSON, nullable=True)
    schema_types = Column(JSON, nullable=True)        # e.g. ["Organization","WebSite"]
    # Social meta
    open_graph_tags = Column(JSON, nullable=True)
    twitter_card_tags = Column(JSON, nullable=True)
    # Headings
    headings_structure = Column(JSON, nullable=True)  # {h1:[...], h2:[...], h3:[...]}
    # Links
    broken_links_count = Column(Integer, default=0)
    broken_links_detail = Column(JSON, nullable=True) # [{url, status_code}]
    # Score
    score = Column(Integer, default=0)
    score_breakdown = Column(JSON, nullable=True)     # per-factor scores
    confidence_score = Column(Float, default=1.0)
    evidence_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="seo_data")

class PerformanceMetrics(Base):
    __tablename__ = "performance_metrics"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), unique=True, nullable=False)
    performance_score = Column(Float, default=0.0)
    page_weight_bytes = Column(Integer, default=0)
    core_web_vitals = Column(JSON, nullable=True)
    image_optimization_score = Column(Float, default=0.0)
    compression_enabled = Column(Boolean, default=False)
    caching_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=1.0)
    evidence_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="performance_metrics")

class SocialProfile(Base):
    __tablename__ = "social_profiles"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String, index=True, nullable=False) # LinkedIn, Instagram, Twitter, Facebook, YouTube
    url = Column(String, nullable=False)
    follower_count = Column(Integer, nullable=True)
    posting_frequency = Column(String, nullable=True)
    latest_posts = Column(JSON, nullable=True)
    engagement_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="social_profiles")

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    headline = Column(String, nullable=False)
    source = Column(String, nullable=False)
    published_date = Column(DateTime(timezone=True), nullable=True)
    category = Column(String, index=True, nullable=True) # Funding, Partnership, Acquisition, Leadership Changes, etc.
    url = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    full_content = Column(Text, nullable=True)
    sentiment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="news_articles")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String, index=True, nullable=False) # Google, G2, Trustpilot, Capterra, App Store
    rating = Column(Float, nullable=False)
    review_text = Column(Text, nullable=True)
    date = Column(DateTime(timezone=True), nullable=True)
    source = Column(String, nullable=True)
    reviewer_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="reviews")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, index=True, nullable=False)
    department = Column(String, index=True, nullable=True)
    location = Column(String, nullable=True)
    skills = Column(JSON, nullable=True)
    hiring_trends = Column(JSON, nullable=True)
    description = Column(Text, nullable=True)
    posted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="jobs")

class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    competitor_name = Column(String, index=True, nullable=False)
    industry = Column(String, nullable=True)
    products = Column(JSON, nullable=True)
    positioning = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="competitors")

class Funding(Base):
    __tablename__ = "funding"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    stage = Column(String, index=True, nullable=True) # Seed, Series A, Series B, IPO
    amount = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    date = Column(DateTime(timezone=True), nullable=True)
    investors = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="funding")

class Acquisition(Base):
    __tablename__ = "acquisitions"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    target_name = Column(String, nullable=False)  # Name of the company being acquired
    amount = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    date = Column(DateTime(timezone=True), nullable=True)
    acquirer_name = Column(String, nullable=True)  # Who is acquiring
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="acquisitions")

class IPOInfo(Base):
    __tablename__ = "ipo_info"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False)  # e.g., "Pending", "Completed", "Cancelled"
    expected_date = Column(DateTime(timezone=True), nullable=True)
    valuation = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="ipo_info")

class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    url = Column(String, nullable=False)
    reliability_score = Column(Float, default=1.0)
    last_fetched = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="sources")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    source_url = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False)
    raw_evidence = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    content_hash = Column(String, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="evidence")

class CompanyFact(Base):
    __tablename__ = "company_facts"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    fact_name = Column(String, index=True, nullable=False)
    fact_value = Column(String, nullable=False)
    source = Column(String, nullable=False)
    url = Column(String, nullable=True)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="facts")

class CrawlJob(Base):
    __tablename__ = "crawl_jobs"

    id = Column(String, primary_key=True, index=True) # UUID string
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False, default="pending") # pending, processing, completed, failed
    progress = Column(Float, default=0.0) # 0.0 to 100.0
    current_task = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="crawl_jobs")

class PainPoint(Base):
    __tablename__ = "pain_points"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, index=True, nullable=False)  # e.g. Customer Experience, Technical, Hiring, Financial
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=False, default="Medium")  # Low, Medium, High, Critical
    source = Column(String, nullable=True)  # reviews, news, hiring, financial
    evidence = Column(Text, nullable=True)  # supporting text
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="pain_points")

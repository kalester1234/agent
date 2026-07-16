import asyncio
from backend.db.database import SessionLocal
from backend.collectors.collectors import CompanyDiscoveryCollector
from backend.models.models import Company, CompanyFact

async def main():
    db = SessionLocal()
    company = db.query(Company).filter(Company.id == 1).first()
    print(f"Testing for {company.name}")
    col1 = CompanyDiscoveryCollector(db, company.id)
    await col1.run()
    
    facts = db.query(CompanyFact).filter(CompanyFact.company_id == 1).all()
    print(f"Inserted {len(facts)} facts:")
    for f in facts:
        print(f"- {f.fact_name}: {f.fact_value}")

asyncio.run(main())

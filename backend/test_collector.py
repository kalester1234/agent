import asyncio
from backend.db.database import SessionLocal
from backend.collectors.collectors import CompanyDiscoveryCollector
from backend.models.models import Company

async def main():
    db = SessionLocal()
    company = db.query(Company).filter(Company.id == 12).first()
    print(f"Testing for {company.name}")
    col1 = CompanyDiscoveryCollector(db, company.id)
    await col1.run()
    
    from backend.models.models import Evidence
    evidences = db.query(Evidence).filter(Evidence.company_id == 12).all()
    print("Evidences collected:")
    for ev in evidences:
        print(f"- {ev.category}: {len(ev.raw_evidence)} chars")

asyncio.run(main())

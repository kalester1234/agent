import asyncio
from backend.db.database import SessionLocal
from backend.collectors.collectors import CompanyDiscoveryCollector
from backend.models.models import Company

async def main():
    db = SessionLocal()
    company = db.query(Company).filter(Company.id == 11).first()
    col1 = CompanyDiscoveryCollector(db, company.id)
    search_desc = await col1._search_duckduckgo(f'"{company.name}" funding valuation revenue crunchbase tracxn')
    print("FINANCIAL DDG:", search_desc)

asyncio.run(main())

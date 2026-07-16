import asyncio
from backend.db.database import SessionLocal
from backend.collectors.collectors import CompanyDiscoveryCollector
from backend.models.models import Company

async def main():
    db = SessionLocal()
    col1 = CompanyDiscoveryCollector(db, 12)
    search_desc = await col1._search_duckduckgo(f'"{col1.company.name}" revenue OR funding OR valuation')
    print("FINANCIAL DDG:", len(search_desc))
    print(search_desc)

asyncio.run(main())

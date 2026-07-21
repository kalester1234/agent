import asyncio
from backend.db.database import SessionLocal
from backend.collectors.collectors import BaseCollector

async def main():
    db = SessionLocal()
    bc = BaseCollector(db, 1)
    
    query1 = '"OpenAI" careers jobs open positions hiring engineering product manager'
    query2 = '"OpenAI" main competitors alternatives market rivals'
    
    res1 = await bc._search_serper(query1)
    print(f"Hiring Query Result Length: {len(res1)}")
    
    res2 = await bc._search_serper(query2)
    print(f"Competitor Query Result Length: {len(res2)}")
    
if __name__ == "__main__":
    asyncio.run(main())

import asyncio
from backend.db.database import SessionLocal
from backend.collectors.collectors import HiringCollector, CompetitorCollector
from backend.collectors.pain_point_collector import PainPointAgent

async def main():
    db = SessionLocal()
    try:
        # Assuming company_id=1 exists
        print("Testing HiringCollector...")
        jobs = await HiringCollector(db, 1).run()
        print(f"Jobs found: {len(jobs)}")
        
        print("Testing CompetitorCollector...")
        comps = await CompetitorCollector(db, 1).run()
        print(f"Competitors found: {len(comps)}")
        
        print("Testing PainPointAgent...")
        agent = PainPointAgent()
        pps = await agent.analyze(1, db)
        print(f"Pain points found: {len(pps)}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())

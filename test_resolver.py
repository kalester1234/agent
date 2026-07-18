import asyncio
from backend.evidence_engine.resolver import CompanyResolver

async def main():
    resolver = CompanyResolver()
    domain = await resolver.resolve(name="Apple")
    print(f"Resolved domain: {domain}")

asyncio.run(main())

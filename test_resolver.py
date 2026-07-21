import asyncio
from backend.evidence_engine.resolver import CompanyResolver

async def main():
    resolver = CompanyResolver()
    try:
        domain = await resolver.resolve(name="OpenAI")
        print(f"Resolved domain: {domain}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

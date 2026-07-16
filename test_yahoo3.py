import httpx
import asyncio
from bs4 import BeautifulSoup
async def main():
    headers = {"User-Agent": "Mozilla/5.0"}
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        resp = await client.get("https://search.yahoo.com/search?p=%22Pepul%22+revenue+OR+funding+OR+valuation", headers=headers)
        soup = BeautifulSoup(resp.text, "html.parser")
        for div in soup.find_all("div", class_="compText"):
            print("Snippet:", div.text.strip())

asyncio.run(main())

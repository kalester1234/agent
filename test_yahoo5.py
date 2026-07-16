import asyncio
import httpx
from bs4 import BeautifulSoup
async def main():
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        resp = await client.get("https://search.yahoo.com/search?p=%22Apple+Inc.%22+revenue+OR+funding+OR+valuation", headers=headers)
        soup = BeautifulSoup(resp.text, "html.parser")
        snippets = []
        for div in soup.find_all("div", class_="compText"):
            snippets.append(div.text.strip())
        print("Yahoo Snippets count:", len(snippets))
        if len(snippets) == 0:
            print("Response:", resp.text[:500])
asyncio.run(main())

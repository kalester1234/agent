import httpx
import asyncio
from bs4 import BeautifulSoup
async def main():
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        resp = await client.get("https://search.yahoo.com/search?p=%22Infosys%22+funding+valuation+revenue+crunchbase+tracxn", headers=headers)
        print("STATUS:", resp.status_code)
        soup = BeautifulSoup(resp.text, "html.parser")
        for div in soup.find_all("div", class_="compText"):
            print("Snippet:", div.text.strip())

asyncio.run(main())

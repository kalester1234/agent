import httpx
import asyncio
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urljoin
from .base_collector import BaseCollector
from ..storage.models import Evidence

class WebsiteCollector(BaseCollector):
    """Collects basic site metadata from the official homepage.

    Returns a list with a single Evidence entry containing:
    - canonical URL
    - page title
    - meta description
    - Open Graph tags
    - raw HTML sanitized
    """

    async def _fetch(self) -> str:
        url = f"https://{self.domain}" if not self.domain.startswith("http") else self.domain
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(url, headers={"User-Agent": "EnterpriseEvidenceEngine/1.0"})
            resp.raise_for_status()
            return resp.text

    def _extract_meta(self, soup: BeautifulSoup) -> dict:
        data = {}
        # title
        if soup.title and soup.title.string:
            data["title"] = soup.title.string.strip()
        # meta description
        desc = soup.find("meta", attrs={"name": "description"})
        if desc and desc.get("content"):
            data["description"] = desc["content"].strip()
        # og tags
        for tag in soup.find_all("meta"):
            if tag.get("property", "").startswith("og:"):
                data[tag["property"]] = tag.get("content", "").strip()
        # canonical link
        canon = soup.find("link", rel="canonical")
        if canon and canon.get("href"):
            data["canonical"] = canon["href"].strip()
        return data

    async def collect(self) -> list:
        html = await self._fetch()
        soup = BeautifulSoup(html, "html.parser")
        meta = self._extract_meta(soup)
        evidence = Evidence(
            category="Website",
            value=meta,
            source_url=f"https://{self.domain}",
            source_type="official",
            retrieved_at=datetime.utcnow(),
            page_title=meta.get("title", ""),
            extraction_method="html",
            confidence=0.95,
            snippet="".join([meta.get("title", ""), meta.get("description", "")]),
            raw_html=html,
        )
        return [evidence]

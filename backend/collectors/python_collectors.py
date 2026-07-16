import httpx
from bs4 import BeautifulSoup
import asyncio
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class PythonDataCollector:
    def __init__(self, domain: str, company_name: str):
        self.domain = domain
        self.company_name = company_name
        self.base_url = f"https://{domain}" if not domain.startswith("http") else domain
        # Shared state for the raw HTML so we don't fetch it 9 times
        self.html_content = ""
        self.headers = {}
        
    async def _fetch_homepage(self):
        if not self.html_content:
            try:
                async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                    resp = await client.get(self.base_url)
                    self.html_content = resp.text
                    self.headers = dict(resp.headers)
            except Exception as e:
                logger.warning(f"Failed to fetch {self.base_url}: {e}")
                self.html_content = "<html><body>Error fetching site.</body></html>"
                
    async def website_crawl(self) -> Dict[str, Any]:
        await self._fetch_homepage()
        soup = BeautifulSoup(self.html_content, 'html.parser')
        text_content = soup.get_text(separator=' ', strip=True)
        # Limit text to 2000 chars to avoid memory bloat
        return {"category": "Website Crawl", "data": text_content[:2000]}

    async def tech_detect(self) -> Dict[str, Any]:
        await self._fetch_homepage()
        tech = []
        if 'x-powered-by' in self.headers:
            tech.append(self.headers['x-powered-by'])
        if 'server' in self.headers:
            tech.append(self.headers['server'])
        
        html_lower = self.html_content.lower()
        if 'react' in html_lower or 'data-reactroot' in html_lower: tech.append("React")
        if 'next' in html_lower or '_next' in html_lower: tech.append("Next.js")
        if 'wp-content' in html_lower: tech.append("WordPress")
        
        return {"category": "Tech Detect", "data": ", ".join(tech) if tech else "Unknown Tech Stack"}

    async def seo_audit(self) -> Dict[str, Any]:
        await self._fetch_homepage()
        soup = BeautifulSoup(self.html_content, 'html.parser')
        title = soup.title.string if soup.title else "No Title"
        meta_desc = soup.find("meta", {"name": "description"})
        desc = meta_desc["content"] if meta_desc and "content" in meta_desc.attrs else "No Description"
        h1_tags = [h1.get_text(strip=True) for h1 in soup.find_all("h1")]
        
        return {
            "category": "SEO Audit",
            "data": f"Title: {title}, Description: {desc}, H1s: {h1_tags}"
        }

    async def _fallback_search(self, query: str) -> str:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.post("https://lite.duckduckgo.com/lite/", data={"q": query}, headers=headers)
                soup = BeautifulSoup(resp.text, "html.parser")
                results = []
                for tr in soup.find_all("tr"):
                    td = tr.find("td", class_="result-snippet")
                    if td: 
                        results.append(td.text.strip())
                if not results:
                    return f"No extensive multi-source data found for {query}."
                return " ".join(results)[:1500]  # Return up to 1500 chars of aggregated snippets
        except Exception as e:
            return f"Error gathering multi-source data for {query}: {e}"

    async def reviews(self) -> Dict[str, Any]:
        data = await self._fallback_search(f'"{self.company_name}" customer employee reviews complaints disorganized chaotic communication siloed teams g2 glassdoor')
        return {"category": "Reviews", "data": f"Aggregated Multi-Source Reviews:\n{data}"}

    async def social_media(self) -> Dict[str, Any]:
        data = await self._fallback_search(f'"{self.company_name}" linkedin twitter recent announcements social media')
        return {"category": "Social Media", "data": f"Aggregated Social Presence:\n{data}"}

    async def news(self) -> Dict[str, Any]:
        data = await self._fallback_search(f'"{self.company_name}" recent news updates press releases 2026')
        return {"category": "News", "data": f"Aggregated Recent News:\n{data}"}

    async def competitors(self) -> Dict[str, Any]:
        data = await self._fallback_search(f'"{self.company_name}" top competitors alternatives market share')
        return {"category": "Competitors", "data": f"Aggregated Competitor Data:\n{data}"}

    async def careers(self) -> Dict[str, Any]:
        data = await self._fallback_search(f'"{self.company_name}" careers hiring culture glassdoor Jira Asana Trello Monday project manager tools')
        return {"category": "Careers", "data": f"Aggregated Careers & Culture:\n{data}"}

    async def financials(self) -> Dict[str, Any]:
        data = await self._fallback_search(f'"{self.company_name}" annual revenue net profit total funding company valuation number of employees statistics')
        return {"category": "Financials", "data": f"Aggregated Financial Numbers:\n{data}"}

    async def performance(self) -> Dict[str, Any]:
        import time
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(self.base_url)
                ttfb = (time.time() - start_time) * 1000
                html = resp.text
                
                # Security Headers Check
                headers_lower = {k.lower(): v for k, v in resp.headers.items()}
                security_issues = []
                if 'content-security-policy' not in headers_lower: security_issues.append("Missing CSP")
                if 'strict-transport-security' not in headers_lower: security_issues.append("Missing HSTS")
                if 'x-frame-options' not in headers_lower: security_issues.append("Missing X-Frame-Options")
                
                # Payload Complexity
                size_kb = len(html.encode('utf-8', errors='ignore')) / 1024
                img_count = html.lower().count('<img')
                script_count = html.lower().count('<script')
                
                speed_rating = "Excellent" if ttfb < 200 else "Average" if ttfb < 800 else "Critical Bottleneck"
                
                data = f"TTFB Latency: {ttfb:.0f}ms ({speed_rating})\n"
                data += f"Payload Size: {size_kb:.2f} KB\n"
                data += f"DOM Complexity: {img_count} images, {script_count} scripts\n"
                data += f"Security Posture: {'Good' if not security_issues else ', '.join(security_issues)}"
                
                return {"category": "Performance", "data": data}
        except Exception as e:
            return {"category": "Performance", "data": f"Failed to audit performance: {e}"}

    async def get_wikipedia_context(self) -> Dict[str, Any]:
        headers = {"User-Agent": "Antigravity-IDE-Agent/1.0 (contact@example.com)"}
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={self.company_name} company&utf8=&format=json"
                search_resp = await client.get(search_url, headers=headers)
                search_data = search_resp.json()
                
                if not search_data.get('query', {}).get('search'):
                    return {"category": "Wikipedia Context", "data": "No Wikipedia page found."}
                    
                title = search_data['query']['search'][0]['title']
                
                extract_url = f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles={title}&format=json"
                extract_resp = await client.get(extract_url, headers=headers)
                extract_data = extract_resp.json()
                pages = extract_data['query']['pages']
                extract = list(pages.values())[0].get('extract', '')
                
                wiki_url = f"https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&titles={title}&format=json"
                wiki_resp = await client.get(wiki_url, headers=headers)
                wiki_data = wiki_resp.json()
                pages = wiki_data['query']['pages']
                content = list(pages.values())[0]['revisions'][0]['slots']['main']['*']
                
                infobox = ""
                if "{{Infobox company" in content:
                    start = content.find("{{Infobox company")
                    infobox = content[start:start+1500]
                    
                return {"category": "Wikipedia Context", "data": f"Extract: {extract}\n\nInfobox: {infobox}"}
        except Exception as e:
            return {"category": "Wikipedia Context", "data": f"Error fetching Wikipedia: {e}"}

    async def run_all(self) -> Dict[str, Any]:
        # Pre-fetch so all methods share the HTML
        await self._fetch_homepage()
        
        tasks = [
            self.website_crawl(),
            self.tech_detect(),
            self.seo_audit(),
            self.reviews(),
            self.social_media(),
            self.news(),
            self.competitors(),
            self.careers(),
            self.financials(),
            self.performance(),
            self.get_wikipedia_context()
        ]
        results = await asyncio.gather(*tasks)
        
        # Normalize to Structured JSON
        normalized = {}
        for res in results:
            normalized[res["category"]] = res["data"]
            
        return normalized

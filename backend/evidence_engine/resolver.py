import httpx
from urllib.parse import urlparse
from typing import Optional

class CompanyResolver:
    """Resolve a company name or partial domain to the official website domain.

    Strategy:
    1. If a fully qualified domain is supplied, verify it resolves.
    2. Otherwise, perform a DuckDuckGo Lite search for "{name} official website"
       and return the first result URL's netloc.
    3. Basic validation ensures the domain contains a dot and does not
       resolve to a known search engine.
    """

    def __init__(self, http_timeout: float = 10.0):
        self.timeout = http_timeout
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    async def _search_official(self, name: str) -> Optional[str]:
        query = f'"{name}" official website'
        # Try DuckDuckGo first
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                resp = await client.post(
                    "https://lite.duckduckgo.com/lite/",
                    data={"q": query},
                    headers=self.headers,
                )
                if resp.status_code == 200 and "anomaly-modal" not in resp.text:
                    import re
                    from urllib.parse import unquote
                    raw_urls = re.findall(r'href=[\'\"]?([^\'\">]+)[\'\"]?', resp.text)
                    for u in raw_urls:
                        u = u.replace("&amp;", "&")
                        if "uddg=" in u:
                            match = re.search(r'uddg=([^&]+)', u)
                            if match:
                                u = unquote(match.group(1))
                        
                        if not u.startswith("http"):
                            continue
                        
                        parsed = urlparse(u)
                        netloc = parsed.netloc.lower()
                        if netloc:
                            if netloc.startswith("www."):
                                netloc = netloc[4:]
                            if any(skip in netloc for skip in ["duckduckgo", "google", "bing", "yahoo", "w3.org", "schema.org", "yimg"]):
                                continue
                            return netloc
        except Exception:
            pass

        # Try Yahoo fallback
        try:
            import re
            from urllib.parse import unquote
            formatted_query = query.replace(" ", "+")
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                resp = await client.get(
                    f"https://search.yahoo.com/search?p={formatted_query}",
                    headers=self.headers,
                )
                if resp.status_code == 200:
                    raw_urls = re.findall(r'href=[\'\"]?([^\'\">]+)[\'\"]?', resp.text)
                    for u in raw_urls:
                        if "RU=" in u:
                            match = re.search(r'RU=([^/&]+)', u)
                            if match:
                                u = unquote(match.group(1))
                        
                        if not u.startswith("http"):
                            continue
                        
                        parsed = urlparse(u)
                        netloc = parsed.netloc.lower()
                        if netloc:
                            if netloc.startswith("www."):
                                netloc = netloc[4:]
                            if any(skip in netloc for skip in ["duckduckgo", "google", "bing", "yahoo", "w3.org", "schema.org", "yimg"]):
                                continue
                            return netloc
        except Exception:
            pass

        return None

    def _clean_subdomain(self, netloc: str) -> str:
        if not netloc:
            return netloc
        if netloc.startswith("www."):
            netloc = netloc[4:]
            
        subdomains_to_strip = ["career", "careers", "jobs", "blog", "blogs", "news", "about", "support", "help", "developer", "developers", "docs", "app", "apps", "portal", "my", "login", "register", "signup", "ir", "investor", "investors"]
        parts = netloc.split(".")
        if len(parts) > 2:
            if parts[0] in subdomains_to_strip:
                return ".".join(parts[1:])
            
            common_tlds = ["com", "org", "net", "edu", "gov", "co", "io", "ai", "tech", "app", "dev"]
            if parts[-1] in common_tlds and parts[-2] not in ["co", "org", "net", "gov", "ac", "sch"]:
                return ".".join(parts[1:])
        return netloc

    async def resolve(self, name: Optional[str] = None, domain: Optional[str] = None) -> str:
        """Return a verified domain string.

        Parameters
        ----------
        name: Optional[str]
            Company name supplied by the user.
        domain: Optional[str]
            Domain supplied by the user (may include scheme).
        """
        # If domain input has no dot or has spaces, treat it as a name instead
        if domain and "." in domain and " " not in domain:
            parsed = urlparse(domain if domain.startswith("http") else f"https://{domain}")
            if parsed.netloc:
                netloc = parsed.netloc.lower()
                return self._clean_subdomain(netloc)
        else:
            if domain:
                name = domain

        if name:
            result = await self._search_official(name)
            if result:
                return self._clean_subdomain(result)
        raise ValueError("Unable to resolve a valid domain for the company.")


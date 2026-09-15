import asyncio
from typing import List, Optional, Callable
from dataclasses import dataclass
import aiohttp
import json
from urllib.parse import quote


@dataclass
class SearchResult:
    title: str
    url: str
    description: str
    file_type: Optional[str] = None
    file_size: Optional[str] = None
    source: str = "web"


class WebSearchEngine:
    def __init__(self):
        self.search_providers = {
            'duckduckgo': self._search_duckduckgo,
            'google': self._search_google,
        }

    async def search(self, query: str, provider: str = 'duckduckgo', max_results: int = 10) -> List[SearchResult]:
        """Search for files or information on the web"""
        if provider not in self.search_providers:
            provider = 'duckduckgo'

        return await self.search_providers[provider](query, max_results)

    async def _search_duckduckgo(self, query: str, max_results: int = 10) -> List[SearchResult]:
        """Search using DuckDuckGo API"""
        results = []
        try:
            async with aiohttp.ClientSession() as session:
                url = f"https://html.duckduckgo.com/?q={quote(query)}&t=h_&ia=web"
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        # Simple parsing - in production use BeautifulSoup
                        text = await resp.text()
                        # This is a simplified version
                        # For full implementation, parse HTML with BeautifulSoup
                        results.append(SearchResult(
                            title="Search results available",
                            url="https://duckduckgo.com/?q=" + quote(query),
                            description="Open search results in browser"
                        ))
        except Exception as e:
            print(f"Search error: {e}")

        return results

    async def _search_google(self, query: str, max_results: int = 10) -> List[SearchResult]:
        """Search using Google (via custom search or web scraping)"""
        results = []
        try:
            async with aiohttp.ClientSession() as session:
                # Note: Direct Google search requires API key
                # This is a simplified version
                url = f"https://www.google.com/search?q={quote(query)}"
                results.append(SearchResult(
                    title="Google Search",
                    url=url,
                    description="Open Google search results"
                ))
        except Exception as e:
            print(f"Search error: {e}")

        return results

    async def search_file_repositories(self, filename: str) -> List[SearchResult]:
        """Search file repositories and common download sites"""
        results = []
        search_sites = [
            f"https://www.filehosting.com/search?q={quote(filename)}",
            f"https://www.mediafire.com/?q={quote(filename)}",
        ]

        for site in search_sites:
            results.append(SearchResult(
                title=f"Search on {site.split('/')[2]}",
                url=site,
                description=f"Download files from {site.split('/')[2]}"
            ))

        return results

    async def search_archive(self, query: str) -> List[SearchResult]:
        """Search Internet Archive for files"""
        results = []
        try:
            async with aiohttp.ClientSession() as session:
                url = f"https://archive.org/advancedsearch.php?q={quote(query)}&output=json"
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        if 'response' in data and 'docs' in data['response']:
                            for doc in data['response']['docs'][:10]:
                                results.append(SearchResult(
                                    title=doc.get('title', 'Untitled'),
                                    url=f"https://archive.org/details/{doc.get('identifier', '')}",
                                    description=doc.get('description', '')[:200],
                                    source="archive.org"
                                ))
        except Exception as e:
            print(f"Archive search error: {e}")

        return results

    async def verify_url(self, url: str) -> bool:
        """Verify if URL is accessible"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.head(url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                    return resp.status < 400
        except Exception:
            return False

    async def get_file_info(self, url: str) -> Optional[dict]:
        """Get file information (size, type, etc.)"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.head(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    headers = resp.headers
                    return {
                        'size': headers.get('content-length', 'Unknown'),
                        'type': headers.get('content-type', 'Unknown'),
                        'modified': headers.get('last-modified', 'Unknown'),
                        'accessible': resp.status < 400
                    }
        except Exception as e:
            print(f"Error getting file info: {e}")
            return None

import logging
from duckduckgo_search import DDGS

logger = logging.getLogger(__name__)


class WebSearchService:
    def search(self, query: str, max_results: int = 5) -> list[dict]:
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=max_results))
            return results
        except Exception as exc:
            logger.warning("Web search failed: %s", exc)
            return []

    def format_results(self, results: list[dict]) -> str:
        if not results:
            return "No results found."
        parts = []
        for i, r in enumerate(results, 1):
            title = r.get("title", "")
            body = r.get("body", "")
            href = r.get("href", "")
            parts.append(f"{i}. **{title}**\n   {body}\n   Source: {href}")
        return "\n\n".join(parts)

    def get_sources(self, results: list[dict]) -> list[str]:
        return [r.get("href", "") for r in results if r.get("href")]


search_service = WebSearchService()

from langchain_core.tools import StructuredTool
from pydantic import BaseModel
from duckduckgo_search import DDGS

class SearchInput(BaseModel):
    query: str

def web_search(query: str):
    """
    Searches the web using DuckDuckGo
    and returns the search results.
    """
    try:
        results = DDGS().text(query, max_results=3)
        return "\n".join([f"{r['title']}: {r['body']}" for r in results])
    except Exception as e:
        return f"Search failed: {str(e)}"

# Create Tool
search_tool = StructuredTool.from_function(
    name="web_search",
    description="Search the web using DuckDuckGo and return relevant information.",
    func=web_search,
    args_schema=SearchInput
)
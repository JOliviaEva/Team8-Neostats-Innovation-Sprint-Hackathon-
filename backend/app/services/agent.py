"""
LangGraph multi-mode agent.

Graph:  classify_intent → general_chat | web_search_chat | rag_chat → END

Intent routing:
  - doc_id present  → rag  (specific uploaded document)
  - web keywords    → web_search
  - otherwise       → general (auto-tries default RAG; falls back to web
                       search for academic queries with no local context)
"""
import logging
import re
from typing import Optional, TypedDict

from groq import Groq
from langgraph.graph import StateGraph, END

from app.config import settings
from app.services.memory import memory_service
from app.services.rag import rag_service, DEFAULT_COLLECTION_ID
from app.services.web_search import search_service

logger = logging.getLogger(__name__)

_WEB_KEYWORDS = {
    "latest", "current", "today", "news", "2024", "2025", "2026",
    "recent", "now", "stock", "weather", "trend", "update", "live",
    "tonight", "tomorrow", "yesterday", "this week", "happening",
    "price", "market", "score",
}

_ACADEMIC_KEYWORDS = frozenset({
    "university", "college", "course", "exam", "assignment", "grade", "marks",
    "professor", "faculty", "syllabus", "curriculum", "semester", "fee", "hostel",
    "scholarship", "admission", "degree", "campus", "student", "academic",
    "lecture", "research", "thesis", "dissertation", "subject", "module",
    "regulation", "policy", "handbook", "conduct", "assessment", "cia", "ese",
    "christ", "library", "placement", "internship", "project", "study", "learn",
    "education", "school", "tuition",
})

_VULGAR_WORDS = frozenset({
    "fuck", "shit", "ass", "bitch", "bastard", "dick", "cock", "pussy",
    "whore", "slut", "asshole", "wtf", "bullshit", "motherfucker", "fucker",
    "nigger", "nigga", "cunt", "prick", "twat",
})

_VULGAR_RESPONSE = (
    "I'm here as an academic assistant for Christ University students. "
    "Please keep our conversation respectful and focused on academic purposes. "
    "I'm happy to help with your studies, university resources, assignments, and more!"
)

_SYSTEM_BASE = (
    "You are NeoPulse, an intelligent AI assistant for Christ University students. "
    "You are helpful, accurate, and concise. "
    "Always respond in a friendly, professional tone. "
    "IMPORTANT: If you are not confident about an answer or do not have enough "
    "information to respond accurately, say honestly: 'I'm sorry, I don't have "
    "accurate information on that. Please check with the university office or "
    "consult official resources.' "
    "NEVER fabricate facts, dates, names, policies, or any information you "
    "are uncertain about."
)


def _contains_vulgar(text: str) -> bool:
    words = re.sub(r"[^a-z\s]", "", text.lower()).split()
    return bool(set(words) & _VULGAR_WORDS)


class AgentState(TypedDict):
    query: str
    session_id: str
    doc_id: Optional[str]
    intent: str
    context: str
    response: str
    mode: str
    sources: list[str]


def _call_groq(messages: list[dict]) -> str:
    client = Groq(api_key=settings.groq_api_key)
    resp = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        max_tokens=2048,
        temperature=0.3,
    )
    return resp.choices[0].message.content


def _history(session_id: str, limit: int = 12) -> list[dict]:
    return memory_service.get_history(session_id)[-limit:]


# ------------------------------------------------------------------ #
# Graph nodes                                                          #
# ------------------------------------------------------------------ #

def classify_intent(state: AgentState) -> AgentState:
    if state.get("doc_id"):
        state["intent"] = "rag"
        return state
    query_lower = state["query"].lower()
    if any(kw in query_lower for kw in _WEB_KEYWORDS):
        state["intent"] = "web_search"
    else:
        state["intent"] = "general"
    return state


def web_search_chat(state: AgentState) -> AgentState:
    results = search_service.search(state["query"])
    context = search_service.format_results(results)
    sources = search_service.get_sources(results)[:3]

    sys_prompt = (
        f"{_SYSTEM_BASE}\n\n"
        "Use the following real-time web search results to answer the user's question. "
        "Cite sources at the end of your answer.\n\n"
        f"Search Results:\n{context}"
    )
    messages = (
        [{"role": "system", "content": sys_prompt}]
        + _history(state["session_id"])
        + [{"role": "user", "content": state["query"]}]
    )
    state["response"] = _call_groq(messages)
    state["mode"] = "web_search"
    state["context"] = context
    state["sources"] = sources
    return state


def general_chat(state: AgentState) -> AgentState:
    # Try the default university docs collection first
    chunks = rag_service.retrieve(DEFAULT_COLLECTION_ID, state["query"], k=4)

    if not chunks:
        # Academic question with no local context → fetch from the web
        query_words = set(re.sub(r"[^a-z\s]", "", state["query"].lower()).split())
        if query_words & _ACADEMIC_KEYWORDS:
            return web_search_chat(state)

    if chunks:
        context = "\n\n---\n\n".join(chunks)
        sys_prompt = (
            f"{_SYSTEM_BASE}\n\n"
            "Use the following university document context to answer the question. "
            "If the context does not contain the answer, say so honestly rather "
            "than guessing.\n\n"
            f"University Context:\n{context}"
        )
        mode = "rag"
        sources = ["University Knowledge Base"]
    else:
        sys_prompt = _SYSTEM_BASE
        mode = "general"
        sources = []

    messages = (
        [{"role": "system", "content": sys_prompt}]
        + _history(state["session_id"])
        + [{"role": "user", "content": state["query"]}]
    )
    state["response"] = _call_groq(messages)
    state["mode"] = mode
    state["sources"] = sources
    return state


def rag_chat(state: AgentState) -> AgentState:
    doc_id = state.get("doc_id")
    if doc_id:
        chunks = rag_service.retrieve(doc_id, state["query"])
    else:
        chunks = rag_service.retrieve_all(state["query"])

    context = "\n\n---\n\n".join(chunks) if chunks else ""

    if context:
        sys_prompt = (
            f"{_SYSTEM_BASE}\n\n"
            "Answer the user's question using the document context below. "
            "If the answer is not in the context, say so honestly rather "
            "than guessing.\n\n"
            f"Document Context:\n{context}"
        )
    else:
        sys_prompt = (
            f"{_SYSTEM_BASE}\n\n"
            "No specific document context was found. Answer from general knowledge "
            "but be honest if you are uncertain."
        )

    messages = (
        [{"role": "system", "content": sys_prompt}]
        + _history(state["session_id"])
        + [{"role": "user", "content": state["query"]}]
    )
    state["response"] = _call_groq(messages)
    state["mode"] = "rag"
    state["context"] = context
    state["sources"] = [f"Document: {doc_id}"] if doc_id else ["University Knowledge Base"]
    return state


# ------------------------------------------------------------------ #
# Graph assembly                                                       #
# ------------------------------------------------------------------ #

def _build_graph():
    wf = StateGraph(AgentState)
    wf.add_node("classify", classify_intent)
    wf.add_node("general", general_chat)
    wf.add_node("web_search", web_search_chat)
    wf.add_node("rag", rag_chat)

    wf.set_entry_point("classify")
    wf.add_conditional_edges(
        "classify",
        lambda s: s["intent"],
        {"general": "general", "web_search": "web_search", "rag": "rag"},
    )
    wf.add_edge("general", END)
    wf.add_edge("web_search", END)
    wf.add_edge("rag", END)

    return wf.compile()


_graph = _build_graph()


# ------------------------------------------------------------------ #
# Public API                                                           #
# ------------------------------------------------------------------ #

def run_agent(
    query: str,
    session_id: str,
    doc_id: Optional[str] = None,
) -> dict:
    # Block vulgar / inappropriate input before it reaches the LLM
    if _contains_vulgar(query):
        memory_service.add_message(session_id, "user", query)
        memory_service.add_message(session_id, "assistant", _VULGAR_RESPONSE)
        return {"response": _VULGAR_RESPONSE, "mode": "general", "sources": []}

    state = AgentState(
        query=query,
        session_id=session_id,
        doc_id=doc_id,
        intent="",
        context="",
        response="",
        mode="",
        sources=[],
    )
    result = _graph.invoke(state)

    memory_service.add_message(session_id, "user", query)
    memory_service.add_message(session_id, "assistant", result["response"])

    return {
        "response": result["response"],
        "mode": result["mode"],
        "sources": result["sources"],
    }

"""
RAG service — uses pdfplumber for extraction, OpenAI text-embedding-3-small
for embeddings, and ChromaDB for persistent vector storage.
"""
import logging
import re
from pathlib import Path

import chromadb
import pdfplumber
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.config import settings

logger = logging.getLogger(__name__)

_CHROMA_DIR = Path("./storage/chroma")
_CHROMA_DIR.mkdir(parents=True, exist_ok=True)

_chroma_client = chromadb.PersistentClient(path=str(_CHROMA_DIR))

# Pre-existing collection that holds the vectorised university docs folder
DEFAULT_COLLECTION_ID = "11d5d0d1-94c1-4e70-803b-c68aae12237a"


def _safe_collection_name(doc_id: str) -> str:
    """Sanitize to ChromaDB collection name rules: 3-63 chars, [a-zA-Z0-9_-]."""
    name = re.sub(r"[^a-zA-Z0-9_-]", "_", doc_id)[:63]
    return name.ljust(3, "_")


class RAGService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            api_key=settings.openai_api_key,
            model=settings.openai_embed_model,
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=150,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        self._collections: dict[str, Chroma] = {}

    # ------------------------------------------------------------------ #
    # Extraction                                                           #
    # ------------------------------------------------------------------ #

    def extract_text(self, file_path: Path) -> str:
        text_parts: list[str] = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
                for table in page.extract_tables() or []:
                    for row in table:
                        row_text = " | ".join(cell or "" for cell in row)
                        if row_text.strip():
                            text_parts.append(row_text)
        return "\n\n".join(text_parts)

    # ------------------------------------------------------------------ #
    # Indexing                                                             #
    # ------------------------------------------------------------------ #

    def index_document(self, doc_id: str, file_path: Path) -> int:
        text = self.extract_text(file_path)
        chunks = self.splitter.split_text(text)
        if not chunks:
            logger.warning("No text extracted from %s", file_path)
            return 0

        collection_name = _safe_collection_name(doc_id)
        try:
            _chroma_client.delete_collection(collection_name)
        except Exception:
            pass

        collection = Chroma.from_texts(
            texts=chunks,
            embedding=self.embeddings,
            collection_name=collection_name,
            client=_chroma_client,
        )
        self._collections[doc_id] = collection
        logger.info("Indexed %d chunks for doc_id=%s (collection=%s)", len(chunks), doc_id, collection_name)
        return len(chunks)

    # ------------------------------------------------------------------ #
    # Collection access                                                    #
    # ------------------------------------------------------------------ #

    def get_index(self, doc_id: str) -> Chroma | None:
        if doc_id in self._collections:
            return self._collections[doc_id]
        collection_name = _safe_collection_name(doc_id)
        existing = {c.name for c in _chroma_client.list_collections()}
        if collection_name not in existing:
            return None
        collection = Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            client=_chroma_client,
        )
        self._collections[doc_id] = collection
        return collection

    # ------------------------------------------------------------------ #
    # Retrieval                                                            #
    # ------------------------------------------------------------------ #

    def retrieve(self, doc_id: str, query: str, k: int = 5) -> list[str]:
        collection = self.get_index(doc_id)
        if collection is None:
            return []
        docs = collection.similarity_search(query, k=k)
        return [d.page_content for d in docs]

    def retrieve_all(self, query: str, k: int = 5) -> list[str]:
        """Search across every persisted ChromaDB collection, default collection first."""
        results: list[str] = []

        # Always check the default university collection first
        default_chunks = self.retrieve(DEFAULT_COLLECTION_ID, query, k=k)
        results.extend(default_chunks)

        for col in _chroma_client.list_collections():
            if col.name == DEFAULT_COLLECTION_ID:
                continue
            try:
                collection = Chroma(
                    collection_name=col.name,
                    embedding_function=self.embeddings,
                    client=_chroma_client,
                )
                docs = collection.similarity_search(query, k=max(2, k // 2))
                results.extend(d.page_content for d in docs)
            except Exception as exc:
                logger.warning("Failed to search collection %s: %s", col.name, exc)
        return results[:k]

    def load_default_docs(self) -> None:
        existing_names = {c.name for c in _chroma_client.list_collections()}

        # The pre-built default collection already exists — just register it
        if DEFAULT_COLLECTION_ID in existing_names:
            if DEFAULT_COLLECTION_ID not in self._collections:
                collection = Chroma(
                    collection_name=DEFAULT_COLLECTION_ID,
                    embedding_function=self.embeddings,
                    client=_chroma_client,
                )
                self._collections[DEFAULT_COLLECTION_ID] = collection
                logger.info("Registered pre-existing default collection: %s", DEFAULT_COLLECTION_ID)
            return

        # Otherwise index all PDFs from the docs folder into the default collection
        folder = Path(settings.docs_folder)
        if not folder.exists():
            return

        all_chunks: list[str] = []
        for pdf_path in folder.glob("*.pdf"):
            try:
                text = self.extract_text(pdf_path)
                chunks = self.splitter.split_text(text)
                all_chunks.extend(chunks)
                logger.info("Extracted %d chunks from '%s'", len(chunks), pdf_path.name)
            except Exception as exc:
                logger.error("Failed to extract '%s': %s", pdf_path.name, exc)

        if all_chunks:
            try:
                collection = Chroma.from_texts(
                    texts=all_chunks,
                    embedding=self.embeddings,
                    collection_name=DEFAULT_COLLECTION_ID,
                    client=_chroma_client,
                )
                self._collections[DEFAULT_COLLECTION_ID] = collection
                logger.info(
                    "Indexed %d total chunks into default collection %s",
                    len(all_chunks),
                    DEFAULT_COLLECTION_ID,
                )
            except Exception as exc:
                logger.error("Failed to create default collection: %s", exc)

    def list_indices(self) -> list[str]:
        return list(self._collections.keys())


rag_service = RAGService()

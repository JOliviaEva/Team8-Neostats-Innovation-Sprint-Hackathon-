import logging
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import init_db
from app.api.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting NeoPulse backend…")
    init_db()

    # Pre-load default university documents into RAG
    from app.services.rag import rag_service
    try:
        rag_service.load_default_docs()
    except Exception as exc:
        logger.warning("Default doc pre-load failed: %s", exc)

    logger.info("NeoPulse backend ready on port %d", settings.backend_port)
    yield
    logger.info("Shutting down NeoPulse backend")


app = FastAPI(title="NeoPulse AI Agent", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.backend_port,
        reload=True,
    )

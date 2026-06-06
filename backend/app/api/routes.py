import json
import logging
import uuid
from pathlib import Path
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError

from app.config import settings
from app.db.database import get_db
from app.models.models import User, ChatSession, ChatMessage
from app.services.memory import memory_service
from app.services.rag import rag_service
from app.services.agent import run_agent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
_UPLOAD_DIR = Path("./storage/uploads")
_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24


# ------------------------------------------------------------------ #
# Schemas                                                              #
# ------------------------------------------------------------------ #

class RegisterRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class ChatRequest(BaseModel):
    session_id: str
    message: str
    doc_id: str | None = None


class NewSessionRequest(BaseModel):
    user_id: int | None = None


# ------------------------------------------------------------------ #
# Auth helpers                                                         #
# ------------------------------------------------------------------ #

def _make_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": str(user_id), "exp": expire}, settings.secret_key, algorithm=ALGORITHM)


def _decode_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None


# ------------------------------------------------------------------ #
# Auth endpoints                                                       #
# ------------------------------------------------------------------ #

@router.post("/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    user = User(username=req.username, hashed_password=_pwd.hash(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": _make_token(user.id), "user_id": user.id, "username": user.username}


@router.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not _pwd.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": _make_token(user.id), "user_id": user.id, "username": user.username}


# ------------------------------------------------------------------ #
# Session endpoints                                                    #
# ------------------------------------------------------------------ #

@router.post("/sessions")
def create_session(req: NewSessionRequest, db: Session = Depends(get_db)):
    session_id = str(uuid.uuid4())
    session = ChatSession(id=session_id, user_id=req.user_id, title="New Chat")
    db.add(session)
    db.commit()
    return {"session_id": session_id}


@router.get("/sessions/{user_id}")
def list_sessions(user_id: int, db: Session = Depends(get_db)):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id, ChatSession.is_active == True)
        .order_by(ChatSession.updated_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "session_id": s.id,
            "title": s.title,
            "doc_name": s.doc_name,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None,
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}/history")
def get_session_history(session_id: str, db: Session = Depends(get_db)):
    # Try Redis first (fast path)
    redis_history = memory_service.get_history(session_id)
    if redis_history:
        return {"session_id": session_id, "messages": redis_history}

    # Fallback to SQLite
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return {
        "session_id": session_id,
        "messages": [
            {"role": m.role, "content": m.content, "mode": m.mode}
            for m in messages
        ],
    }


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session:
        session.is_active = False
        db.commit()
    memory_service.clear_history(session_id)
    return {"status": "deleted"}


# ------------------------------------------------------------------ #
# Document upload                                                      #
# ------------------------------------------------------------------ #

@router.post("/documents/upload")
async def upload_document(
    session_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    save_path = _UPLOAD_DIR / f"{doc_id}.pdf"

    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    try:
        chunk_count = rag_service.index_document(doc_id, save_path)
    except Exception as exc:
        logger.error("Failed to index document: %s", exc)
        raise HTTPException(status_code=500, detail=f"Document indexing failed: {exc}")

    # Update session metadata
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session:
        session.doc_id = doc_id
        session.doc_name = file.filename
        db.commit()

    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "chunk_count": chunk_count,
        "message": f"Indexed {chunk_count} chunks from '{file.filename}'",
    }


# ------------------------------------------------------------------ #
# Chat endpoint                                                        #
# ------------------------------------------------------------------ #

@router.post("/chat")
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        result = run_agent(
            query=req.message,
            session_id=req.session_id,
            doc_id=req.doc_id,
        )
    except Exception as exc:
        logger.error("Agent error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Agent error: {exc}")

    # Persist to SQLite
    user_msg = ChatMessage(
        session_id=req.session_id,
        role="user",
        content=req.message,
        mode=result["mode"],
    )
    bot_msg = ChatMessage(
        session_id=req.session_id,
        role="assistant",
        content=result["response"],
        mode=result["mode"],
        sources=json.dumps(result["sources"]),
    )
    db.add(user_msg)
    db.add(bot_msg)

    # Update session title from first user message
    session = db.query(ChatSession).filter(ChatSession.id == req.session_id).first()
    if session and session.title == "New Chat":
        session.title = req.message[:60] + ("…" if len(req.message) > 60 else "")
    if session:
        session.updated_at = datetime.utcnow()

    db.commit()

    return {
        "response": result["response"],
        "mode": result["mode"],
        "sources": result["sources"],
        "session_id": req.session_id,
    }


# ------------------------------------------------------------------ #
# Health                                                               #
# ------------------------------------------------------------------ #

@router.get("/health")
def health():
    return {
        "status": "ok",
        "redis": memory_service.ping(),
        "rag_indices": rag_service.list_indices(),
    }

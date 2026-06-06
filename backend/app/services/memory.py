import json
import logging
import redis
from app.config import settings

logger = logging.getLogger(__name__)
_SESSION_TTL = 86400  # 24 hours


class ChatMemoryService:
    def __init__(self):
        self._client: redis.Redis | None = None

    @property
    def client(self) -> redis.Redis:
        if self._client is None:
            self._client = redis.from_url(settings.redis_url, decode_responses=True)
        return self._client

    def _key(self, session_id: str) -> str:
        return f"chat:{session_id}"

    def get_history(self, session_id: str) -> list[dict]:
        try:
            raw = self.client.get(self._key(session_id))
            return json.loads(raw) if raw else []
        except Exception as exc:
            logger.warning("Redis get_history failed: %s", exc)
            return []

    def add_message(self, session_id: str, role: str, content: str) -> None:
        try:
            history = self.get_history(session_id)
            history.append({"role": role, "content": content})
            self.client.setex(self._key(session_id), _SESSION_TTL, json.dumps(history))
        except Exception as exc:
            logger.warning("Redis add_message failed: %s", exc)

    def clear_history(self, session_id: str) -> None:
        try:
            self.client.delete(self._key(session_id))
        except Exception as exc:
            logger.warning("Redis clear_history failed: %s", exc)

    def ping(self) -> bool:
        try:
            return self.client.ping()
        except Exception:
            return False


memory_service = ChatMemoryService()

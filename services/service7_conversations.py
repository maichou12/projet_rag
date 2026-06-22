import json
import os
import uuid
from datetime import datetime, timezone

CONVERSATIONS_DIR = "data/conversations"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_dir():
    os.makedirs(CONVERSATIONS_DIR, exist_ok=True)


def _path(conv_id: str) -> str:
    return os.path.join(CONVERSATIONS_DIR, f"{conv_id}.json")


def _generer_titre(messages: list[dict]) -> str:
    for msg in messages:
        if msg.get("role") == "user" and msg.get("content"):
            texte = msg["content"].strip()
            return texte[:50] + ("..." if len(texte) > 50 else "")
    return "Nouvelle discussion"


class ConversationService:
    def __init__(self, base_dir: str = CONVERSATIONS_DIR):
        self.base_dir = base_dir
        _ensure_dir()

    def lister(self) -> list[dict]:
        _ensure_dir()
        result = []
        for filename in os.listdir(self.base_dir):
            if not filename.endswith(".json"):
                continue
            with open(os.path.join(self.base_dir, filename), encoding="utf-8") as f:
                data = json.load(f)
            result.append({
                "id": data["id"],
                "title": data.get("title", "Sans titre"),
                "updated_at": data.get("updated_at", data.get("created_at", "")),
            })
        result.sort(key=lambda x: x["updated_at"], reverse=True)
        return result

    def creer(self) -> dict:
        _ensure_dir()
        conv_id = str(uuid.uuid4())
        now = _now_iso()
        conversation = {
            "id": conv_id,
            "title": "Nouvelle discussion",
            "created_at": now,
            "updated_at": now,
            "messages": [],
        }
        with open(_path(conv_id), "w", encoding="utf-8") as f:
            json.dump(conversation, f, ensure_ascii=False, indent=2)
        return conversation

    def obtenir(self, conv_id: str) -> dict | None:
        path = _path(conv_id)
        if not os.path.exists(path):
            return None
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    def mettre_a_jour(self, conv_id: str, messages: list[dict], title: str | None = None) -> dict | None:
        conversation = self.obtenir(conv_id)
        if conversation is None:
            return None
        conversation["messages"] = messages
        conversation["updated_at"] = _now_iso()
        if title:
            conversation["title"] = title
        elif conversation["title"] == "Nouvelle discussion":
            conversation["title"] = _generer_titre(messages)
        with open(_path(conv_id), "w", encoding="utf-8") as f:
            json.dump(conversation, f, ensure_ascii=False, indent=2)
        return conversation

    def supprimer(self, conv_id: str) -> bool:
        path = _path(conv_id)
        if not os.path.exists(path):
            return False
        os.remove(path)
        return True

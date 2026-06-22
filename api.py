from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil, os
import json
from dotenv import load_dotenv

load_dotenv()

from services.service1_extraction import extraire_articles, sauvegarder_json
from services.service2_segmentation import segmenter_articles
from services.service3_vectorisation import VectorisationService
from services.service4_indexation import IndexationService
from services.service5_recherche import RechercheService
from services.service6_reponse import ReponseService
from services.service7_conversations import ConversationService

app = FastAPI(
    title="Chatbot Juridique — Code de la Famille Sénégalais",
    description="Système RAG sur le Code de la Famille du Sénégal",
    version="1.0.0"
)

# CORS pour le frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clé Groq (définir GROQ_API_KEY dans l'environnement ou un fichier .env)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Services chargés une seule fois au démarrage
vect_service = VectorisationService()
idx_service  = IndexationService()
rech_service = RechercheService()
rep_service  = ReponseService(api_key=GROQ_API_KEY)
conv_service = ConversationService()


# ─────────────────────────────────────────────
# Modèles Pydantic
# ─────────────────────────────────────────────

class SegmentRequest(BaseModel):
    articles: list[dict]

class VectorizeRequest(BaseModel):
    chunks: list[dict]

class IndexRequest(BaseModel):
    chunks: list[dict]

class SearchRequest(BaseModel):
    question: str
    top_k: int = 4

class ChatRequest(BaseModel):
    question: str
    top_k: int = 4

class MessageItem(BaseModel):
    role: str
    content: str
    sources: list[dict] = []
    timestamp: str | None = None

class ConversationUpdate(BaseModel):
    messages: list[MessageItem]
    title: str | None = None


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "API Chatbot Juridique opérationnelle 🚀"}


# S1 — Extraction
@app.post("/api/extract")
async def extract(file: UploadFile = File(...)):
    """Upload un PDF → retourne les articles extraits en JSON"""
    os.makedirs("data", exist_ok=True)
    pdf_path = f"data/{file.filename}"

    with open(pdf_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    articles = extraire_articles(pdf_path)
    sauvegarder_json(articles)

    return {
        "status": "success",
        "nb_articles": len(articles),
        "articles": articles
    }


# S2 — Segmentation
@app.post("/api/segment")
def segment(req: SegmentRequest):
    """Articles JSON → retourne les chunks avec métadonnées"""
    chunks = segmenter_articles(req.articles)
    return {
        "status": "success",
        "nb_chunks": len(chunks),
        "chunks": chunks
    }


# S3 — Vectorisation
@app.post("/api/vectorize")
def vectorize(req: VectorizeRequest):
    """Chunks → retourne les embeddings"""
    chunks = vect_service.vectoriser(req.chunks)
    return {
        "status": "success",
        "nb_chunks": len(chunks),
        "chunks": chunks
    }


# S4 — Indexation
@app.post("/api/index")
def index(req: IndexRequest):
    """Chunks vectorisés → stockage en base vectorielle"""
    idx_service.indexer(req.chunks)
    total = idx_service.stats()
    return {
        "status": "success",
        "total_indexed": total
    }


# S5 — Recherche
@app.post("/api/search")
def search(req: SearchRequest):
    """Question → retourne top-K articles avec scores et pages"""
    articles = rech_service.rechercher(req.question, top_k=req.top_k)
    return {
        "status": "success",
        "question": req.question,
        "nb_resultats": len(articles),
        "resultats": articles
    }


# S6 — Chat (Recherche + Génération)
@app.post("/api/chat")
def chat(req: ChatRequest):
    """Question → réponse générée + sources cliquables"""
    articles = rech_service.rechercher(req.question, top_k=req.top_k)
    resultat = rep_service.generer(req.question, articles)
    return {
        "status": "success",
        "question": req.question,
        "reponse": resultat["reponse"],
        "sources": resultat["sources"]
    }


# S7 — Conversations
@app.get("/api/conversations")
def list_conversations():
    return {"status": "success", "conversations": conv_service.lister()}


@app.post("/api/conversations")
def create_conversation():
    conversation = conv_service.creer()
    return {"status": "success", "conversation": conversation}


@app.get("/api/conversations/{conv_id}")
def get_conversation(conv_id: str):
    conversation = conv_service.obtenir(conv_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation introuvable")
    return {"status": "success", "conversation": conversation}


@app.put("/api/conversations/{conv_id}")
def update_conversation(conv_id: str, req: ConversationUpdate):
    messages = [m.model_dump() for m in req.messages]
    conversation = conv_service.mettre_a_jour(conv_id, messages, req.title)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation introuvable")
    return {"status": "success", "conversation": conversation}


@app.delete("/api/conversations/{conv_id}")
def delete_conversation(conv_id: str):
    if not conv_service.supprimer(conv_id):
        raise HTTPException(status_code=404, detail="Conversation introuvable")
    return {"status": "success", "message": "Conversation supprimée"}


@app.get("/api/suggestions")
def get_suggestions():
    path = "data/suggested_questions.json"
    if not os.path.exists(path):
        return {"status": "success", "suggestions": []}
    with open(path, encoding="utf-8") as f:
        suggestions = json.load(f)
    return {"status": "success", "suggestions": suggestions}
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

MODEL_NAME = 'intfloat/multilingual-e5-large'

class VectorisationService:
    def __init__(self):
        print(f"🔄 Chargement du modèle {MODEL_NAME}...")
        self.model = SentenceTransformer(MODEL_NAME)
        print("Modèle chargé.")

    def vectoriser(self, chunks: list[dict]) -> list[dict]:
        # multilingual-e5 : préfixer avec "passage: " pour l'indexation
        textes = ["passage: " + c['texte'] for c in chunks]

        print(f"🔄 Vectorisation de {len(textes)} chunks...")
        embeddings = self.model.encode(
            textes,
            batch_size=16,
            show_progress_bar=True,
            normalize_embeddings=True
        )

        for chunk, vec in zip(chunks, embeddings):
            chunk['embedding'] = vec.tolist()

        print(f"Service 3 — {len(chunks)} chunks vectorisés.")
        return chunks
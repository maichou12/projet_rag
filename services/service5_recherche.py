from sentence_transformers import SentenceTransformer
import chromadb

MODEL_NAME = 'intfloat/multilingual-e5-large'
COLLECTION_NAME = "code_famille_senegal"

class RechercheService:
    def __init__(self):
        print("Chargement du modèle pour la recherche...")
        self.model = SentenceTransformer(MODEL_NAME)
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_collection(COLLECTION_NAME)
        print("Service 5 prêt.")

    def rechercher(self, question: str, top_k: int = 4) -> list[dict]:
        # Préfixe "query:" obligatoire pour multilingual-e5
        vecteur = self.model.encode(
            ["query: " + question],
            normalize_embeddings=True
        )[0].tolist()

        resultats = self.collection.query(
            query_embeddings=[vecteur],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )

        articles = []
        for i in range(len(resultats["ids"][0])):
            articles.append({
                "chunk_id":      resultats["ids"][0][i],
                "texte":         resultats["documents"][0][i],
                "score":         round(1 - resultats["distances"][0][i], 3),
                "id_article":    resultats["metadatas"][0][i].get("id_article", ""),
                "titre_article": resultats["metadatas"][0][i].get("titre_article", ""),
                "page_debut":    resultats["metadatas"][0][i].get("page_debut", ""),
                "livre":         resultats["metadatas"][0][i].get("livre", ""),
            })

        return articles
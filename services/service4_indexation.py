import chromadb

COLLECTION_NAME = "code_famille_senegal"

class IndexationService:
    def __init__(self, persist_dir: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )
        print(f" Service 4 — Collection ChromaDB prête : {COLLECTION_NAME}")

    def indexer(self, chunks: list[dict]):
        ids         = [c['chunk_id'] for c in chunks]
        embeddings  = [c['embedding'] for c in chunks]
        documents   = [c['texte'] for c in chunks]
        metadatas   = [
            {
                'id_article':    c.get('id_article', ''),
                'titre_article': c.get('titre_article', ''),
                'page_debut':    str(c.get('page_debut', '')),
                'page_fin':      str(c.get('page_fin', '')),
                'livre':         c.get('livre', ''),
                'chapitre':      c.get('chapitre', ''),
            }
            for c in chunks
        ]

        # Ajout par lots de 100
        batch = 100
        for i in range(0, len(chunks), batch):
            self.collection.upsert(
                ids=ids[i:i+batch],
                embeddings=embeddings[i:i+batch],
                documents=documents[i:i+batch],
                metadatas=metadatas[i:i+batch]
            )
        print(f"Service 4 — {len(chunks)} chunks indexés dans ChromaDB.")

    def stats(self):
        n = self.collection.count()
        print(f"Total chunks en base : {n}")
        return n
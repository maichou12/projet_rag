from services.service1_extraction import extraire_articles, sauvegarder_json
from services.service2_segmentation import segmenter_articles
from services.service3_vectorisation import VectorisationService
from services.service4_indexation import IndexationService

PDF_PATH = "data/CODE-DE-LA-FAMILLE.pdf"

def run_pipeline():
    print("\n" + "="*50)
    print("  PIPELINE D'INGESTION — Code de la Famille")
    print("="*50 + "\n")

    # S1 — Extraction
    articles = extraire_articles(PDF_PATH)
    sauvegarder_json(articles)

    # S2 — Segmentation
    chunks = segmenter_articles(articles)
    ids = [c['chunk_id'] for c in chunks]
    assert len(ids) == len(set(ids)), f"Doublons détectés : {len(ids) - len(set(ids))}"
    print("Tous les chunk_id sont uniques")

    # S3 — Vectorisation
    vect_service = VectorisationService()
    chunks = vect_service.vectoriser(chunks)

    # S4 — Indexation
    idx_service = IndexationService()
    idx_service.indexer(chunks)
    idx_service.stats()

    print("\n Pipeline d'ingestion terminé avec succès !\n")

if __name__ == "__main__":
    run_pipeline()
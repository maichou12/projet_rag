import os
from dotenv import load_dotenv
from services.service5_recherche import RechercheService
from services.service6_reponse import ReponseService

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
if not GROQ_API_KEY:
    raise RuntimeError("Définissez la variable d'environnement GROQ_API_KEY")

def main():
    recherche = RechercheService()
    reponse_svc = ReponseService(api_key=GROQ_API_KEY)

    print("\n Chatbot Juridique — Code de la Famille Sénégalais")
    print("(tapez 'quit' pour quitter)\n")

    while True:
        question = input("❓ Votre question : ").strip()
        if question.lower() == "quit":
            break
        if not question:
            continue

        print("\n Recherche des articles pertinents...")
        articles = recherche.rechercher(question, top_k=4)

        print(f" {len(articles)} articles trouvés. Génération de la réponse...\n")
        resultat = reponse_svc.generer(question, articles)

        print("=" * 60)
        print("RÉPONSE :")
        print(resultat["reponse"])
        print("\n SOURCES UTILISÉES :")
        for s in resultat["sources"]:
            print(f"  • Art. {s['id_article']} — {s['titre_article']} | Page {s['page']} | Score: {s['score']}")
        print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
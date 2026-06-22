from groq import Groq
import re

def normaliser_reponse(texte: str) -> str:
    """Normalise le format Markdown et la typographie française."""
    if not texte:
        return texte

    # Apostrophes typographiques françaises (l'article → l'article)
    apostrophe = "\u2019"
    texte = re.sub(
        r"\b([ldjnmtsqcLDJNMTSQC])'(?=[a-zàâäéèêëïîôùûüœæA-Z])",
        lambda m: m.group(1) + apostrophe,
        texte,
    )

    # Art. 189 / article 189 → **Article 189** (si pas déjà en gras)
    def _bold_article(match):
        num = match.group(1)
        return f"**Article {num}**"

    texte = re.sub(
        r"(?<!\*)\b(?:Art\.?|article)\s+(\d+)\b(?!\*)",
        _bold_article,
        texte,
        flags=re.IGNORECASE,
    )

    # Paragraphes : saut de ligne après les phrases longues si tout est sur une ligne
    if "\n\n" not in texte and len(texte) > 400:
        texte = re.sub(r"(?<=[.!?])\s+(?=[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŒ])", "\n\n", texte)

    return texte.strip()


class ReponseService:
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile"

    def generer(self, question: str, articles: list[dict]) -> dict:
        # Construction du contexte
        context = ""
        for a in articles:
            context += f"\n---\nArt. {a['id_article']} — {a['titre_article']} (Page {a['page_debut']})\n{a['texte']}\n"

        prompt_system = """Tu es un expert juridique spécialisé dans le Code de la Famille sénégalais.
Réponds UNIQUEMENT sur la base des articles fournis ci-dessous.
Si la réponse ne se trouve pas dans les articles fournis, dis-le explicitement.

FORMAT OBLIGATOIRE :
- Rédige en français soigné avec des apostrophes correctes (l'article, d'abord, qu'il).
- Mets en gras chaque référence d'article au format Markdown : **Article 123** (ex. **Article 189**).
- Structure ta réponse en paragraphes courts séparés par une ligne vide.
- Commence par une phrase de synthèse, développe avec les articles cités, conclus brièvement si pertinent.
- Cite le numéro d'article dans le texte à chaque fois que tu t'appuies sur un article."""

        prompt_user = f"""ARTICLES PERTINENTS:
{context}

QUESTION: {question}"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": prompt_system},
                {"role": "user",   "content": prompt_user}
            ],
            temperature=0.2,
            max_tokens=1024
        )

        reponse_texte = normaliser_reponse(response.choices[0].message.content)

        return {
            "reponse": reponse_texte,
            "sources": [
                {
                    "id_article":    a["id_article"],
                    "titre_article": a["titre_article"],
                    "page":          a["page_debut"],
                    "score":         a["score"],
                    "livre":         a["livre"],
                }
                for a in articles
            ]
        }
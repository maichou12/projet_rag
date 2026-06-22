import pdfplumber
import re
import json

def extraire_articles(pdf_path: str) -> list[dict]:
    """
    Extrait les articles du Code de la Famille depuis un PDF.
    Retourne une liste de dicts avec id_article, texte, page, etc.
    """
    articles = []
    article_courant = None
    buffer_texte = []
    page_debut = None

    pattern_article = re.compile(r'^Art(?:icle)?\.?\s*(\d+)', re.IGNORECASE)

    with pdfplumber.open(pdf_path) as pdf:
        for num_page, page in enumerate(pdf.pages, start=1):
            texte_page = page.extract_text()
            if not texte_page:
                continue

            lignes = texte_page.split('\n')

            for ligne in lignes:
                ligne = ligne.strip()
                if not ligne:
                    continue

                # Ignorer en-têtes/pieds de page courants
                if re.match(r'^(CODE DE LA FAMILLE|Page \d+|Sénégal)', ligne, re.IGNORECASE):
                    continue

                match = pattern_article.match(ligne)
                if match:
                    # Sauvegarder l'article précédent
                    if article_courant:
                        article_courant['texte'] = ' '.join(buffer_texte).strip()
                        article_courant['page_fin'] = num_page
                        articles.append(article_courant)

                    # Nouveau article
                    num_art = match.group(1)
                    article_courant = {
                        'id_article': num_art,
                        'titre_article': ligne,  # on affine après
                        'page_debut': num_page,
                        'page_fin': num_page,
                        'livre': '',    # à enrichir si besoin
                        'chapitre': '',
                    }
                    buffer_texte = [ligne]
                    page_debut = num_page
                else:
                    if article_courant:
                        buffer_texte.append(ligne)

        # Dernier article
        if article_courant:
            article_courant['texte'] = ' '.join(buffer_texte).strip()
            articles.append(article_courant)

    print(f"Service 1 — {len(articles)} articles extraits.")
    return articles


def sauvegarder_json(articles: list[dict], output_path: str = "data/articles.json"):
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
    print(f" Articles sauvegardés → {output_path}")
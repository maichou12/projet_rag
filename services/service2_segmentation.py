def segmenter_articles(articles: list[dict],
                        max_tokens: int = 500,
                        overlap_chars: int = 200) -> list[dict]:
    chunks = []
    global_idx = 0  # ← index global unique

    for article in articles:
        texte = article.get('texte', '')
        mots = texte.split()

        if len(mots) <= max_tokens:
            chunk = {
                'chunk_id': f"art_{article['id_article']}_chunk_1_g{global_idx}",
                **article,
                'tokens': len(mots)
            }
            chunks.append(chunk)
            global_idx += 1
        else:
            pas = max_tokens - (overlap_chars // 5)
            debut = 0
            idx_chunk = 1
            while debut < len(mots):
                fin = min(debut + max_tokens, len(mots))
                segment = ' '.join(mots[debut:fin])
                chunk = {
                    'chunk_id': f"art_{article['id_article']}_chunk_{idx_chunk}_g{global_idx}",
                    **article,
                    'texte': segment,
                    'tokens': fin - debut
                }
                chunks.append(chunk)
                debut += pas
                idx_chunk += 1
                global_idx += 1
                if fin == len(mots):
                    break

    print(f"Service 2 — {len(chunks)} chunks produits depuis {len(articles)} articles.")
    return chunks
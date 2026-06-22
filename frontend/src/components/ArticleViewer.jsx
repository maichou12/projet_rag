import { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, Search } from 'lucide-react';
import { loadArticlePage } from '../utils/pdfArticleHighlight';

export default function ArticleViewer({ articleId, page, onClose }) {
  const scrollRef = useRef(null);
  const canvasHostRef = useRef(null);
  const highlightRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState(null);

  useEffect(() => {
    if (!articleId || !page) return undefined;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setView(null);

    loadArticlePage(articleId, page)
      .then((result) => {
        if (cancelled) return;
        setView(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Impossible de charger le PDF');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [articleId, page]);

  useEffect(() => {
    if (!view?.canvas || !canvasHostRef.current) return;
    canvasHostRef.current.innerHTML = '';
    canvasHostRef.current.appendChild(view.canvas);
  }, [view]);

  useEffect(() => {
    if (!view?.highlights?.length || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [view]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const openRawPdf = () => {
    window.open(`/CODE-DE-LA-FAMILLE.pdf#page=${view?.pageNum ?? page}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-deep/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full max-w-4xl max-h-[92vh] bg-bg-warm rounded-2xl shadow-2xl border border-black/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 px-5 py-4 border-b border-black/5 bg-white">
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-semibold text-primary truncate">
              Article {articleId}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {view?.found
                ? `Repéré sur la page ${view.pageNum} du Code de la Famille`
                : `Page ${view?.pageNum ?? page} — recherche « Article ${articleId} »`}
            </p>
          </div>
          <button
            type="button"
            onClick={openRawPdf}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-secondary px-3 py-2 rounded-lg hover:bg-bg-warm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            PDF complet
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-warm text-text-muted hover:text-primary transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-auto bg-[#525659] p-4 sm:p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-bg-warm/80 gap-3">
              <Search className="w-8 h-8 animate-pulse" />
              <p className="text-sm">Recherche de l&apos;article dans le PDF…</p>
            </div>
          )}

          {error && (
            <div className="text-center py-16 text-red-100 text-sm">{error}</div>
          )}

          {view && !loading && (
            <div className="mx-auto w-fit">
              {!view.found && (
                <p className="mb-3 text-xs text-center text-bg-warm/70 bg-black/20 rounded-lg px-3 py-2">
                  Article non localisé précisément — affichage de la page {view.pageNum}
                </p>
              )}
              <div
                className="relative shadow-xl"
                style={{ width: view.viewport.width, height: view.viewport.height }}
              >
                <div ref={canvasHostRef} className="relative" />
                <div className="absolute inset-0 pointer-events-none">
                  {view.highlights.map((h, i) => (
                    <div
                      key={i}
                      ref={i === 0 ? highlightRef : null}
                      className="absolute rounded-sm bg-accent/45 border-2 border-accent shadow-[0_0_12px_rgba(201,168,76,0.6)] animate-highlight-pulse"
                      style={{
                        left: h.left,
                        top: h.top,
                        width: h.width,
                        height: h.height,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

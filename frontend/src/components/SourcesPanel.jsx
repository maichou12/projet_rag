import { BookOpen, ExternalLink } from 'lucide-react';

export default function SourcesPanel({ sources, onOpenPdf }) {
  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-secondary" />
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
          Sources citées
        </h3>
      </div>

      {sources.length === 0 ? (
        <p className="text-xs text-text-muted/70 leading-relaxed px-1">
          Les articles du Code de la Famille apparaîtront ici après votre question.
        </p>
      ) : (
        <div className="space-y-2">
          {sources.map((s, i) => (
            <button
              key={i}
              onClick={() => onOpenPdf({ idArticle: s.id_article, page: s.page })}
              className="
                w-full text-left p-3 rounded-xl
                bg-bg-warm border border-black/5
                hover:border-secondary/30 hover:shadow-md
                transition-all duration-200 group
              "
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-secondary">
                  Art. {s.id_article}
                </span>
                <ExternalLink className="w-3 h-3 text-text-muted group-hover:text-accent transition-colors" />
              </div>
              <p className="text-xs text-text-muted mt-1 truncate">
                {s.titre_article || `Article ${s.id_article}`}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-text-muted">Page {s.page}</span>
                <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  {Math.round(s.score * 100)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

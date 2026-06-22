import ReactMarkdown from 'react-markdown';
import { useMemo } from 'react';

function getTextContent(children) {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(getTextContent).join('');
  if (children?.props?.children) return getTextContent(children.props.children);
  return '';
}

function buildArticlePageMap(sources) {
  const map = new Map();
  for (const s of sources ?? []) {
    const page = Number.parseInt(String(s.page), 10);
    if (Number.isFinite(page) && page > 0) {
      map.set(String(s.id_article), page);
    }
  }
  return map;
}

export default function BotMessageContent({ content, sources = [], onOpenPdf }) {
  const articlePages = useMemo(() => buildArticlePageMap(sources), [sources]);

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => {
          const text = getTextContent(children).trim();
          const match = text.match(/^Article\s+(\d+)$/i);
          const page = match ? articlePages.get(match[1]) : null;

          if (page && onOpenPdf) {
            return (
              <button
                type="button"
                onClick={() => onOpenPdf({ idArticle: match[1], page })}
                title={`Voir l'article ${match[1]} sur la page ${page}`}
                className="font-semibold text-secondary not-italic hover:underline cursor-pointer inline p-0 bg-transparent border-0 align-baseline"
              >
                {children}
              </button>
            );
          }

          return (
            <strong className="font-semibold text-secondary not-italic">
              {children}
            </strong>
          );
        },
        em: ({ children }) => (
          <em className="italic text-text-dark/90">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="mb-3 last:mb-0 ml-4 list-disc space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 last:mb-0 ml-4 list-decimal space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

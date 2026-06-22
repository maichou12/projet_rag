import {
  Scale, Home, Heart, Handshake, Gavel, Baby, Building, Shield,
} from 'lucide-react';

const ICON_MAP = {
  mariage: Scale,
  autorite: Home,
  succession: Gavel,
  aliments: Handshake,
  divorce: Scale,
  filiation: Baby,
  regime: Building,
  tutelle: Shield,
};

function getIcon(id) {
  return ICON_MAP[id] || Heart;
}

export default function QuickQuestions({ suggestions, onSelect, loading }) {
  if (!suggestions.length) return null;

  return (
    <div className="px-4 py-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-3">
        Questions fréquentes
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((s) => {
          const Icon = getIcon(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.question)}
              disabled={loading}
              className="
                group flex items-start gap-3 p-3 rounded-xl text-left
                bg-bg-warm border border-black/5
                hover:border-accent/40 hover:shadow-md hover:-translate-y-0.5
                transition-all duration-200
                disabled:opacity-50
              "
            >
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                <Icon className="w-4 h-4 text-secondary group-hover:text-accent transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-dark leading-snug">{s.label}</p>
                <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{s.question}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

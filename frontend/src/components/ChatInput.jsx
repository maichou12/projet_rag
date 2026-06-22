import { ArrowUp, Mic } from 'lucide-react';

export default function ChatInput({ value, onChange, onSend, loading, onKeyDown }) {
  return (
    <div className="px-5 py-4 bg-bg-warm-alt border-t border-black/5">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="Posez votre question juridique…"
            rows={1}
            disabled={loading}
            className="
              w-full resize-none rounded-2xl px-5 py-3.5
              bg-white border border-black/8
              text-sm text-text-dark placeholder:text-text-muted/60
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40
              transition-all duration-200
              disabled:opacity-50
            "
          />
        </div>
        <button
          type="button"
          className="
            w-10 h-10 rounded-full flex items-center justify-center
            border border-black/8 text-text-muted
            hover:border-accent/40 hover:text-accent
            transition-all duration-200
            hidden sm:flex
          "
          title="Dictée vocale (bientôt)"
          disabled
        >
          <Mic className="w-4 h-4" />
        </button>
        <button
          onClick={onSend}
          disabled={loading || !value.trim()}
          className="
            w-11 h-11 rounded-full flex items-center justify-center shrink-0
            bg-accent text-primary-deep
            hover:bg-accent-light
            shadow-md hover:shadow-lg
            transition-all duration-200
            disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed
          "
          title="Envoyer"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

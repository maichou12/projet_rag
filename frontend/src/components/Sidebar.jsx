import {
  MessageSquare,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import AgentAvatar from './AgentAvatar';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (now - d < 86400000) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function Sidebar({
  conversations,
  activeId,
  loading,
  onSelect,
  onNew,
  onDelete,
  mobileOpen,
  onClose,
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-primary-deep/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col w-[280px] min-w-[280px] h-full
          bg-gradient-to-b from-primary-deep via-primary to-secondary/90
          border-r border-white/10
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo & titre */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-accent/20 blur-sm scale-110" />
              <AgentAvatar size="lg" className="relative ring-accent/60" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-accent tracking-wide">
                Juridique SN
              </h1>
              <p className="text-[11px] text-bg-warm/60 tracking-widest uppercase mt-0.5">
                Code de la Famille
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto lg:hidden p-1.5 text-bg-warm/50 hover:text-bg-warm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nouvelle discussion */}
        <div className="px-4 py-4">
          <button
            onClick={onNew}
            disabled={loading}
            className="
              w-full flex items-center justify-center gap-2
              px-4 py-2.5 rounded-lg
              border border-accent/50 text-accent text-sm font-medium
              hover:bg-accent/10 hover:border-accent
              transition-all duration-200
              disabled:opacity-50
            "
          >
            <Plus className="w-4 h-4" />
            Nouvelle discussion
          </button>
        </div>

        {/* Liste discussions */}
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {loading ? (
            <p className="text-center text-bg-warm/40 text-sm py-8">Chargement…</p>
          ) : conversations.length === 0 ? (
            <p className="text-center text-bg-warm/40 text-sm py-8">Aucune discussion</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`
                  group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer
                  transition-all duration-150
                  ${c.id === activeId
                    ? 'bg-white/10 border-l-2 border-accent'
                    : 'hover:bg-white/5 border-l-2 border-transparent'}
                `}
              >
                <MessageSquare
                  className={`w-4 h-4 shrink-0 ${c.id === activeId ? 'text-accent' : 'text-bg-warm/40'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${c.id === activeId ? 'text-bg-warm font-medium' : 'text-bg-warm/70'}`}>
                    {c.title}
                  </p>
                  <p className="text-[10px] text-bg-warm/35 mt-0.5">{formatDate(c.updated_at)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-bg-warm/30 hover:text-red-300 transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-[10px] text-bg-warm/30 text-center tracking-wide">
            © 2026 — Cabinet Juridique SN
          </p>
        </div>
      </aside>
    </>
  );
}

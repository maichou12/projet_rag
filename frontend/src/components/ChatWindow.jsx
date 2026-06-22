import { useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { AGENT } from '../constants/agent';
import AgentAvatar from './AgentAvatar';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import QuickQuestions from './QuickQuestions';

export default function ChatWindow({
  messages,
  loading,
  input,
  setInput,
  onSend,
  onOpenSidebar,
  onOpenPdf,
  showWelcome,
  suggestions,
  onPrefill,
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <main className="flex flex-col flex-1 min-w-0 h-full bg-bg-warm-alt">
      {/* En-tête */}
      <header className="flex items-center gap-3 px-5 py-4 bg-bg-warm border-b border-black/5">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-black/5 text-primary"
        >
          <Menu className="w-5 h-5" />
        </button>
        <AgentAvatar size="lg" className="ring-accent/50" />
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-base font-semibold text-primary">{AGENT.name}</h2>
          <p className="text-[11px] text-text-muted truncate">{AGENT.subtitle}</p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          En ligne
        </span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col gap-5 max-w-3xl mx-auto">
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} index={i} onOpenPdf={onOpenPdf} />
          ))}
          {loading && <TypingIndicator />}
          {showWelcome && suggestions?.length > 0 && (
            <div className="md:hidden mt-2">
              <QuickQuestions
                suggestions={suggestions}
                onSelect={onPrefill}
                loading={loading}
              />
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Footer status */}
      <div className="px-5 py-2 bg-bg-warm border-t border-black/5">
        <p className="text-[10px] text-text-muted text-center tracking-wide">
          Sources : Code de la Famille du Sénégal — Réponse générée par IA, vérification conseillée
        </p>
      </div>

      <ChatInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onSend={onSend}
        loading={loading}
        onKeyDown={handleKeyDown}
      />
    </main>
  );
}

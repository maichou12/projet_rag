import { AGENT } from '../constants/agent';
import AgentAvatar from './AgentAvatar';

export default function TypingIndicator() {
  return (
    <div className="animate-fade-in-up flex gap-3 max-w-[85%] self-start items-end">
      <AgentAvatar size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted font-medium mb-1.5 ml-1">{AGENT.name}</p>
        <div className="flex items-center gap-3 bg-bg-warm rounded-2xl rounded-tl-md px-5 py-3.5 shadow-md border border-black/5">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary/40 animate-pulse-soft" />
            <span className="w-2 h-2 rounded-full bg-secondary/40 animate-pulse-soft [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-secondary/40 animate-pulse-soft [animation-delay:0.4s]" />
          </div>
          <span className="text-xs text-text-muted italic">Réflexion en cours…</span>
        </div>
      </div>
    </div>
  );
}

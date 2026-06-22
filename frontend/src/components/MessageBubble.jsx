import { AGENT } from '../constants/agent';
import AgentAvatar, { UserAvatar } from './AgentAvatar';
import BotMessageContent from './BotMessageContent';

function BotBubble({ children }) {
  return (
    <div className="bg-bg-warm text-text-dark rounded-2xl rounded-tl-md shadow-md border border-black/5 px-4 py-3 text-sm leading-relaxed">
      {children}
    </div>
  );
}

export default function MessageBubble({ message, index, onOpenPdf }) {
  const isUser = message.role === 'user';

  if (message.isWelcome) {
    return (
      <div
        className="animate-fade-in-up flex gap-3 max-w-[92%] self-start items-end"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <AgentAvatar size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted font-medium mb-1.5 ml-1">{AGENT.name}</p>
          <div className="bg-bg-warm rounded-2xl rounded-tl-md px-5 py-4 shadow-md border border-black/5">
            <p className="font-display text-base text-text-dark leading-relaxed">
              {message.content}
            </p>
            {message.quote && (
              <p className="mt-3 text-sm italic text-secondary/80 border-l-2 border-accent pl-3">
                {message.quote}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div
        className="animate-fade-in-up flex gap-3 max-w-[85%] self-end items-end flex-row-reverse"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <UserAvatar size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted font-medium mb-1.5 mr-1 text-right">Vous</p>
          <div className="bg-secondary text-bg-warm rounded-2xl rounded-br-md shadow-md px-4 py-3 text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in-up flex gap-3 max-w-[85%] self-start items-end"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <AgentAvatar size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted font-medium mb-1.5 ml-1">{AGENT.name}</p>
        <BotBubble>
          <BotMessageContent
            content={message.content}
            sources={message.sources}
            onOpenPdf={onOpenPdf}
          />
        </BotBubble>
      </div>
    </div>
  );
}

import { User } from 'lucide-react';
import { AGENT } from '../constants/agent';

export default function AgentAvatar({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 ring-1',
    md: 'w-10 h-10 ring-2',
    lg: 'w-12 h-12 ring-2',
    xl: 'w-14 h-14 ring-2',
  };

  return (
    <img
      src={AGENT.avatar}
      alt={AGENT.name}
      className={`
        ${sizes[size] || sizes.md}
        rounded-full object-cover object-top
        ring-accent/40 shadow-md shrink-0
        ${className}
      `}
    />
  );
}

export function UserAvatar({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  };

  return (
    <div
      className={`
        ${sizes[size] || sizes.md}
        rounded-full bg-secondary/15 border border-secondary/20
        flex items-center justify-center shrink-0
        ${className}
      `}
    >
      <User className="w-1/2 h-1/2 text-secondary" strokeWidth={1.5} />
    </div>
  );
}

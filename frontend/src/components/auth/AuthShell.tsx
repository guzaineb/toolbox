'use client';

import { cn } from '@/lib/utils';

interface AuthShellProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export default function AuthShell({ left, right, className }: AuthShellProps) {
  return (
    <div className={cn(
      'flex flex-col lg:flex-row',
      'min-h-[600px] sm:min-h-[650px] md:min-h-[700px]',
      'rounded-xl sm:rounded-2xl md:rounded-3xl',
      'overflow-hidden',
      'border border-border',
      'bg-surface',
      'animate-slideIn',
      className
    )}>
      {left}
      {right}
    </div>
  );
}
import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';

type Tone = 'destructive' | 'warning' | 'neutral';

interface ErrorStateProps {
  title?: string;
  message?: ReactNode;
  /** Lucide icon override. Defaults to AlertTriangle. */
  icon?: ReactNode;
  tone?: Tone;
  /** If provided, renders a "Try again" button. */
  onRetry?: () => void;
  retryLabel?: string;
  /** Wrap the state in a Surface for inline/contained contexts. */
  surface?: boolean;
  className?: string;
}

const TONE: Record<Tone, { bg: string; fg: string }> = {
  destructive: { bg: 'bg-destructive/10', fg: 'text-destructive' },
  warning: {
    bg: 'bg-[rgb(var(--solar-gold-rgb)/0.12)]',
    fg: 'text-[rgb(var(--solar-gold-rgb))]',
  },
  neutral: { bg: 'bg-white/[0.04]', fg: 'text-muted-foreground' },
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  icon,
  tone = 'destructive',
  onRetry,
  retryLabel = 'Try again',
  surface = false,
  className,
}: ErrorStateProps) {
  const palette = TONE[tone];
  const body = (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className={cn('mb-4 rounded-full p-4', palette.bg)}>
        {icon ?? <AlertTriangle className={cn('h-8 w-8', palette.fg)} />}
      </div>
      <h4 className="type-heading-3 text-foreground">{title}</h4>
      {message ? (
        <div className="mt-2 max-w-md type-body-sm text-muted-foreground">{message}</div>
      ) : null}
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-6">
          <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
  if (!surface) return body;
  return (
    <Surface variant="glass" padding="none">
      {body}
    </Surface>
  );
}

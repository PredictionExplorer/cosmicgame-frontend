import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

interface LoadingStateProps {
  title?: string;
  description?: ReactNode;
  /** Estimated-time hint — useful for blockchain ops. */
  hint?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({
  title = 'Loading',
  description,
  hint,
  size = 'md',
  className,
}: LoadingStateProps) {
  const pad = size === 'sm' ? 'py-8' : size === 'lg' ? 'py-24' : 'py-16';
  return (
    <div
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center text-center', pad, className)}
    >
      <Spinner size={size} />
      <p className="mt-4 type-heading-3 text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm type-body-sm text-muted-foreground">{description}</p>
      ) : null}
      {hint ? <p className="mt-3 max-w-sm type-body-sm text-muted-foreground/70">{hint}</p> : null}
    </div>
  );
}

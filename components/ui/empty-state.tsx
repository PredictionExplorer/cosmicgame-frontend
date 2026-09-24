import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  /**
   * Heading level of the title. Defaults to 4; pass 3 under a section `h2`,
   * or 2 when the state stands in for a section of its own.
   */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  headingLevel = 4,
  className,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-4 py-16 text-center', className)}
    >
      <div className="mb-5 rounded-2xl border border-secondary/15 bg-secondary/[0.05] p-4">
        {icon ?? <Inbox className="h-8 w-8 text-secondary/70" />}
      </div>
      <Heading className="type-heading-3 font-medium">{title}</Heading>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

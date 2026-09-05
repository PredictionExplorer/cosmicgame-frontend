import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-4 py-16 text-center', className)}
    >
      <div className="mb-5 rounded-2xl border border-secondary/15 bg-secondary/[0.05] p-4">
        {icon ?? <Inbox className="h-8 w-8 text-secondary/70" />}
      </div>
      <h4 className="type-heading-3 font-medium">{title}</h4>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

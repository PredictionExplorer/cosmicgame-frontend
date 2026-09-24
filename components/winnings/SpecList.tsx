import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * A spec sheet: label and value pairs divided by faint hairlines, with no
 * box around them (docs/design-system.md: hairlines separate, borders
 * identify). Server-safe.
 */
export function SpecList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl className={cn('divide-y divide-rule-faint border-y border-rule-faint', className)}>
      {children}
    </dl>
  );
}

/**
 * One line of a SpecList: the label at the start in the label tier, the
 * value at the end in tabular figures. When the two do not fit side by side
 * the value wraps under the label, still flush with the end edge.
 */
export function SpecRow({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[var(--row-h)] flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2.5',
        className,
      )}
    >
      <dt className="type-label text-subtle">{label}</dt>
      <dd className="ms-auto min-w-0 text-end type-body-md tabular-nums text-foreground">
        {children}
      </dd>
    </div>
  );
}

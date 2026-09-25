import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * How tall a spec sheet's rows are: `default` at the ledger row height
 * (48px, `--row-h`) with body-size values, `dense` at the dense row height
 * (44px, `--row-h-dense`) with dense body values, for a sheet that sits
 * beside a plate or inside a narrow column.
 */
export type SpecListDensity = 'default' | 'dense';

const ROW_CLASS: Record<SpecListDensity, string> = {
  default: 'min-h-[var(--row-h)]',
  dense: 'min-h-[var(--row-h-dense)]',
};

const VALUE_CLASS: Record<SpecListDensity, string> = {
  default: 'type-body-md',
  dense: 'type-body-sm',
};

/**
 * A spec sheet: label and value pairs divided by faint hairlines, with no
 * box around them (docs/design-system.md: hairlines separate, borders
 * identify). The one key/value primitive of a record page: every value sits
 * at one size and weight, flush with the end edge. Server-safe.
 */
export function SpecList({
  children,
  density = 'default',
  className,
}: {
  children: ReactNode;
  density?: SpecListDensity;
  className?: string;
}) {
  return (
    <dl
      data-density={density}
      className={cn('divide-y divide-rule-faint border-y border-rule-faint', className)}
    >
      {children}
    </dl>
  );
}

/**
 * One line of a SpecList: the label at the start in the label tier, the
 * value at the end in tabular figures. When the two do not fit side by side
 * the value wraps under the label, still flush with the end edge. Pass the
 * list's `density` to the row as well.
 */
export function SpecRow({
  label,
  children,
  density = 'default',
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  density?: SpecListDensity;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2.5',
        ROW_CLASS[density],
        className,
      )}
    >
      <dt className="type-label text-subtle">{label}</dt>
      <dd
        className={cn(
          'ms-auto min-w-0 text-end tabular-nums text-foreground',
          VALUE_CLASS[density],
        )}
      >
        {children}
      </dd>
    </div>
  );
}

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface RecordRowProps {
  label: ReactNode;
  children: ReactNode;
  /** A caption line under the value (how long ago, a rank's context). */
  caption?: ReactNode;
  /**
   * `wide` (default): a record page's ledger. The value sits under its label
   * on phones and beside a 13rem label column from `sm`.
   * `narrow`: the spec sheet in a Signature's wall label, a 7.5rem label
   * column beside the value at every width.
   */
  labelWidth?: 'narrow' | 'wide';
  testId?: string;
  className?: string;
}

const ROW_LAYOUT = {
  wide: 'grid gap-1 py-3.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:items-baseline sm:gap-8',
  narrow: 'grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-baseline gap-x-4 py-3',
} as const;

/**
 * RecordRow — one label / value row of a record's ledger: a sentence-case
 * label in the subtle tier and its value, inside a `<dl>` whose rows the
 * caller divides with `divide-rule-faint`. The one row every record page
 * uses, so the label columns line up and a fix reaches every page.
 */
export function RecordRow({
  label,
  children,
  caption,
  labelWidth = 'wide',
  testId,
  className,
}: RecordRowProps) {
  return (
    <div className={cn(ROW_LAYOUT[labelWidth], className)} data-testid={testId}>
      <dt className="flex min-w-0 items-center gap-1 type-label text-subtle">{label}</dt>
      <dd className="min-w-0 type-body-sm text-foreground">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">{children}</div>
        {caption ? <p className="mt-0.5 type-caption text-subtle">{caption}</p> : null}
      </dd>
    </div>
  );
}

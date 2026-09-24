'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * The one quiet surface of a record page: the surface token, a hairline rule
 * and the surface radius. Content inside groups with hairlines and space, not
 * nested boxes; no blur, because nothing here floats.
 */
export const detailPanelClass = 'overflow-hidden rounded-surface border border-rule bg-surface';

export const detailLinkClass = 'text-primary underline-offset-2 hover:underline';

/** A spec-sheet ledger: label / value rows divided by faint hairlines. */
export function DefinitionList({ children }: { children: ReactNode }) {
  return <dl className="divide-y divide-rule-faint">{children}</dl>;
}

/** A titled panel of a record page, named by its own heading. */
export function SectionCard({
  sectionId,
  title,
  description,
  children,
  className,
}: {
  sectionId: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(detailPanelClass, 'mb-8', className)} aria-labelledby={sectionId}>
      <div className="border-b border-rule-faint px-5 py-4">
        <h2 id={sectionId} className="type-heading-3 text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 type-body-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** One row of a DefinitionList: a sentence-case label beside its value (stacked on phones). */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1.5 px-4 py-3.5 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:gap-8 sm:items-baseline sm:px-5">
      <dt className="type-label text-subtle">{label}</dt>
      <dd className="min-w-0 type-body-sm leading-relaxed text-foreground">{children}</dd>
    </div>
  );
}

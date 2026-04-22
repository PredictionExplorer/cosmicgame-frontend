'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export const detailPanelClass =
  'rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden';

export const detailLinkClass = 'text-primary underline-offset-2 hover:underline';

export function DefinitionList({ children }: { children: ReactNode }) {
  return <dl className="divide-y divide-white/[0.06]">{children}</dl>;
}

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
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h2 id={sectionId} className="font-display text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1.5 px-4 py-3.5 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:gap-8 sm:items-baseline sm:px-5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm leading-relaxed text-foreground">{children}</dd>
    </div>
  );
}

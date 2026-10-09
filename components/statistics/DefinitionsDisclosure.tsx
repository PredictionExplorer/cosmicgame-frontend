import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface Definition {
  term: string;
  definition: string;
}

/**
 * DefinitionsDisclosure — what each figure of a section means, in one
 * "Definitions" disclosure under the section instead of an ⓘ after every
 * label (docs/design-system.md → Explanations). A native `<details>`: it
 * works before hydration, adds one tab stop, and the definitions stay in the
 * server HTML for search and for readers who print the page. Server-safe;
 * the caller passes the summary's label.
 */
export function DefinitionsDisclosure({
  label,
  items,
  className,
}: {
  /** The summary's text, "Definitions". */
  label: string;
  items: readonly Definition[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <details className={cn('group/definitions', className)}>
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-edge type-label text-muted-foreground transition-colors duration-fast hover:text-foreground sm:min-h-8 [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="size-4 shrink-0 text-subtle transition-transform duration-base group-open/definitions:rotate-90 motion-reduce:transition-none"
        />
        {label}
      </summary>
      <dl className="mt-3 grid gap-x-10 gap-y-4 border-t border-rule-faint pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.term} className="min-w-0">
            <dt className="type-label text-foreground">{item.term}</dt>
            <dd className="mt-1 type-body-sm text-muted-foreground">{item.definition}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

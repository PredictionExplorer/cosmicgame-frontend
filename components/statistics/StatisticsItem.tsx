import { useId, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';

/** Props for one label/value row of a `StatisticsGroup`. */
export interface StatisticsItemProps {
  title: ReactNode;
  value: ReactNode;
  /** A qualifier under the value ("across 2 cycles", "8 transactions"). */
  caption?: ReactNode;
  /**
   * The ledger behind the figure: the value becomes a link ending in an
   * arrow. Leave it out when the figure is zero or unknown, so no arrow
   * promises records that are not there.
   */
  href?: string;
  className?: string;
}

/**
 * StatisticsItem — one spec-sheet row: the label on the left in the muted
 * tier, the figure on the right in tabular `type-figure-sm`, a caption under
 * the figure when it needs one. Labels wrap at word boundaries; a figure
 * never wraps inside itself: it keeps its width and the label wraps beside
 * it, so a narrow row never pushes the figure past the edge. With `href` the
 * figure links to the records it counts, ending in the ledger's arrow, and
 * the link is named by its label and its figure ("Public Goods balance
 * 0.5 ETH"), so a list of the page's links never reads as bare numbers.
 */
export function StatisticsItem({ title, value, caption, href, className }: StatisticsItemProps) {
  const titleId = useId();
  const valueId = useId();
  return (
    <div
      className={cn(
        'flex min-h-[var(--row-h)] items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule-faint py-3',
        className,
      )}
    >
      <dt id={titleId} className="min-w-0 type-body-sm text-muted-foreground">
        {title}
      </dt>
      <dd className="shrink-0 text-right">
        {href ? (
          <Link
            href={href}
            aria-labelledby={`${titleId} ${valueId}`}
            className="link-quiet group inline-flex min-h-6 items-center gap-1.5 type-figure-sm text-foreground"
          >
            <span id={valueId}>{value}</span>
            <ArrowRight
              aria-hidden
              className="size-3.5 shrink-0 text-subtle transition-colors duration-fast group-hover:text-foreground"
            />
          </Link>
        ) : (
          <span className="type-figure-sm text-foreground">{value}</span>
        )}
        {caption ? <span className="mt-0.5 block type-caption text-subtle">{caption}</span> : null}
      </dd>
    </div>
  );
}

import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { formatFixed } from '@/utils/format';

/** @deprecated Icon tints are gone: colour belongs to the art and to live state. */
type Accent = 'aurora' | 'nebula' | 'solar' | 'impact' | 'neutral';

export type StatCardSize = 'hero' | 'md' | 'compact';

export interface StatCardTrend {
  /** Positive = up, negative = down, 0 = flat. */
  delta: number;
  label: string;
  /** Override the sign semantics — "up is bad" for some metrics. */
  invertSentiment?: boolean;
}

const cardVariants = cva(
  'relative min-w-0 rounded-surface print:overflow-visible print:border print:border-border',
  {
    variants: {
      size: {
        hero: 'p-6 sm:p-7',
        md: 'p-5',
        compact: 'px-4 py-3.5',
      },
      emphasis: {
        // One edge, drawn by the gradient ring alone: a visible border under
        // it read as a doubled outline. The transparent border keeps the card
        // the same height as its neighbours in the row.
        true: 'gradient-border-card gradient-border-card-accent border border-transparent bg-primary/[0.04]',
        false: 'border border-rule-faint bg-surface/60',
      },
    },
    defaultVariants: { size: 'md', emphasis: false },
  },
);

const VALUE_CLASS: Record<StatCardSize, string> = {
  hero: 'type-figure-lg',
  md: 'type-figure-md',
  compact: 'font-sans text-base font-medium leading-snug tabular-nums lining-nums',
};

const VALUE_GAP: Record<StatCardSize, string> = {
  hero: 'mt-4',
  md: 'mt-3',
  compact: 'mt-1.5',
};

const SKELETON_CLASS: Record<StatCardSize, string> = {
  hero: 'h-9 w-3/5',
  md: 'h-6.5 w-2/3',
  compact: 'h-5 w-1/2',
};

interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  label: string;
  value: ReactNode;
  /** A 16px concept icon (lib/conceptIcons) beside the label. */
  icon?: ReactNode;
  /**
   * What the figure means. The label becomes an `<ExplainedTerm>`: a dotted
   * underline that opens the explanation on hover, click or tap, named "More
   * information about {label}", instead of an extra ⓘ icon and tab stop.
   */
  tooltip?: string;
  /**
   * `hero` (32px, `type-figure-lg`) for the one headline figure of a page,
   * `md` (20px, `type-figure-md`) for figure rows, `compact` (16px) for rows
   * inside a panel.
   */
  size?: StatCardSize;
  /**
   * Draws the card with the signature ring. At most one per row: it marks the
   * figure the row exists for, so a second one cancels both.
   */
  emphasis?: boolean;
  /**
   * `definition` renders the label as `<dt>` and the value as `<dd>`, for a
   * card placed inside a `<dl>` (server-rendered summaries).
   */
  semantics?: 'block' | 'definition';
  /** Extra text for assistive technology and search engines only (an sr-only `<dd>` or `<p>`). */
  srDescription?: ReactNode;
  /** @deprecated Ignored: icons render in the subtle tier. */
  accent?: Accent;
  /** @deprecated Use `emphasis`. */
  gradient?: boolean;
  /** @deprecated Use `emphasis`. */
  featured?: boolean;
  /** Optional trend badge rendered below the value. */
  trend?: StatCardTrend;
  /**
   * A visible line under the value that qualifies it (for example why a figure is unknown).
   * Anything a reader needs to interpret the number belongs here, not only in the tooltip.
   */
  caption?: ReactNode;
  loading?: boolean;
}

/**
 * StatCard — one labelled figure: the label (13px, sentence case, hyphenated
 * at a syllable rather than chopped mid-word in a narrow column), the value
 * in tabular Inter figures, and an optional caption or trend.
 *
 * Server-safe: no client hooks of its own (the `<ExplainedTerm>` label is a
 * client island only when `tooltip` is set). Lay rows out with `<StatGrid>`.
 */
export function StatCard({
  label,
  value,
  icon,
  tooltip,
  size = 'md',
  emphasis,
  semantics = 'block',
  srDescription,
  accent: _accent,
  gradient = false,
  featured = false,
  trend,
  caption,
  loading = false,
  className,
  ...rest
}: StatCardProps) {
  const isEmphasis = emphasis ?? (featured || gradient);
  const isDefinition = semantics === 'definition';
  const LabelTag = isDefinition ? 'dt' : 'div';
  const ValueTag = isDefinition ? 'dd' : 'div';
  const DetailTag = isDefinition ? 'dd' : 'p';

  return (
    <div
      {...rest}
      data-size={size}
      data-emphasis={isEmphasis || undefined}
      className={cn(cardVariants({ size, emphasis: isEmphasis }), className)}
    >
      {/* The label row is the <dt> itself, so a definition-list card stays
          valid HTML (dt and dd must be children of the group). `min-w-0`
          lets a long label wrap inside a narrow grid column. */}
      <LabelTag className="relative z-[1] flex items-start justify-between gap-3">
        <span
          className={cn(
            'min-w-0 hyphens-auto text-subtle print:!text-foreground/80',
            size === 'compact' ? 'type-caption font-medium' : 'type-label',
          )}
        >
          {tooltip ? (
            <ExplainedTerm definition={tooltip} announce="moreInformation">
              {label}
            </ExplainedTerm>
          ) : (
            label
          )}
        </span>
        {icon ? (
          <span
            aria-hidden
            className={cn(
              'flex shrink-0 items-center [&_svg]:size-4',
              isEmphasis ? 'text-primary' : 'text-subtle',
              size === 'compact' && '[&_svg]:size-3.5',
            )}
          >
            {icon}
          </span>
        ) : null}
      </LabelTag>
      {loading ? (
        // The placeholder sits in the value's own element, so a definition
        // card keeps only <dt> and <dd> children inside its <dl> group.
        <ValueTag aria-busy className={cn('relative z-[1]', VALUE_GAP[size])}>
          <Skeleton className={SKELETON_CLASS[size]} />
        </ValueTag>
      ) : (
        <ValueTag
          className={cn(
            'stat-card-value relative z-[1] min-w-0 break-words text-foreground',
            'print:!text-foreground print:!shadow-none print:[-webkit-text-fill-color:hsl(var(--foreground))]',
            VALUE_GAP[size],
            VALUE_CLASS[size],
          )}
        >
          {value}
        </ValueTag>
      )}
      {!loading && trend ? <StatTrend {...trend} as={DetailTag} /> : null}
      {!loading && caption ? (
        <DetailTag className="relative z-[1] mt-2 type-caption text-subtle">{caption}</DetailTag>
      ) : null}
      {srDescription ? <DetailTag className="sr-only">{srDescription}</DetailTag> : null}
    </div>
  );
}

function StatTrend({
  delta,
  label,
  invertSentiment = false,
  as: Tag,
}: StatCardTrend & { as: 'dd' | 'p' }) {
  const isUp = delta > 0;
  const isFlat = delta === 0;
  const isGood = isFlat ? null : invertSentiment ? !isUp : isUp;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
  const pct = `${isUp ? '+' : ''}${formatFixed(delta, 1)}%`;
  return (
    <Tag className="relative z-[1] mt-2.5 flex flex-wrap items-center gap-2 type-caption">
      <Badge
        size="sm"
        tone={isGood === null ? 'neutral' : isGood ? 'positive' : 'critical'}
        icon={isFlat ? undefined : <Arrow />}
        className="tabular-nums"
      >
        {pct}
      </Badge>
      <span className="text-subtle">{label}</span>
    </Tag>
  );
}

const gridVariants = cva('grid gap-3 sm:gap-4', {
  variants: {
    size: {
      // Two across from the smallest phone: compact figures are short.
      compact: 'grid-cols-2 lg:grid-cols-4',
      // One across below `sm`: a 24px ETH figure and a long uk or vi label
      // do not fit a 170px column.
      md: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      hero: 'grid-cols-1 md:grid-cols-2',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface StatGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Matches the `size` of the cards inside. */
  size?: StatCardSize;
}

/** StatGrid — the responsive row for StatCards of one size. */
export function StatGrid({ size, className, ...props }: StatGridProps) {
  return <div className={cn(gridVariants({ size }), className)} {...props} />;
}

export function StatCardSkeleton({
  className,
  size = 'md',
}: {
  className?: string;
  size?: StatCardSize;
}) {
  return (
    <div aria-hidden className={cn(cardVariants({ size, emphasis: false }), className)}>
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className={cn(VALUE_GAP[size], SKELETON_CLASS[size])} />
    </div>
  );
}

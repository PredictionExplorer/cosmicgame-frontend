import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

/** A neighbouring record: where it is, and its name as its own page gives it. */
export interface RecordPagerTarget {
  href: string;
  /** "Cycle #0", "Gesture #1134", "#000024": the neighbour's formatted id. */
  label: ReactNode;
}

export interface RecordPagerProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  previous?: RecordPagerTarget | null;
  next?: RecordPagerTarget | null;
  /** The navigation landmark's name ("Cycle navigation"). */
  label: string;
  /** Spoken before each link's label ("Previous cycle", "Next cycle"). */
  previousLabel: string;
  nextLabel: string;
  /**
   * The next record exists but its target is not known yet (the collection
   * size is still loading): hold its place instead of guessing, so nothing
   * moves when it arrives.
   */
  nextPending?: ReactNode;
}

const LINK_CLASS = cn(
  buttonVariants({ variant: 'outline', size: 'sm' }),
  // Phones: equal halves side by side, or full-width rows once the labels no
  // longer fit two to a line.
  'max-sm:grow max-sm:basis-40',
);

/**
 * RecordPager — stepping to the neighbouring record, one way on every record
 * page (a cycle's allocations, a gesture, a Signature): two outline buttons
 * with the arrow on their outer side, each labelled by the neighbour's own
 * name and announced with its direction ("Previous cycle, Cycle #0"). Real
 * links (`rel` prev and next), so they prefetch, open in a new tab and show
 * their target. Chevrons are for carousels, not for records. Server-safe.
 */
export function RecordPager({
  previous,
  next,
  label,
  previousLabel,
  nextLabel,
  nextPending,
  className,
  ...rest
}: RecordPagerProps) {
  if (!previous && !next && !nextPending) return null;
  return (
    <nav
      aria-label={label}
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...rest}
    >
      {previous ? (
        <Link href={previous.href} rel="prev" className={LINK_CLASS}>
          <ArrowLeft aria-hidden />
          <span>
            <span className="sr-only">{previousLabel}, </span>
            {previous.label}
          </span>
        </Link>
      ) : null}
      {next ? (
        <Link href={next.href} rel="next" className={cn(LINK_CLASS, 'ms-auto')}>
          <span>
            <span className="sr-only">{nextLabel}, </span>
            {next.label}
          </span>
          <ArrowRight aria-hidden />
        </Link>
      ) : nextPending ? (
        <span aria-hidden className={cn(LINK_CLASS, 'invisible ms-auto')}>
          {nextPending}
          <ArrowRight />
        </span>
      ) : null}
    </nav>
  );
}

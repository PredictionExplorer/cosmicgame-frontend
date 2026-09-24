import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export interface StatisticsGroupProps {
  title: string;
  /** One explanation for the group, beside its title. Figure definitions go in `DefinitionsDisclosure`. */
  info?: string;
  /** The heading's level in the page outline. Default 3 (a group inside an H2 section). */
  headingLevel?: 2 | 3 | 4;
  /**
   * `list` (default): one column of rows. `grid`: the rows flow into two
   * columns from `sm` and five from `xl`, for a short overview that would
   * otherwise leave most of a wide screen empty.
   */
  layout?: 'list' | 'grid';
  children: ReactNode;
  className?: string;
}

const LAYOUT_CLASS = {
  list: '',
  grid: 'sm:grid sm:grid-cols-2 sm:gap-x-10 xl:grid-cols-5 xl:gap-x-8',
} as const;

/**
 * StatisticsGroup — a titled spec sheet of figures: the title in
 * `type-title` over a `--rule`, then `StatisticsItem` rows divided by
 * `--rule-faint` hairlines. No box, no accent edge, no icon tile.
 */
export function StatisticsGroup({
  title,
  info,
  headingLevel = 3,
  layout = 'list',
  children,
  className,
}: StatisticsGroupProps) {
  const Heading = (['h2', 'h3', 'h4'] as const)[headingLevel - 2]!;
  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-center gap-2 border-b border-rule pb-3">
        <Heading className="type-title text-foreground">{title}</Heading>
        {info ? <InfoTooltip content={info} label={title} /> : null}
      </div>
      <dl className={LAYOUT_CLASS[layout]}>{children}</dl>
    </div>
  );
}

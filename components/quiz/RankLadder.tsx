import type { QuizRunnerUi } from '@/content/quiz';

import { cn } from '@/lib/utils';

import { RANK_BANDS, type QuizRankKey } from './quizProgress';

/** The ranks from the first to the highest, the order a reader climbs them. */
const ASCENDING_RANKS: readonly QuizRankKey[] = [...RANK_BANDS].reverse().map((band) => band.rank);

export interface RankLadderProps {
  ranks: QuizRunnerUi['summary']['ranks'];
  /** Where each rank starts ("From 50%"); `null` for the rank everyone begins at. */
  floors: Readonly<Record<QuizRankKey, string | null>>;
  /** The rank this attempt reached: it and the ranks below it are drawn as reached. */
  current?: QuizRankKey;
  /** Accessible name of the list. */
  label: string;
  className?: string;
}

/**
 * The four mastery ranks as one row of steps, each with the share of correct
 * answers it starts at. The start card shows the goal; the summary marks the
 * rank the attempt reached with a primary rule on it and every step below.
 */
export function RankLadder({ ranks, floors, current, label, className }: RankLadderProps) {
  const reached = current ? ASCENDING_RANKS.indexOf(current) : -1;
  return (
    <ol
      aria-label={label}
      className={cn('grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4', className)}
    >
      {ASCENDING_RANKS.map((rank, index) => {
        const isReached = index <= reached;
        const isCurrent = rank === current;
        return (
          <li
            key={rank}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn('min-w-0 border-t-2 pt-3', isReached ? 'border-primary' : 'border-rule')}
          >
            <p
              className={cn(
                'type-title [overflow-wrap:anywhere]',
                isCurrent || !current ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {ranks[rank].name}
            </p>
            {floors[rank] ? (
              <p className="mt-0.5 type-caption tabular-nums text-subtle">{floors[rank]}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { ArrowRight } from 'lucide-react';

import type { QuizTierId } from '@/content/quiz';

import {
  attemptStorageKey,
  browserStorage,
  fillTemplate,
  peekSavedProgress,
  rankFor,
  readBestScore,
  type QuizRankKey,
} from './quizProgress';

export interface QuizTierStatusProps {
  tierId: QuizTierId;
  total: number;
  locale: string;
  bestTemplate: string;
  inProgressTemplate: string;
  startLabel: string;
  resumeLabel: string;
  rankNames: Readonly<Record<QuizRankKey, string>>;
}

/** Another tab finishing a run updates the card; this tab's own runs render on arrival. */
function subscribe(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

/** Nothing is remembered on the server: the card renders its plain Start. */
const SERVER_SNAPSHOT = '';

/**
 * The foot of a hub tier card: what this browser remembers of the tier (a
 * run in progress, or the best score and its rank) and the card's action,
 * Start or Resume. The server renders the plain Start; the memory arrives
 * with hydration, since it lives only in the reader's browser.
 */
export function QuizTierStatus({
  tierId,
  total,
  locale,
  bestTemplate,
  inProgressTemplate,
  startLabel,
  resumeLabel,
  rankNames,
}: QuizTierStatusProps) {
  // The snapshot is a string, so an unchanged memory compares equal between reads.
  const snapshot = useCallback(() => {
    const inProgress = peekSavedProgress(
      browserStorage('session'),
      attemptStorageKey(locale, tierId),
      total,
    );
    if (inProgress) return `progress:${inProgress.current}`;
    const best = readBestScore(browserStorage('local'), tierId, total);
    return best ? `best:${best.correct}` : '';
  }, [locale, tierId, total]);
  const memory = useSyncExternalStore(subscribe, snapshot, () => SERVER_SNAPSHOT);

  const [kind, value] = memory.split(':');
  const count = Number(value);
  const inProgress = kind === 'progress';
  const status = inProgress
    ? fillTemplate(inProgressTemplate, { current: count, total })
    : kind === 'best'
      ? `${fillTemplate(bestTemplate, { correct: count, total })} · ${rankNames[rankFor(count, total)]}`
      : null;

  return (
    <span className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-rule-faint pt-4">
      <span className="inline-flex items-center gap-1.5 type-label text-primary">
        {inProgress ? resumeLabel : startLabel}
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-fast motion-safe:group-hover:translate-x-0.5"
        />
      </span>
      {status ? (
        <span className="type-caption tabular-nums text-subtle" data-testid="quiz-tier-status">
          {status}
        </span>
      ) : null}
    </span>
  );
}

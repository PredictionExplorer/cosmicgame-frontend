import { ArrowRight, Hourglass } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

import { EmbedFrame } from './EmbedFrame';

interface EmbedCycleNotStartedProps {
  locale: string;
  /** The cycle in the URL, past the live one. */
  cycle: number;
  /** The cycle open now, by the server's dashboard read. */
  liveCycle: number;
}

/**
 * The endurance embed of a cycle that has not opened: the window's own frame
 * and title, and in the chart's place what the cycle page says of one (it
 * hasn't started; cycles run one at a time and this one is open now), with
 * the way to the live cycle's timeline in the same window.
 *
 * The page renders it on the server, in place of `notFound()`, whose segment
 * render reaches the browser as Next.js's bare error shell: so it answers 200
 * (the embed is `noindex` throughout), and the cached render is kept a
 * minute, since the next cycle opens when the live one is finalized.
 */
export async function EmbedCycleNotStarted({
  locale,
  cycle,
  liveCycle,
}: EmbedCycleNotStartedProps) {
  const [t, tStatistics] = await Promise.all([
    getTranslations({ locale, namespace: 'allocation' }),
    getTranslations({ locale, namespace: 'statistics' }),
  ]);

  return (
    <EmbedFrame
      title={tStatistics('embed.title', { cycle })}
      sourceHref="/statistics/activity#cycle"
    >
      <EmptyState
        variant="page"
        headingLevel={2}
        icon={<Hourglass />}
        title={t('missingCycle.notStarted.title', { cycle })}
        description={t('missingCycle.notStarted.body', { cycle, live: liveCycle })}
        action={
          <Link
            href={`/embed/endurance/${liveCycle}`}
            className={buttonVariants({ variant: 'outline' })}
          >
            {t('missingCycle.currentCycle')}
            <ArrowRight aria-hidden />
          </Link>
        }
      />
    </EmbedFrame>
  );
}

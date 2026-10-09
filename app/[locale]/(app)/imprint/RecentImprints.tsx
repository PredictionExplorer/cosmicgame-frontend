'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { PendingPlate, WallLabel } from '@/components/ui/art-frame';
import { RandomWalkPlate } from '@/components/nft/RandomWalkPlate';
import { formatId } from '@/utils/format/ids';

import { useLatestRandomWalk } from './randomWalkImprint';

/** How many earlier imprints sit in the strip under the latest one. */
const EARLIER_COUNT = 3;

/**
 * What an imprint makes, before anything is asked of the reader: the newest
 * Random Walk NFT on its black plate with a wall label, and the few imprinted
 * just before it as a strip (from `sm`), so the object the page sells is the
 * first thing it shows. Each plate opens the token's page on the Random Walk NFT site.
 * `seed` is the server's reading of the collection's next id.
 */
export function RecentImprints({ seed, className }: { seed: number | null; className?: string }) {
  const t = useTranslations('imprint');
  const { latest, isError } = useLatestRandomWalk(seed);

  if (latest === null) {
    // Nothing read yet: the plate's place is held; a failed read leaves the column to the text.
    return isError ? null : (
      <div className={className}>
        <PendingPlate variant="media" busy />
      </div>
    );
  }

  const earlier = Array.from(
    { length: Math.min(EARLIER_COUNT, latest) },
    (_, index) => latest - 1 - index,
  );

  return (
    <div className={cn('min-w-0', className)} data-testid="recent-imprints">
      <figure>
        <RandomWalkPlate
          tokenId={latest}
          alt={t('page.tokenAlt', { id: formatId(latest) })}
          sizes="(min-width: 1024px) 34rem, 100vw"
        />
        <WallLabel
          as="figcaption"
          className="mt-3"
          title={<span className="font-mono tabular-nums">{formatId(latest)}</span>}
          meta={[t('page.latest.meta')]}
        />
      </figure>
      {earlier.length > 0 ? (
        // Phones keep the first screen for the cost panel: the latest plate alone says enough.
        <ul
          aria-label={t('page.latest.earlierAria')}
          className="mt-5 grid grid-cols-3 gap-3 max-sm:hidden"
        >
          {earlier.map((tokenId) => (
            <li key={tokenId} className="min-w-0">
              <RandomWalkPlate
                tokenId={tokenId}
                alt={t('page.tokenAlt', { id: formatId(tokenId) })}
                sizes="(min-width: 1024px) 11rem, 33vw"
              />
              <p className="mt-1.5 type-caption font-mono tabular-nums text-subtle">
                {formatId(tokenId)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

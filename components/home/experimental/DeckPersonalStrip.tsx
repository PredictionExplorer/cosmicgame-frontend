'use client';

import { useId, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { useApiData } from '@/contexts/ApiDataContext';
import { RetrieveIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import type { GestureInfo } from '@/services/api';
import { formatPercent, sameAddress } from '@/utils/format';

interface DeckPersonalStripProps {
  account: string;
  /** The cycle's gestures, the connected wallet's among them. */
  gestures: GestureInfo[];
  className?: string;
}

/**
 * The connected wallet's place in the cycle, in one line under the
 * standings: how many Gestures it made, what share of the cycle's Stellar
 * Selection entries those are (a plain k of N, never a compounded chance),
 * and whether anything is waiting to be retrieved. Whether the wallet holds
 * a standing is marked on the standings row itself.
 */
export function DeckPersonalStrip({ account, gestures, className }: DeckPersonalStripProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const headingId = useId();
  const { apiData } = useApiData();

  const myGestureCount = useMemo(
    () => gestures.filter((gesture) => sameAddress(gesture.BidderAddr, account)).length,
    [gestures, account],
  );
  const entryShare =
    gestures.length > 0 && myGestureCount > 0 ? (myGestureCount / gestures.length) * 100 : null;

  const waitingEth = apiData.ETHRaffleToClaim ?? 0;
  const hasUnretrieved =
    waitingEth > 0 ||
    (apiData.NumDonatedNFTToClaim ?? 0) > 0 ||
    (apiData.UnretrievedAnchorDistribution ?? 0) > 0;

  return (
    <section
      aria-labelledby={headingId}
      data-testid="deck-personal-strip"
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-rule-faint py-4',
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-6 gap-y-1">
        <h3 id={headingId} className="type-label text-muted-foreground">
          {t('deck.personal.title')}
        </h3>
        <p className="type-body-sm text-foreground" data-testid="personal-gesture-count">
          {t('deck.personal.gestures', { count: myGestureCount })}
        </p>
        {entryShare != null ? (
          <p className="type-body-sm text-muted-foreground" data-testid="personal-entry-share">
            {t('deck.personal.entryShare', {
              share: formatPercent(entryShare, locale, { maximumFractionDigits: 2 }),
            })}
          </p>
        ) : null}
      </div>
      {hasUnretrieved ? (
        <Button asChild variant="secondary" size="sm" data-testid="personal-retrieve">
          <Link href="/my-allocations">
            <RetrieveIcon aria-hidden />
            {t('deck.personal.retrieve')}
            {waitingEth > 0 ? <Amount value={waitingEth} unit="ETH" /> : null}
          </Link>
        </Button>
      ) : (
        <Link
          href="/my-allocations"
          data-testid="personal-allocations-link"
          className="link-quiet inline-flex min-h-11 items-center gap-1.5 type-body-sm text-muted-foreground hover:text-foreground sm:min-h-9"
        >
          {t('deck.personal.nothingWaiting')}
          <ArrowRight className="size-3.5 text-subtle" aria-hidden />
        </Link>
      )}
    </section>
  );
}

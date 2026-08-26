'use client';

import { useMemo } from 'react';
import { ArrowRight, Crown, PackageOpen, Radio, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds } from '@/utils';

import { Link } from '@/i18n/navigation';
import { Surface } from '@/components/ui/surface';
import { useApiData } from '@/contexts/ApiDataContext';
import { useChampions } from '@/hooks/useChampions';
import { cn } from '@/lib/utils';
import type { DashboardInfo, GestureInfo } from '@/services/api';

interface DeckPersonalStripProps {
  account: string;
  data: DashboardInfo | null;
  gestures: GestureInfo[];
  className?: string;
}

function sameAddress(left: string | null | undefined, right: string | null | undefined): boolean {
  return !!left && !!right && left.toLowerCase() === right.toLowerCase();
}

/**
 * The connected wallet's cycle position in one glance: latest-gesture
 * standing, distance to the Endurance record, gestures made this cycle, and
 * whether anything is waiting to be retrieved. Renders only when a wallet is
 * connected (gated by the page).
 */
export function DeckPersonalStrip({ account, data, gestures, className }: DeckPersonalStripProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const champions = useChampions();
  const { apiData } = useApiData();

  const isLatest = sameAddress(data?.LastBidderAddr, account);
  const myGestureCount = useMemo(
    () => gestures.filter((gesture) => sameAddress(gesture.BidderAddr, account)).length,
    [gestures, account],
  );

  const { latestGesture } = champions;
  const enduranceLabel =
    isLatest && latestGesture.durationToBeat > 0
      ? latestGesture.isExtendingEnduranceRecord
        ? t('deck.personal.extending')
        : t('deck.personal.enduranceIn', {
            duration: formatSeconds(latestGesture.secondsUntilEnduranceChampion, locale),
          })
      : null;

  const hasUnretrieved =
    (apiData.ETHRaffleToClaim ?? 0) > 0 ||
    (apiData.NumDonatedNFTToClaim ?? 0) > 0 ||
    (apiData.UnretrievedAnchorDistribution ?? 0) > 0;

  return (
    <Surface
      asChild
      variant="glass"
      radius="lg"
      padding="none"
      className={cn('min-w-0', className)}
    >
      <section aria-label={t('deck.personal.title')} data-testid="deck-personal-strip">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('deck.personal.title')}
          </p>

          <span
            data-testid="personal-standing"
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium',
              isLatest ? 'text-emerald-300' : 'text-muted-foreground',
            )}
          >
            <Radio className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {isLatest
              ? `${t('deck.personal.leader')} · ${t('deck.personal.heldFor', {
                  duration: formatSeconds(latestGesture.holdDuration, locale),
                })}`
              : t('deck.personal.notLeader')}
          </span>

          {enduranceLabel && (
            <span
              data-testid="personal-endurance"
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-medium',
                latestGesture.isExtendingEnduranceRecord
                  ? 'text-emerald-300'
                  : 'text-[rgb(var(--solar-gold-rgb))]',
              )}
            >
              <Crown className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {enduranceLabel}
            </span>
          )}

          <span
            data-testid="personal-gesture-count"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('deck.personal.gestures', { count: myGestureCount })}
          </span>

          <span className="ms-auto">
            {hasUnretrieved ? (
              <Link
                href="/my-allocations"
                data-testid="personal-retrieve"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:border-emerald-300/60"
              >
                <PackageOpen className="h-3.5 w-3.5" aria-hidden />
                {apiData.ETHRaffleToClaim > 0
                  ? `${t('deck.personal.retrieve')} · ${t('allocation.amounts.eth', {
                      amount: apiData.ETHRaffleToClaim.toFixed(4),
                    })}`
                  : t('deck.personal.retrieve')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : (
              <Link
                href="/my-allocations"
                data-testid="personal-allocations-link"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                {t('deck.personal.nothingWaiting')}
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            )}
          </span>
        </div>
      </section>
    </Surface>
  );
}

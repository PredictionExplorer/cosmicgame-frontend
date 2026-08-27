'use client';

import { ArrowRight, Radio, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds } from '@/utils';

import { LatestParticipantDetails } from '@/components/special-allocation/LatestParticipantDetails';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { ChampionsState } from '@/hooks/useChampions';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { GestureInfo } from '@/services/api';

export interface LatestParticipantIntelProps {
  champions: ChampionsState;
  latestGesture?: GestureInfo | null;
  latestMessage?: string | null;
  account?: string | null;
  signatureEth: number;
  attachedNftCount?: number;
  attachedErc20Count?: number;
  className?: string;
}

function sameAddress(left: string | null | undefined, right: string | null | undefined): boolean {
  return !!left && !!right && left.toLowerCase() === right.toLowerCase();
}

/**
 * Decision-grade latest-participant intelligence for the home control desk.
 *
 * Shows the actual transaction and CST receipt, the live Endurance race, and
 * the still-pending finalization package without conflating received assets
 * with allocations that can change on the next gesture.
 */
export function LatestParticipantIntel({
  champions,
  latestGesture = null,
  latestMessage = null,
  account = null,
  signatureEth,
  attachedNftCount = 0,
  attachedErc20Count = 0,
  className,
}: LatestParticipantIntelProps) {
  const t = useTranslations('home');
  const tTables = useTranslations('tables');
  const locale = useLocale();
  const latest = champions.latestGesture;
  const isYou = sameAddress(account, latest.address);

  const attachmentParts = [
    attachedNftCount > 0 ? t('observatory.intel.attachedNfts', { count: attachedNftCount }) : null,
    attachedErc20Count > 0
      ? t('observatory.intel.attachedTokens', { count: attachedErc20Count })
      : null,
  ].filter((value): value is string => value != null);

  return (
    <section
      aria-labelledby="latest-participant-intel-title"
      data-testid="latest-participant-intel"
      className={cn('min-w-0 p-3', className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
            <User className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2
                id="latest-participant-intel-title"
                className="font-display text-sm font-bold tracking-tight"
              >
                {tTables('specialAllocation.latestParticipant')}
              </h2>
              <InfoTooltip content={tTables('specialAllocation.latestTooltip')} />
              {latest.address && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                  <Radio className="h-2.5 w-2.5" aria-hidden />
                  {tTables('specialAllocation.liveGrowing')}
                </span>
              )}
              {isYou && (
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                  {tTables('status.youBadge')}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
              {t('observatory.intel.latestSubtitle')}
            </p>
          </div>
        </div>

        {latest.address && (
          <span className="shrink-0 text-right">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              {tTables('specialAllocation.currentHold')}
            </span>
            <span className="block font-mono text-sm font-semibold tabular-nums text-emerald-300">
              {formatSeconds(latest.holdDuration, locale)}
            </span>
          </span>
        )}
      </div>

      {latest.address ? (
        <>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/user/${latest.address}`}
              className="min-w-0 break-all font-mono text-xs text-foreground transition-colors hover:text-primary"
            >
              {latest.address}
            </Link>
            {latestGesture && (
              <Link
                href={`/gesture/${latestGesture.EvtLogId}`}
                className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary transition-colors hover:text-foreground"
              >
                {t('observatory.intel.viewGesture')}
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            )}
          </div>

          <div className="mt-2">
            <LatestParticipantDetails
              latest={latest}
              hasEnduranceRecord={!!champions.endurance.address}
              latestGesture={latestGesture}
              latestAddress={latest.address}
              message={latestMessage}
              compact
              allocationPackage={{
                label: t('observatory.intel.inLineFor'),
                primary: [
                  t('allocation.amounts.eth', { amount: signatureEth.toFixed(4) }),
                  t('allocation.amounts.fixedCst'),
                  t('allocation.amounts.nft'),
                ].join(' · '),
                secondary:
                  attachmentParts.length > 0
                    ? t('observatory.intel.plusCycleAttachments', {
                        assets: attachmentParts.join(' · '),
                      })
                    : undefined,
              }}
            />
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm italic text-muted-foreground/70">
          {tTables('specialAllocation.noLatestGesture')}
        </p>
      )}
    </section>
  );
}

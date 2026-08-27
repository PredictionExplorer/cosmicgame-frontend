'use client';

import { Coins, Crown, Lock, Swords, Zap } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds, shortenHex } from '@/utils';

import { ChronoWarriorDetails } from '@/components/special-allocation/ChronoWarriorDetails';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { ChampionsState } from '@/hooks/useChampions';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface ChronoEnduranceIntelProps {
  champions: ChampionsState;
  chronoEth: number;
  account?: string | null;
  className?: string;
}

function sameAddress(left: string | null | undefined, right: string | null | undefined): boolean {
  return !!left && !!right && left.toLowerCase() === right.toLowerCase();
}

function RoleSummary({
  testId,
  icon,
  label,
  tooltip,
  address,
  value,
  duration,
  isLive,
  account,
  emptyText,
}: {
  testId: string;
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  address: string | null;
  value: string;
  duration?: number;
  isLive?: boolean;
  account?: string | null;
  emptyText: string;
}) {
  const t = useTranslations('tables');
  const locale = useLocale();
  const isYou = sameAddress(account, address);

  return (
    <div
      data-testid={testId}
      className="min-w-0 rounded-lg border border-white/[0.06] bg-black/10 p-2.5"
    >
      <div className="flex min-w-0 items-start gap-1.5">
        <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
        <span className="min-w-0 break-words text-[10px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">
          {label}
        </span>
        <InfoTooltip content={tooltip} className="ml-auto shrink-0" />
      </div>
      <p className="mt-1 text-xs font-bold tabular-nums text-foreground">{value}</p>

      {address ? (
        <>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Link
              href={`/user/${address}`}
              title={address}
              aria-label={address}
              className="min-w-0 break-all font-mono text-[11px] text-foreground transition-colors hover:text-primary"
            >
              {shortenHex(address, 6)}
            </Link>
            {isYou && (
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                {t('status.youBadge')}
              </span>
            )}
          </div>
          {duration !== undefined && (
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
              <span
                className={cn(
                  'font-mono text-sm font-semibold tabular-nums',
                  isLive ? 'text-emerald-300' : 'text-foreground',
                )}
              >
                {formatSeconds(duration, locale)}
              </span>
              {isLive !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
                    isLive
                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                      : 'border-white/10 bg-white/[0.04] text-muted-foreground',
                  )}
                >
                  {isLive ? (
                    <Zap className="h-2.5 w-2.5" aria-hidden />
                  ) : (
                    <Lock className="h-2.5 w-2.5" aria-hidden />
                  )}
                  {isLive
                    ? t('specialAllocation.growingNow')
                    : t('specialAllocation.recordStanding')}
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="mt-2 text-xs italic text-muted-foreground/70">{emptyText}</p>
      )}
    </div>
  );
}

/**
 * Complete Endurance/Chrono race intelligence for the home control desk.
 *
 * The three role summaries establish who holds each position and what it is
 * worth; the shared Chrono detail view then exposes the live segment or the
 * active Endurance challenge with its exact next-change countdown.
 */
export function ChronoEnduranceIntel({
  champions,
  chronoEth,
  account = null,
  className,
}: ChronoEnduranceIntelProps) {
  const t = useTranslations('home');
  const tTables = useTranslations('tables');

  return (
    <section
      aria-labelledby="chrono-endurance-intel-title"
      data-testid="chrono-endurance-intel"
      className={cn('min-w-0 p-2.5', className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2
            id="chrono-endurance-intel-title"
            className="font-display text-sm font-bold tracking-tight"
          >
            {t('observatory.intel.enduranceChronoTitle')}
          </h2>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {t('observatory.intel.enduranceChronoSubtitle')}
          </p>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {t('observatory.intel.liveRoleState')}
        </span>
      </div>

      <div className="mt-2 grid items-start gap-2 sm:grid-cols-3 xl:grid-cols-[0.9fr_0.9fr_0.8fr_1.7fr]">
        <RoleSummary
          testId="control-desk-endurance"
          icon={<Crown className="h-3.5 w-3.5" aria-hidden />}
          label={tTables('specialAllocation.enduranceChampion')}
          tooltip={tTables('specialAllocation.enduranceTooltip')}
          address={champions.endurance.address}
          value={t('observatory.standings.cstPlusNft')}
          duration={champions.endurance.duration}
          isLive={champions.endurance.isLive}
          account={account}
          emptyText={tTables('specialAllocation.noEnduranceRecord')}
        />
        <RoleSummary
          testId="chrono-role-summary"
          icon={<Swords className="h-3.5 w-3.5" aria-hidden />}
          label={tTables('specialAllocation.chronoWarrior')}
          tooltip={tTables('specialAllocation.chronoTooltip')}
          address={champions.chrono.address}
          value={t('allocation.amounts.eth', { amount: chronoEth.toFixed(4) })}
          duration={champions.chrono.duration}
          isLive={champions.chrono.isLive}
          account={account}
          emptyText={tTables('specialAllocation.noChronoRecord')}
        />
        <RoleSummary
          testId="final-cst-role-summary"
          icon={<Coins className="h-3.5 w-3.5" aria-hidden />}
          label={tTables('specialAllocation.finalCstGesture')}
          tooltip={tTables('specialAllocation.finalCstTooltip')}
          address={champions.lastCst.address}
          value={t('observatory.standings.cstPlusNft')}
          account={account}
          emptyText={tTables('specialAllocation.awaitingCstGesture')}
        />
        {champions.chrono.address && (
          <div className="sm:col-span-3 xl:col-span-1">
            <ChronoWarriorDetails
              chrono={champions.chrono}
              challenge={champions.chronoChallenge}
              compact
            />
          </div>
        )}
      </div>
    </section>
  );
}

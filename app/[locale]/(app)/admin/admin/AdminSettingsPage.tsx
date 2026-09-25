'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { buildContracts, contractEntryCopy } from '@/content/legal/contractRegistry';

import {
  ALLOCATION_TRACK_COPY_KEYS,
  allocationSharesFromDashboard,
} from '@/config/allocationTracks';
import {
  ContractEvidence,
  formatSourcifyChecked,
  SourcifyCheckedNote,
} from '@/components/legal/ContractEvidence';
import { AddressChip } from '@/components/ui/address-chip';
import { Badge } from '@/components/ui/badge';
import { DateTime } from '@/components/ui/date-time';
import { Duration } from '@/components/ui/duration';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { SkeletonDetailRows } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatCount, formatPercent } from '@/utils/format';
import {
  initialDurationSeconds,
  percentFromDivisor,
  secondsFromMicroseconds,
  secondsOrNull,
} from '@/utils/protocolParams';

/**
 * The parameter groups, in reading order. A group /contracts also shows takes
 * its title from the contracts catalog, so the two pages name it alike.
 */
const PARAMETER_GROUPS = ['shares', 'selection', 'timing', 'cost'] as const;
type ParameterGroup = (typeof PARAMETER_GROUPS)[number];

/** One read-only parameter: a stable key, its label and the value to show. */
interface ParameterRow {
  key: string;
  label: string;
  /** `null`: the dashboard reported the field but it could not be read. */
  value: ReactNode | null;
}

/**
 * A label and its value on one hairline-divided line. The label takes the
 * room the value leaves, and the value wraps inside at most 60% of the row,
 * so a long value (a date and its badge, a divisor and its share) never
 * squeezes the label to a syllable per line or runs off the edge.
 * A wide row (an address) sets its value and its evidence on one line from
 * `xl`, stacked below.
 */
function SheetRow({
  label,
  children,
  id,
  wide = false,
}: {
  label: ReactNode;
  children: ReactNode;
  id: string;
  /** Addresses: the value starts under the label on phones and takes the row's width from lg. */
  wide?: boolean;
}) {
  return (
    <div
      data-parameter={id}
      className={cn(
        'gap-y-2 border-b border-rule-faint py-3',
        wide
          ? 'grid gap-x-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:items-baseline'
          : 'flex min-h-12 items-center justify-between gap-x-6',
      )}
    >
      <dt
        className={cn(
          'min-w-0 type-body-sm text-muted-foreground',
          !wide && 'flex-1 [overflow-wrap:break-word]',
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          'min-w-0 text-foreground',
          wide
            ? 'flex flex-col items-start gap-1.5 xl:flex-row xl:flex-wrap xl:items-baseline xl:gap-x-6'
            : 'max-w-[60%] text-end type-figure-sm [overflow-wrap:break-word]',
        )}
      >
        {children}
      </dd>
    </div>
  );
}

/**
 * Contract settings, below the operator header: the protocol's contract
 * addresses and parameters as the dashboard reports them, as a read-only
 * sheet. Nothing here writes: only the protocol owner changes these values,
 * on-chain, so the page offers no controls that would suggest otherwise.
 */
export default function AdminSettingsPage() {
  const t = useTranslations('admin');
  const tContracts = useTranslations('contracts');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const nowMs = useNow(60_000);
  const { data, isLoading, isError, refetch } = useDashboardInfo();

  if (!data) {
    if (isLoading || !isError) {
      return <SkeletonDetailRows rows={10} />;
    }
    return (
      <ErrorState
        variant="page"
        headingLevel={2}
        title={t('settings.loadError')}
        onRetry={() => void refetch()}
      />
    );
  }

  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;

  const count = (value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? null : formatCount(numeric, locale);
  };
  const percent = (value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? null : formatPercent(numeric, locale, { maximumFractionDigits: 2 });
  };
  const divisor = (value: unknown) => {
    const share = percentFromDivisor(value);
    const raw = toFiniteNumber(value);
    return share === null || raw === null
      ? null
      : t('settings.values.divisorPercent', {
          percent: formatPercent(share, locale, { maximumFractionDigits: 2 }),
          divisor: formatCount(raw, locale),
        });
  };
  const duration = (seconds: number | null) =>
    seconds === null ? null : <Duration seconds={seconds} />;

  const activation = toFiniteNumber(data.CurRoundStats?.ActivationTime);
  const timeIncrement = data.MainPrizeTimeIncrementInMicroSeconds;
  const activationValue =
    activation !== null && activation > 0 ? (
      <span className="inline-flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
        <DateTime timestamp={activation} variant="full" />
        {nowMs > 0 ? (
          <Badge size="sm" dot tone={activation * 1000 <= nowMs ? 'positive' : 'attention'}>
            {activation * 1000 <= nowMs
              ? t('settings.status.active')
              : t('settings.status.scheduled')}
          </Badge>
        ) : null}
      </span>
    ) : null;

  // A parameter /contracts also shows reads its label from the contracts
  // catalog, so the two pages cannot name it differently.
  const field = (key: string) => t(`settings.fields.${key}`);
  const groups: Record<ParameterGroup, ParameterRow[]> = {
    // Every track /contracts draws, Chrono-Warrior and the remainder carried
    // to the next cycle included, so the shares read as the whole split.
    shares: allocationSharesFromDashboard(data).map((share) => ({
      key: `share-${share.id}`,
      label: tContracts(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[share.id]}.label`),
      value: percent(share.percent),
    })),
    selection: [
      {
        key: 'ethStellarRecipients',
        label: tContracts('parameters.selection.ethLabel'),
        value: count(data.NumRaffleEthWinnersBidding),
      },
      {
        key: 'nftStellarRecipients',
        label: tContracts('parameters.selection.nftLabel'),
        value: count(data.NumRaffleNFTWinnersBidding),
      },
      {
        key: 'anchoredStellarRecipients',
        label: tContracts('parameters.selection.anchorLabel'),
        value: count(data.NumRaffleNFTWinnersStakingRWalk),
      },
    ],
    timing: [
      { key: 'activationTime', label: field('activationTime'), value: activationValue },
      {
        key: 'gestureTimeIncrement',
        label: tContracts('configuration.cards.timeIncrement.label'),
        value: duration(secondsFromMicroseconds(timeIncrement)),
      },
      { key: 'timeIncrease', label: field('timeIncrease'), value: divisor(data.TimeIncrease) },
      {
        key: 'initialCycleDuration',
        label: tContracts('configuration.cards.initial.label'),
        // `InitialSecondsUntilPrize` carries the divisor, not seconds (see DashboardInfo).
        value: duration(initialDurationSeconds(timeIncrement, data.InitialSecondsUntilPrize)),
      },
      {
        key: 'finalizationTimeout',
        label: tContracts('configuration.cards.finalization.label'),
        value: duration(secondsOrNull(data.TimeoutClaimPrize)),
      },
      {
        key: 'calibrationWindowLength',
        label: field('calibrationWindowLength'),
        value: duration(secondsOrNull(data.RoundStartCSTAuctionLength)),
      },
    ],
    cost: [
      {
        key: 'priceIncrease',
        label: tContracts('configuration.cards.ethStep.label'),
        value: divisor(data.PriceIncrease),
      },
    ],
  };
  const groupTitles: Record<ParameterGroup, string> = {
    shares: tContracts('funds.title'),
    selection: tContracts('configuration.groups.selection'),
    timing: tContracts('configuration.groups.timing'),
    cost: t('settings.groups.cost'),
  };

  return (
    <div className="space-y-14 sm:space-y-16">
      <section aria-labelledby="settings-contracts-heading">
        <SectionHeader
          headingId="settings-contracts-heading"
          title={t('settings.groups.contracts')}
          description={t('settings.contractsDescription')}
        />
        <SourcifyCheckedNote
          text={tContracts('addresses.verified', { date: formatSourcifyChecked(locale) })}
          className="-mt-2 mb-5 max-w-2xl"
        />
        <dl className="border-t border-rule-faint">
          {buildContracts(data.ContractAddrs, contractEntryCopy(tContracts)).map((contract) => (
            <SheetRow key={contract.id} id={contract.id} label={contract.name} wide>
              <AddressChip
                address={contract.address}
                variant="plain"
                display="full"
                label={false}
                href={false}
                className="type-hash whitespace-normal text-foreground"
              />
              <ContractEvidence address={contract.address} />
            </SheetRow>
          ))}
        </dl>
      </section>

      <div className="grid gap-x-16 gap-y-14 sm:gap-y-16 lg:grid-cols-2">
        {PARAMETER_GROUPS.map((group) => (
          <section key={group} aria-labelledby={`settings-${group}-heading`}>
            <SectionHeader headingId={`settings-${group}-heading`} title={groupTitles[group]} />
            <dl className="border-t border-rule-faint">
              {groups[group].map((row) => (
                <SheetRow key={row.key} id={row.key} label={row.label}>
                  {row.value ?? unknown}
                </SheetRow>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}

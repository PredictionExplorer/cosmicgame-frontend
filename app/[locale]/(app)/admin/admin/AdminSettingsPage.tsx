'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  buildContracts,
  CONTRACT_ENTRY_IDS,
  type ContractEntryCopy,
} from '@/app/[locale]/(app)/contracts/contractAddressData';

import {
  ContractEvidence,
  formatSourcifyChecked,
  SourcifyCheckedNote,
  type ContractEvidenceLabels,
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

/** The parameter groups, in reading order; titles live in `admin.settings.groups.<id>`. */
const PARAMETER_GROUPS = ['shares', 'selection', 'timing', 'cost'] as const;
type ParameterGroup = (typeof PARAMETER_GROUPS)[number];

/** One read-only parameter: its label key and the value to show. */
interface ParameterRow {
  key: string;
  /** `null`: the dashboard reported the field but it could not be read. */
  value: ReactNode | null;
}

/**
 * A label and its value on one hairline-divided line. The label takes the
 * room the value leaves, and the value wraps inside at most 60% of the row,
 * so a long value ("Not reported by the dashboard API", a date and its
 * badge) never squeezes the label to a syllable per line or runs off the edge.
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
            ? 'flex flex-col items-start gap-1.5'
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
  const notReported = <span className="type-body-sm text-subtle">{t('settings.notReported')}</span>;

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

  const groups: Record<ParameterGroup, ParameterRow[]> = {
    shares: [
      { key: 'signatureAllocationPercentage', value: percent(data.PrizePercentage) },
      { key: 'stellarSelectionPercentage', value: percent(data.RafflePercentage) },
      { key: 'anchorDistributionPercentage', value: percent(data.StakingPercentage) },
      { key: 'publicGoodsPercentage', value: percent(data.CharityPercentage) },
    ],
    selection: [
      { key: 'ethStellarRecipients', value: count(data.NumRaffleEthWinnersBidding) },
      { key: 'nftStellarRecipients', value: count(data.NumRaffleNFTWinnersBidding) },
      { key: 'nftHolderRecipients', value: count(data.NumRaffleNFTWinnersStakingRWalk) },
    ],
    timing: [
      { key: 'activationTime', value: activationValue },
      { key: 'gestureTimeIncrement', value: duration(secondsFromMicroseconds(timeIncrement)) },
      { key: 'timeIncrease', value: divisor(data.TimeIncrease) },
      {
        key: 'initialAllocationSeconds',
        // `InitialSecondsUntilPrize` carries the divisor, not seconds (see DashboardInfo).
        value: duration(initialDurationSeconds(timeIncrement, data.InitialSecondsUntilPrize)),
      },
      { key: 'allocationTimeout', value: duration(secondsOrNull(data.TimeoutClaimPrize)) },
      {
        key: 'calibrationWindowLength',
        value: duration(secondsOrNull(data.RoundStartCSTAuctionLength)),
      },
    ],
    cost: [
      { key: 'priceIncrease', value: divisor(data.PriceIncrease) },
      // The dashboard API does not report these two; say so instead of an empty field.
      { key: 'initialGestureCostFraction', value: notReported },
      { key: 'gestureRatio', value: notReported },
    ],
  };

  const contractCopy = Object.fromEntries(
    CONTRACT_ENTRY_IDS.map((id) => [
      id,
      {
        name: tContracts(`entries.${id}.name`),
        description: tContracts(`entries.${id}.description`),
      },
    ]),
  ) as ContractEntryCopy;
  const evidence: ContractEvidenceLabels = {
    explorer: tContracts('addresses.explorer'),
    sourcify: tContracts('addresses.sourcify'),
  };

  return (
    <div className="space-y-14 sm:space-y-16">
      <section aria-labelledby="settings-contracts-heading">
        <SectionHeader
          size="panel"
          headingId="settings-contracts-heading"
          title={t('settings.groups.contracts')}
          description={t('settings.contractsDescription')}
        />
        <SourcifyCheckedNote
          text={tContracts('addresses.verified', { date: formatSourcifyChecked(locale) })}
          className="-mt-2 mb-5 max-w-2xl"
        />
        <dl className="border-t border-rule-faint">
          {buildContracts(data.ContractAddrs, contractCopy).map((contract) => (
            <SheetRow key={contract.id} id={contract.id} label={contract.name} wide>
              <AddressChip
                address={contract.address}
                variant="plain"
                display="full"
                label={false}
                href={false}
                className="type-hash whitespace-normal text-foreground"
              />
              <ContractEvidence address={contract.address} labels={evidence} />
            </SheetRow>
          ))}
        </dl>
      </section>

      <div className="grid gap-x-16 gap-y-14 sm:gap-y-16 lg:grid-cols-2">
        {PARAMETER_GROUPS.map((group) => (
          <section key={group} aria-labelledby={`settings-${group}-heading`}>
            <SectionHeader
              size="panel"
              headingId={`settings-${group}-heading`}
              title={t(`settings.groups.${group}`)}
            />
            <dl className="border-t border-rule-faint">
              {groups[group].map((row) => (
                <SheetRow key={row.key} id={row.key} label={t(`settings.fields.${row.key}`)}>
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

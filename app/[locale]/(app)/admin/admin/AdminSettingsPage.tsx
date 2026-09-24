'use client';

import { useId, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds } from '@/utils';
import {
  buildContracts,
  CONTRACT_ENTRY_IDS,
  type ContractEntryCopy,
} from '@/app/[locale]/(app)/contracts/contractAddressData';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionCard, detailPanelClass } from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api/types';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatGroupedNumber, formatUtcDateTimeStamp } from '@/utils/format';
import {
  formatPercentPoints,
  initialDurationSeconds,
  percentFromDivisor,
  secondsFromMicroseconds,
  secondsOrNull,
} from '@/utils/protocolParams';

function AdminFieldRow({ label, children }: { label: string; children: ReactNode }) {
  const labelId = useId();

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-white/[0.06] px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,280px)_1fr] sm:items-center sm:px-5">
      <span id={labelId} className="text-sm font-medium text-foreground">
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center"
      >
        {children}
      </div>
    </div>
  );
}

/** A parameter row: a read-only current value, or an empty input when the API has no value. */
interface ParameterField {
  key: string;
  /** The formatted current value; `null` when the dashboard does not report it. */
  value: string | null;
  /** Rows without an API source keep an editable number input. */
  editable?: boolean;
}

const actionButtonClass = 'shrink-0 w-full sm:ml-2 sm:w-auto';

const AdminSettingsPage = () => {
  const t = useTranslations('admin');
  const tContracts = useTranslations('contracts');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { data, isLoading } = useDashboardInfo();
  const unavailable = tCommon('status.unavailable');

  const contractCopy = Object.fromEntries(
    CONTRACT_ENTRY_IDS.map((id) => [
      id,
      {
        name: tContracts(`entries.${id}.name`),
        description: tContracts(`entries.${id}.description`),
      },
    ]),
  ) as ContractEntryCopy;

  const parameterFields = (dashboard: DashboardInfo): ParameterField[] => {
    const count = (value: unknown) => {
      const numeric = toFiniteNumber(value);
      return numeric === null ? null : formatGroupedNumber(numeric, locale);
    };
    const percent = (value: unknown) => {
      const numeric = toFiniteNumber(value);
      return numeric === null ? null : formatPercentPoints(numeric, locale);
    };
    const divisor = (value: unknown) => {
      const share = percentFromDivisor(value);
      const raw = toFiniteNumber(value);
      return share === null || raw === null
        ? null
        : t('settings.values.divisorPercent', {
            percent: formatPercentPoints(share, locale),
            divisor: formatGroupedNumber(raw, locale),
          });
    };
    const duration = (seconds: number | null) =>
      seconds === null ? null : formatSeconds(seconds, locale);
    const activation = dashboard.CurRoundStats?.ActivationTime;
    const timeIncrementMicroseconds = dashboard.MainPrizeTimeIncrementInMicroSeconds;

    return [
      { key: 'ethStellarRecipients', value: count(dashboard.NumRaffleEthWinnersBidding) },
      { key: 'nftStellarRecipients', value: count(dashboard.NumRaffleNFTWinnersBidding) },
      { key: 'nftHolderRecipients', value: count(dashboard.NumRaffleNFTWinnersStakingRWalk) },
      { key: 'signatureAllocationPercentage', value: percent(dashboard.PrizePercentage) },
      { key: 'publicGoodsPercentage', value: percent(dashboard.CharityPercentage) },
      { key: 'stellarSelectionPercentage', value: percent(dashboard.RafflePercentage) },
      { key: 'anchorDistributionPercentage', value: percent(dashboard.StakingPercentage) },
      { key: 'timeIncrease', value: divisor(dashboard.TimeIncrease) },
      { key: 'allocationTimeout', value: duration(secondsOrNull(dashboard.TimeoutClaimPrize)) },
      { key: 'priceIncrease', value: divisor(dashboard.PriceIncrease) },
      {
        key: 'gestureTimeIncrement',
        value: duration(secondsFromMicroseconds(timeIncrementMicroseconds)),
      },
      {
        key: 'initialAllocationSeconds',
        // `InitialSecondsUntilPrize` carries the divisor, not seconds (see DashboardInfo).
        value: duration(
          initialDurationSeconds(timeIncrementMicroseconds, dashboard.InitialSecondsUntilPrize),
        ),
      },
      { key: 'initialGestureCostFraction', value: null, editable: true },
      {
        key: 'activationTime',
        value:
          typeof activation === 'number' && activation > 0
            ? formatUtcDateTimeStamp(new Date(activation * 1000), locale)
            : null,
      },
      { key: 'gestureRatio', value: null, editable: true },
      {
        key: 'calibrationWindowLength',
        value: duration(secondsOrNull(dashboard.RoundStartCSTAuctionLength)),
      },
    ];
  };

  return (
    <PageShell variant="data" className="max-sm:pb-16">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title={t('settings.title')}
          subtitle={t('settings.subtitle')}
          breadcrumbs={[
            { label: t('settings.breadcrumbs.home'), href: '/' },
            { label: t('settings.breadcrumbs.admin'), href: '/admin' },
            { label: t('settings.breadcrumbs.settings') },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {isLoading || !data ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground" role="status">
              {t('settings.loading')}
            </p>
          </div>
        ) : (
          <SectionCard
            sectionId="admin-cosmic-contract"
            title={t('settings.contractTitle')}
            description={t('settings.contractDescription')}
          >
            <div>
              {/* The same address mapping and names as the public Contracts page. */}
              {buildContracts(data.ContractAddrs, contractCopy).map((contract) => (
                <AdminFieldRow key={contract.id} label={contract.name}>
                  <Input
                    placeholder={unavailable}
                    className="flex-1 font-mono text-sm"
                    value={contract.address}
                    readOnly
                  />
                  <Button variant="secondary" className={actionButtonClass}>
                    {t('settings.actions.setAddress')}
                  </Button>
                </AdminFieldRow>
              ))}
              {parameterFields(data).map((field) => (
                <AdminFieldRow key={field.key} label={t(`settings.fields.${field.key}`)}>
                  {field.editable ? (
                    <Input
                      type="number"
                      placeholder={t('settings.placeholders.number')}
                      className="flex-1"
                    />
                  ) : (
                    <Input
                      placeholder={unavailable}
                      className="flex-1 tabular-nums"
                      value={field.value ?? ''}
                      readOnly
                    />
                  )}
                  <Button variant="secondary" className={actionButtonClass}>
                    {t('settings.actions.set')}
                  </Button>
                </AdminFieldRow>
              ))}
              <AdminFieldRow label={t('settings.fields.switchMode')}>
                <Select defaultValue="runtime">
                  <SelectTrigger className="w-full flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="runtime">{t('settings.modes.runtime')}</SelectItem>
                    <SelectItem value="maintenance">{t('settings.modes.maintenance')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="secondary" className={actionButtonClass}>
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
            </div>
          </SectionCard>
        )}
      </div>
    </PageShell>
  );
};

export default AdminSettingsPage;

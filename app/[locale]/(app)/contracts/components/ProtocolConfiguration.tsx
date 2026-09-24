'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { formatCount, formatPercent } from '@/utils/format';
import { Amount } from '@/components/ui/amount';
import { Duration } from '@/components/ui/duration';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';

/**
 * A live protocol parameter: `undefined` while its read is in flight (a skeleton),
 * `null` when it failed (a dash announced as unavailable, never a zero the protocol
 * does not have).
 */
type Reading = number | null | undefined;

export interface ProtocolConfigurationProps {
  /** ETH Gesture Cost step-up, percent. */
  priceIncrease: Reading;
  /** Per-cycle growth of the time increment, percent (only quoted in a definition). */
  timeIncrease: number | null;
  /** Seconds added per gesture. */
  timeIncrement: Reading;
  /** Participation CST a gesture would imprint now. */
  cstRewardPerBid: Reading;
  maxMessageLength: Reading;
  /** Seconds the final participant has to finalize alone. */
  claimTimeout: Reading;
  /** Seconds, the first gesture's Cycle Finalization Time. */
  initialIncrement: Reading;
  ethStellarRecipients: Reading;
  nftStellarRecipients: Reading;
  anchoredStellarRecipients: Reading;
}

interface ConfigurationRow {
  id: string;
  label: string;
  definition: string;
  value: ReactNode;
}

/**
 * The protocol's live parameters as one spec sheet: each label explains
 * itself on hover or tap, each value sits right-aligned in tabular figures,
 * rows divided by hairlines in two columns from `md`.
 */
export function ProtocolConfiguration({
  priceIncrease,
  timeIncrease,
  timeIncrement,
  cstRewardPerBid,
  maxMessageLength,
  claimTimeout,
  initialIncrement,
  ethStellarRecipients,
  nftStellarRecipients,
  anchoredStellarRecipients,
}: ProtocolConfigurationProps) {
  const locale = useLocale();
  const t = useTranslations('contracts');
  const tCommon = useTranslations('common');
  const show = (value: Reading, render: (ready: number) => ReactNode) =>
    value === undefined ? (
      <Skeleton className="ms-auto h-4 w-16" />
    ) : value === null ? (
      <UnknownValue label={tCommon('status.unavailable')} />
    ) : (
      render(value)
    );
  const duration = (seconds: Reading) => show(seconds, (ready) => <Duration seconds={ready} />);
  const count = (value: Reading) => show(value, (ready) => formatCount(ready, locale));

  const rows: ConfigurationRow[] = [
    {
      id: 'ethStep',
      label: t('configuration.cards.ethStep.label'),
      definition: t('configuration.cards.ethStep.tooltip'),
      value: show(priceIncrease, (ready) => formatPercent(ready, locale)),
    },
    {
      id: 'timeIncrement',
      label: t('configuration.cards.timeIncrement.label'),
      // Until the live divisor is read, the rule quotes the verified protocol default.
      definition: t('configuration.cards.timeIncrement.tooltip', {
        percent: timeIncrease ?? protocolFacts.cycleTimeIncrementIncreasePercentPerCycle,
      }),
      value: duration(timeIncrement),
    },
    {
      id: 'initial',
      label: t('configuration.cards.initial.label'),
      definition: t('configuration.cards.initial.tooltip'),
      value: duration(initialIncrement),
    },
    {
      id: 'finalization',
      label: t('configuration.cards.finalization.label'),
      definition: t('configuration.cards.finalization.tooltip'),
      value: duration(claimTimeout),
    },
    {
      id: 'cstPreview',
      label: t('configuration.cards.cstPreview.label'),
      definition: t('configuration.cards.cstPreview.tooltip', {
        formula: protocolFacts.dynamicCstRewardFormula,
      }),
      value: show(cstRewardPerBid, (ready) => <Amount value={ready} unit="CST" />),
    },
    {
      id: 'message',
      label: t('configuration.cards.message.label'),
      definition: t('configuration.cards.message.tooltip'),
      value: count(maxMessageLength),
    },
    {
      id: 'ethStellar',
      label: t('parameters.selection.ethLabel'),
      definition: t('parameters.selection.ethTooltip'),
      value: count(ethStellarRecipients),
    },
    {
      id: 'nftStellar',
      label: t('parameters.selection.nftLabel'),
      definition: t('parameters.selection.nftTooltip'),
      value: count(nftStellarRecipients),
    },
    {
      id: 'anchoredStellar',
      label: t('parameters.selection.anchorLabel'),
      definition: t('parameters.selection.anchorTooltip'),
      value: count(anchoredStellarRecipients),
    },
  ];

  return (
    <section aria-labelledby="protocol-configuration-heading">
      <SectionHeader
        headingId="protocol-configuration-heading"
        title={t('configuration.title')}
        description={t('configuration.description')}
      />
      <dl className="mt-6 grid gap-x-12 md:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.id}
            data-parameter={row.id}
            className="flex min-h-12 items-center justify-between gap-4 border-b border-rule-faint py-2.5"
          >
            <dt className="min-w-0 type-body-sm text-muted-foreground">
              <ExplainedTerm definition={row.definition} announce="moreInformation">
                {row.label}
              </ExplainedTerm>
            </dt>
            <dd className="shrink-0 text-end type-figure-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

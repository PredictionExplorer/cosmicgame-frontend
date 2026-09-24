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
  /** The freshness of the live reads, beside the heading. */
  status?: ReactNode;
}

interface ConfigurationRow {
  id: string;
  label: string;
  definition: string;
  value: ReactNode;
}

/** The sheet's groups, in reading order; titles live in `contracts.configuration.groups`. */
const CONFIGURATION_GROUPS = ['gestures', 'timing', 'selection'] as const;
type ConfigurationGroup = (typeof CONFIGURATION_GROUPS)[number];

/**
 * The protocol's live parameters as one spec sheet in three groups — what a
 * gesture costs and imprints, the cycle's timing, and the Stellar Selection
 * counts — each a column read top to bottom from `lg`, stacked below. Each
 * label explains itself on hover or tap, and each value sits right-aligned
 * in tabular figures. `status` is the freshness stamp of the values polled
 * from the contracts.
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
  status,
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

  const groups: Record<ConfigurationGroup, ConfigurationRow[]> = {
    gestures: [
      {
        id: 'ethStep',
        label: t('configuration.cards.ethStep.label'),
        definition: t('configuration.cards.ethStep.tooltip'),
        value: show(priceIncrease, (ready) => formatPercent(ready, locale)),
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
    ],
    timing: [
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
    ],
    selection: [
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
    ],
  };

  return (
    <section aria-labelledby="protocol-configuration-heading">
      <SectionHeader
        headingId="protocol-configuration-heading"
        title={t('configuration.title')}
        description={t('configuration.description')}
        actions={status}
      />
      <div className="mt-6 grid gap-x-10 gap-y-8 lg:grid-cols-3">
        {CONFIGURATION_GROUPS.map((group) => (
          <div key={group} role="group" aria-labelledby={`configuration-${group}-heading`}>
            <h3
              id={`configuration-${group}-heading`}
              className="border-b border-rule pb-2 type-label text-subtle"
            >
              {t(`configuration.groups.${group}`)}
            </h3>
            <dl>
              {groups[group].map((row) => (
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
          </div>
        ))}
      </div>
    </section>
  );
}

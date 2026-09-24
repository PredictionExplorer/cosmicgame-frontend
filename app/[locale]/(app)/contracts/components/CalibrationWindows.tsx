'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { CalibrationWindowIcon } from '@/lib/conceptIcons';
import { formatPercent } from '@/utils/format';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import { Duration } from '@/components/ui/duration';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';

import {
  calibrationWindowStatus,
  type CalibrationWindowReading,
  type CalibrationWindowStatus,
} from './calibrationWindow';

/** A window reading: `undefined` while the read is in flight, `null` when it failed. */
type Reading = CalibrationWindowReading | null | undefined;

export interface CalibrationWindowsProps {
  cst: Reading;
  eth: Reading;
  /** The CST window's starting cost (CST); `undefined` while read, `null` when it failed. */
  cstStartingCost: number | null | undefined;
  /**
   * The cycle already has a gesture: the ETH window no longer prices anything.
   * `undefined` while the dashboard loads, `null` when it could not be read: the
   * ETH window's state is then unknown, never guessed as running or complete.
   */
  cycleHasGestures: boolean | null | undefined;
}

/** Re-renders once a second while `active`, so a running window's figures advance. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

const STATE_TONE = {
  running: 'live',
  notStarted: 'neutral',
  complete: 'neutral',
  closed: 'neutral',
} as const;

/**
 * The two Calibration Windows, each with its state in words, a progress rule
 * while it runs, and the time left, so a window that has run its course reads
 * as complete instead of as an elapsed time longer than the window.
 */
export function CalibrationWindows({
  cst,
  eth,
  cstStartingCost,
  cycleHasGestures,
}: CalibrationWindowsProps) {
  const t = useTranslations('contracts');
  const now = useNow(Boolean(cst || eth));
  const cstStatus = cst ? calibrationWindowStatus(cst, now) : cst;
  // The ETH window's state needs both its reading and whether the cycle has a gesture.
  const ethStatus = !eth
    ? eth
    : typeof cycleHasGestures === 'boolean'
      ? calibrationWindowStatus(eth, now, { closedEarly: cycleHasGestures })
      : cycleHasGestures;

  return (
    <section aria-labelledby="calibration-windows-heading">
      <SectionHeader
        headingId="calibration-windows-heading"
        title={t('parameters.windowsTitle')}
        description={t('parameters.windowsDescription')}
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <WindowPanel
          id="cst"
          title={t('parameters.cstTitle')}
          reading={cst}
          status={cstStatus}
          durationDefinition={t('parameters.cstDurationTooltip', {
            increase: protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture,
            decrease: protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture,
          })}
          elapsedDefinition={t('parameters.cstElapsedTooltip')}
          note={cstStatus?.state === 'complete' ? t('parameters.cstComplete') : null}
          extra={{
            label: t('parameters.ceiling'),
            definition: t('parameters.cstCeilingTooltip'),
            value: cstStartingCost,
          }}
        />
        <WindowPanel
          id="eth"
          title={t('parameters.ethTitle')}
          reading={eth}
          status={ethStatus}
          durationDefinition={t('parameters.ethDurationTooltip')}
          elapsedDefinition={t('parameters.ethElapsedTooltip')}
          note={
            ethStatus?.state === 'closed'
              ? t('parameters.ethClosed')
              : ethStatus?.state === 'complete'
                ? t('parameters.ethComplete')
                : null
          }
        />
      </div>
    </section>
  );
}

function WindowPanel({
  id,
  title,
  reading,
  status,
  durationDefinition,
  elapsedDefinition,
  note,
  extra,
}: {
  id: string;
  title: string;
  /** The window's own reading: its length reads even while its state is unknown. */
  reading: Reading;
  /** Where the window stands: `undefined` while that is being read, `null` when unknown. */
  status: CalibrationWindowStatus | null | undefined;
  durationDefinition: string;
  elapsedDefinition: string;
  note: string | null;
  extra?: { label: string; definition: string; value: number | null | undefined };
}) {
  const t = useTranslations('contracts');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;
  const pending = <Skeleton className="h-4 w-24" />;
  const headingId = `calibration-${id}-heading`;

  const value = (render: (ready: CalibrationWindowStatus) => ReactNode) =>
    status === undefined ? pending : status === null ? unknown : render(status);

  const running = status?.state === 'running';
  const rows = [
    {
      id: 'duration',
      label: t('parameters.duration'),
      definition: durationDefinition,
      value:
        reading === undefined ? (
          pending
        ) : reading === null ? (
          unknown
        ) : (
          <Duration seconds={Math.max(0, reading.durationSeconds)} />
        ),
    },
    ...(running
      ? [
          {
            id: 'elapsed',
            label: t('parameters.elapsed'),
            definition: elapsedDefinition,
            value: value((ready) => <Duration seconds={ready.elapsedSeconds} />),
          },
          {
            id: 'remaining',
            label: t('parameters.remaining'),
            definition: null,
            value: value((ready) => <Duration seconds={ready.remainingSeconds} />),
          },
        ]
      : []),
    ...(extra
      ? [
          {
            id: 'extra',
            label: extra.label,
            definition: extra.definition,
            value:
              extra.value === undefined ? (
                pending
              ) : extra.value === null ? (
                unknown
              ) : (
                <Amount value={extra.value} unit="CST" />
              ),
          },
        ]
      : []),
  ];

  return (
    <section
      aria-labelledby={headingId}
      data-window={id}
      data-state={status ? status.state : status === null ? 'unknown' : 'loading'}
      className="rounded-surface border border-rule p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 id={headingId} className="flex items-center gap-2 type-title text-foreground">
          <CalibrationWindowIcon aria-hidden className="size-4 text-subtle" />
          {title}
        </h3>
        {status ? (
          <Badge tone={STATE_TONE[status.state]} dot={status.state === 'running'} size="sm">
            {t(`parameters.state.${status.state}`)}
          </Badge>
        ) : null}
      </div>

      {running && status ? (
        <div className="mt-5">
          <div
            role="progressbar"
            aria-label={title}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(status.progress * 100)}
            aria-valuetext={t('parameters.progress', {
              percent: formatPercent(status.progress * 100, locale, { maximumFractionDigits: 0 }),
            })}
            className="h-1.5 w-full rounded-pill bg-surface-sunken"
          >
            <div
              className="h-full rounded-pill bg-primary"
              style={{ width: `${Math.max(1, status.progress * 100)}%` }}
            />
          </div>
          <p className="mt-2 type-label text-muted-foreground">
            {t('parameters.progress', {
              percent: formatPercent(status.progress * 100, locale, { maximumFractionDigits: 0 }),
            })}
          </p>
        </div>
      ) : null}

      <dl className="mt-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex min-h-11 items-center justify-between gap-4 border-b border-rule-faint py-2 last:border-b-0"
          >
            <dt className="min-w-0 type-body-sm text-muted-foreground">
              {row.definition ? (
                <ExplainedTerm definition={row.definition} announce="moreInformation">
                  {row.label}
                </ExplainedTerm>
              ) : (
                row.label
              )}
            </dt>
            <dd className="shrink-0 text-end type-figure-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>

      {note ? <p className="mt-3 type-body-sm text-muted-foreground">{note}</p> : null}
    </section>
  );
}

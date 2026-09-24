'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatCount, formatPercent, type AmountInput, type AmountUnit } from '@/utils/format';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { DateTime } from '@/components/ui/date-time';
import { Duration } from '@/components/ui/duration';
import { UnknownValue } from '@/components/ui/unknown-value';

import { TableLink, TxProofLink } from './cells';
import { isBlankValue, type ColumnKind, type SortValue } from './column-kinds';

/** The per-kind options a column can set; see `DataTableColumn`. */
export interface KindOptions {
  unit?: AmountUnit;
  showUnit?: boolean;
  percentScale?: 'percent' | 'ratio';
  seconds?: boolean;
  year?: 'auto' | 'always' | 'never';
  copy?: boolean;
  zeroRole?: 'from' | 'to';
  currentAddress?: string | null;
  whenBlank?: 'empty' | 'unknown';
  /** What a blank value's dash says to a screen reader. Default "Unavailable". */
  blankLabel?: string;
}

/** Kinds whose blank value means "could not be read" rather than "not applicable". */
const UNKNOWN_WHEN_BLANK: ReadonlySet<ColumnKind> = new Set([
  'amount',
  'count',
  'percent',
  'duration',
]);

/** Whether a blank value of this kind shows the unavailable dash (otherwise nothing). */
export function blankShowsUnknown(kind: ColumnKind, whenBlank?: 'empty' | 'unknown'): boolean {
  return whenBlank ? whenBlank === 'unknown' : UNKNOWN_WHEN_BLANK.has(kind);
}

const toNumber = (value: SortValue): number =>
  typeof value === 'bigint' ? Number(value) : Number(value);

interface KindValueProps extends KindOptions {
  kind: ColumnKind;
  value: SortValue;
  /** Internal destination (link, address, datetime). */
  href?: string | null;
  /** Transaction hash; a datetime without `href` links to it on the explorer. */
  txHash?: string | null;
}

/**
 * The default rendering of a raw value by its column kind, through the
 * formatting layer (utils/format) and its components, so every table shows an
 * amount, a count, a date or an address the same way.
 */
export function KindValue({
  kind,
  value,
  href,
  txHash,
  unit = 'ETH',
  showUnit = true,
  percentScale = 'percent',
  seconds = false,
  year,
  copy = false,
  zeroRole,
  currentAddress,
  whenBlank,
  blankLabel,
}: KindValueProps): ReactNode {
  const locale = useLocale();
  const t = useTranslations('tables');

  if (isBlankValue(value)) {
    return blankShowsUnknown(kind, whenBlank) ? (
      <UnknownValue label={blankLabel ?? t('status.unavailable')} />
    ) : null;
  }

  switch (kind) {
    case 'amount':
      return (
        <Amount
          value={value as AmountInput}
          unit={unit}
          context="table"
          showUnit={showUnit}
          unitClassName="text-subtle"
        />
      );
    case 'count':
      return formatCount(toNumber(value), locale);
    case 'percent':
      // One fixed decimal, so the decimal points of a column line up.
      return formatPercent(toNumber(value), locale, {
        scale: percentScale,
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
    case 'duration':
      return <Duration seconds={toNumber(value)} />;
    case 'datetime': {
      const time = <DateTime timestamp={toNumber(value)} seconds={seconds} year={year} />;
      if (href) return <TableLink href={href}>{time}</TableLink>;
      if (txHash) return <TxProofLink hash={txHash}>{time}</TxProofLink>;
      return time;
    }
    case 'address':
      return (
        <AddressChip
          address={String(value)}
          variant="plain"
          showCopy={copy}
          href={href === null ? false : (href ?? undefined)}
          zeroRole={zeroRole}
          currentAddress={currentAddress}
        />
      );
    case 'link':
      return href ? <TableLink href={href}>{String(value)}</TableLink> : String(value);
    case 'text':
    case 'status':
      return String(value);
  }
}

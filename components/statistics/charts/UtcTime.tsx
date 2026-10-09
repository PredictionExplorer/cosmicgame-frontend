import { formatUnixTsLabel, toIsoDateTime } from '@/utils/format';
import { TxProofLink } from '@/components/ui/data-table';

/**
 * A chart table's date-time in UTC, zone included ("Aug 12, 2026 00:38
 * UTC"), so the table reads in the zone of the chart's axis and tooltip
 * rather than in the reader's zone that a ledger `datetime` column shows.
 * Linked to its transaction when it has one.
 */
export function UtcTime({
  timestamp,
  locale,
  txHash,
}: {
  timestamp: number;
  locale: string;
  txHash?: string;
}) {
  const time = (
    <time dateTime={toIsoDateTime(timestamp)} className="whitespace-nowrap">
      {formatUnixTsLabel(timestamp, true, locale)}
    </time>
  );
  return txHash ? <TxProofLink hash={txHash}>{time}</TxProofLink> : time;
}

import { formatCount } from '@/utils/format';

/**
 * A section title followed by how many rows its ledger holds ("Gesture
 * history 1,143"), the count quieter and in tabular figures. No count is
 * shown while it is unknown.
 */
export function TitleWithCount({
  title,
  count,
  locale,
}: {
  title: string;
  count: number | null;
  locale: string;
}) {
  return (
    <>
      {title}
      {count === null ? null : (
        <span className="ms-3 tabular-nums text-subtle" data-testid="section-count">
          {formatCount(count, locale)}
        </span>
      )}
    </>
  );
}

import { getLocaleConfig } from '@/i18n/localeConfig';
import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/format';

/**
 * A section title followed by how many rows its ledger holds ("Gesture
 * history 1,143"), the count quieter and in tabular figures. No count is
 * shown while it is unknown.
 *
 * The title also names its section and tablist (aria-labelledby), so the
 * count is joined by the locale's word space ("Gesture history 1,143", but
 * "本周期参与者13"), never glued on by the margin alone.
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
  const spaced = getLocaleConfig(locale).wordSpacing;
  return (
    <>
      {title}
      {count === null ? null : (
        <>
          {spaced ? ' ' : null}
          <span
            className={cn('tabular-nums text-subtle', spaced ? 'ms-1.5' : 'ms-3')}
            data-testid="section-count"
          >
            {formatCount(count, locale)}
          </span>
        </>
      )}
    </>
  );
}

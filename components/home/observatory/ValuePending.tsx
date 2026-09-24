import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

export interface ValuePendingProps {
  /** The width of the value it stands in for, in characters of the current font. */
  ch?: number;
  /** Visually hidden text for assistive technology; defaults to "Loading…". */
  label?: string;
  className?: string;
}

/**
 * An inline placeholder for one figure that has not arrived yet: a skeleton
 * bar as wide as the value will be (so nothing reflows when it lands) and a
 * spoken "Loading…". It is a `<span>`, so it sits inside a sentence, a `<p>`
 * or a `<dd>` where the block Skeleton cannot. Never render a pending figure
 * as `0`, `0s` or `0%`.
 */
export function ValuePending({ ch = 8, label, className }: ValuePendingProps) {
  const tCommon = useTranslations('common');
  return (
    <span data-slot="value-pending" className={cn('inline-flex align-middle', className)}>
      <span
        aria-hidden
        className="inline-block h-[1em] rounded-edge bg-muted/70 motion-safe:animate-pulse"
        style={{ width: `${ch}ch` }}
      />
      <span className="sr-only">{label ?? tCommon('status.loadingDots')}</span>
    </span>
  );
}

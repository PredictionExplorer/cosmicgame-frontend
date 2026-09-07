import { cn } from '@/lib/utils';

import styles from './BrandMark.module.css';

/** Original logo silhouette, colored by the shared palette; its home link supplies the name. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      data-brand-mark
      aria-hidden="true"
      className={cn('inline-block h-12 w-12 shrink-0', styles.mark, className)}
    />
  );
}

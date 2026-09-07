import Image from 'next/image';

import { cn } from '@/lib/utils';

/** Original brand artwork; the adjacent wordmark or home link supplies its accessible name. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo2.svg"
      width={48}
      height={48}
      alt=""
      aria-hidden="true"
      loading="eager"
      className={cn('shrink-0 object-contain', className)}
    />
  );
}

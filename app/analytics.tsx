'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import * as ga from '@/utils/analytics';

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = searchParams.size > 0 ? `${pathname}?${searchParams.toString()}` : pathname;
    ga.pageview(url);
  }, [pathname, searchParams]);

  return null;
}

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';

import * as ga from '@/utils/analytics';

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = searchParams.size > 0 ? `${pathname}?${searchParams.toString()}` : pathname;
    ga.pageview(url);
  }, [pathname, searchParams]);

  // Field Core Web Vitals to GA4, so layout changes (like the Deck redesign)
  // can be verified against real-user LCP/INP/CLS instead of lab runs only.
  // CLS is scaled by 1000 because GA4 event values must be integers.
  useReportWebVitals((metric) => {
    ga.event({
      action: metric.name,
      category: 'web-vitals',
      label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    });
  });

  return null;
}

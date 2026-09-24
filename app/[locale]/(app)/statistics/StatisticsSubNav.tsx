'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useStickyClearance } from '@/hooks/useStickyClearance';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ScrollRail } from '@/components/ui/scroll-rail';
import { tabsListVariants, tabsTriggerVariants } from '@/components/ui/tabs';

import { ALL_STATISTICS_SECTIONS, isCurrentSection } from './statistics-sections';

/**
 * Whether a sticky element is stuck under its `top` offset: a sentinel just
 * above it has scrolled under the fixed header. Drives the glass band, which
 * only appears once the bar floats over content.
 */
function useStuck() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const sticky = stickyRef.current;
    if (!sentinel || !sticky || typeof IntersectionObserver === 'undefined') return;
    // The resolved `top` of a sticky element is in pixels.
    const top = Math.ceil(parseFloat(getComputedStyle(sticky).top) || 0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Stuck once the sentinel has scrolled up past the offset, not while it sits below the
        // fold. (Some observer shims report no box; treat that as not scrolled past.)
        const sentinelTop = entry.boundingClientRect?.top ?? Number.POSITIVE_INFINITY;
        setStuck(!entry.isIntersecting && sentinelTop <= top);
      },
      { rootMargin: `-${top}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, stickyRef, stuck };
}

/**
 * The statistics pages' sub-navigation: underline tabs set on the page
 * header's bottom rule, sticky under the site header. Links, not ARIA tabs —
 * each one is its own page — with the current one marked
 * `aria-current="page"`. The row scrolls sideways on a phone with edge fades
 * and keeps the current page in view (ScrollRail); once it floats over
 * content it takes the header's glass across the full width.
 */
export function StatisticsSubNav() {
  const pathname = usePathname();
  const t = useTranslations('statistics');
  const { sentinelRef, stickyRef, stuck } = useStuck();
  // Focus scrolled into view stops below the bar, not under it.
  useStickyClearance(stickyRef);

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-0" />
      <nav
        ref={stickyRef}
        aria-label={t('navigation.ariaLabel')}
        data-stuck={stuck || undefined}
        className={cn(
          'sticky top-[var(--header-height)] z-30 mb-10 sm:mb-12',
          // The glass band spans the viewport, behind the container-wide tab row.
          'before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:border-b before:border-rule before:opacity-0 before:glass before:transition-opacity before:duration-base',
          'data-[stuck]:before:opacity-100',
        )}
      >
        <ScrollRail>
          <ul
            className={cn(
              tabsListVariants({ variant: 'underline' }),
              'w-max min-w-full flex-nowrap gap-0 sm:gap-2',
            )}
          >
            {ALL_STATISTICS_SECTIONS.map((section) => {
              const current = isCurrentSection(section, pathname);
              return (
                <li key={section.href} className="shrink-0">
                  <Link
                    href={section.href}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      tabsTriggerVariants({ variant: 'underline', scroll: true }),
                      'focus-ring-inset no-underline',
                    )}
                  >
                    {t(`navigation.${section.messageKey}.label`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </ScrollRail>
      </nav>
    </>
  );
}

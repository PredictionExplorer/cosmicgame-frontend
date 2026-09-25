'use client';

import { useTranslations } from 'next-intl';

import { useStickyClearance } from '@/hooks/useStickyClearance';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { ScrollRail } from '@/components/ui/scroll-rail';
import { useStuck } from '@/components/statistics/useStuck';
import { tabsListVariants, tabsTriggerVariants } from '@/components/ui/tabs';

import { ALL_STATISTICS_SECTIONS, isCurrentSection } from './statistics-sections';

/**
 * The statistics pages' sub-navigation: underline tabs set on the page
 * header's bottom rule, sticky under the site header. Links, not ARIA tabs —
 * each one is its own page — with the current one marked
 * `aria-current="page"`. The row scrolls sideways on a phone with edge fades
 * and keeps the current page in view (ScrollRail); once it floats over
 * content it takes the header's glass across the full width. The tabs
 * prefetch on hover or focus, not on sight: every page behind them carries
 * its own charts, and six viewport prefetches loaded them all with the hub.
 */
export function StatisticsSubNav() {
  const pathname = usePathname();
  const t = useTranslations('statistics');
  const { sentinelRef, stickyRef, stuck } = useStuck<HTMLElement>();
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
                  <SiteLink
                    href={section.href}
                    kind="internal"
                    prefetch="intent"
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      tabsTriggerVariants({ variant: 'underline', scroll: true }),
                      'focus-ring-inset no-underline',
                    )}
                  >
                    {t(`navigation.${section.messageKey}.label`)}
                  </SiteLink>
                </li>
              );
            })}
          </ul>
        </ScrollRail>
      </nav>
    </>
  );
}

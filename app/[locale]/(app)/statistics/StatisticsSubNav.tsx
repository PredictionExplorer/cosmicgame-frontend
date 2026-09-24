'use client';

import { useLayoutEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { ALL_STATISTICS_SECTIONS, STATISTICS_HUB } from './statistics-sections';

/**
 * Centres the active item of a horizontal scroller in view, moving only the
 * scroller (never the page), so a phone opened on a later section sees which
 * one it is in.
 */
export function centerActiveItem(scroller: HTMLElement, item: HTMLElement): void {
  const target = item.offsetLeft - (scroller.clientWidth - item.offsetWidth) / 2;
  const max = scroller.scrollWidth - scroller.clientWidth;
  scroller.scrollLeft = Math.max(0, Math.min(target, max));
}

/**
 * Sticky secondary navigation between the statistics section pages.
 * Mirrors the FAQ category nav: pill links, horizontal scroll on mobile,
 * frosted background while stuck under the app header. On phones the row
 * fades at its edges and scrolls the active section into view.
 */
export function StatisticsSubNav() {
  const pathname = usePathname();
  const t = useTranslations('statistics');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    if (scrollerRef.current && activeRef.current) {
      centerActiveItem(scrollerRef.current, activeRef.current);
    }
  }, [pathname]);

  return (
    <div className="sticky top-[var(--sticky-offset)] z-30 -mx-4 mb-8 px-4">
      <nav
        aria-label={t('navigation.ariaLabel')}
        className="border-b border-white/[0.06] bg-background/85 py-3 backdrop-blur-xl"
      >
        <div
          ref={scrollerRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none max-sm:[mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)] max-sm:px-3"
        >
          {ALL_STATISTICS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive =
              section.href === STATISTICS_HUB.href
                ? pathname === STATISTICS_HUB.href
                : pathname === section.href || pathname.startsWith(`${section.href}/`);
            return (
              <Link
                key={section.href}
                ref={isActive ? activeRef : undefined}
                href={section.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium no-underline transition-all duration-200',
                  isActive
                    ? 'bg-primary/15 text-primary shadow-sm shadow-primary/10'
                    : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {t(`navigation.${section.messageKey}.label`)}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

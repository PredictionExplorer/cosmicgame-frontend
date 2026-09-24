'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { ALL_STATISTICS_SECTIONS, STATISTICS_HUB } from './statistics-sections';

/**
 * Centres the active item of a horizontal scroller in view, moving only the
 * scroller (never the page), so a phone opened on a later section sees which
 * one it is in. Measured from the two boxes, not `offsetLeft`, which counts
 * from the item's offset parent (the sticky wrapper), not the scroller.
 */
export function centerActiveItem(scroller: HTMLElement, item: HTMLElement): void {
  const scrollerBox = scroller.getBoundingClientRect();
  const itemBox = item.getBoundingClientRect();
  // The item's left edge in the scroller's content coordinates.
  const itemLeft = itemBox.left - scrollerBox.left - scroller.clientLeft + scroller.scrollLeft;
  const target = itemLeft - (scroller.clientWidth - itemBox.width) / 2;
  const max = scroller.scrollWidth - scroller.clientWidth;
  scroller.scrollLeft = Math.max(0, Math.min(target, max));
}

/** Which edges of a horizontal scroller hide content. */
export function scrollEdges(scroller: HTMLElement): { start: boolean; end: boolean } {
  const max = scroller.scrollWidth - scroller.clientWidth;
  return { start: scroller.scrollLeft > 1, end: scroller.scrollLeft < max - 1 };
}

/** The phone edge fade: only an edge with more pills behind it fades. */
const EDGE_FADE = {
  none: '',
  start: 'max-sm:[mask-image:linear-gradient(to_right,transparent,black_1.5rem)]',
  end: 'max-sm:[mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)]',
  both: 'max-sm:[mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)]',
} as const;

/**
 * Sticky secondary navigation between the statistics section pages.
 * Mirrors the FAQ category nav: pill links, horizontal scroll on mobile,
 * frosted background while stuck under the app header. On phones the row
 * scrolls the active section into view and fades the edges that hide pills.
 */
export function StatisticsSubNav() {
  const pathname = usePathname();
  const t = useTranslations('statistics');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const updateEdges = useCallback(() => {
    if (!scrollerRef.current) return;
    const next = scrollEdges(scrollerRef.current);
    setEdges((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
  }, []);

  useLayoutEffect(() => {
    if (scrollerRef.current && activeRef.current) {
      centerActiveItem(scrollerRef.current, activeRef.current);
    }
    updateEdges();
  }, [pathname, updateEdges]);

  useLayoutEffect(() => {
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [updateEdges]);

  const fade = edges.start ? (edges.end ? 'both' : 'start') : edges.end ? 'end' : 'none';

  return (
    <div className="sticky top-[var(--sticky-offset)] z-30 -mx-4 mb-8 px-4">
      <nav
        aria-label={t('navigation.ariaLabel')}
        className="border-b border-white/[0.06] bg-background/85 py-3 backdrop-blur-xl"
      >
        <div
          ref={scrollerRef}
          onScroll={updateEdges}
          data-fade={fade}
          className={cn(
            'flex items-center gap-2 overflow-x-auto scrollbar-none max-sm:px-3',
            EDGE_FADE[fade],
          )}
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

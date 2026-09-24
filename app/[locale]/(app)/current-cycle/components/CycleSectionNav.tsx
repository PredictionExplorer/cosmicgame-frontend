'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { jumpToSection } from '@/lib/jumpToSection';
import { cn } from '@/lib/utils';
import { ScrollRail } from '@/components/ui/scroll-rail';
import { tabsListVariants, tabsTriggerVariants } from '@/components/ui/tabs';

/**
 * The page's sections, in page order: each id is the element the entry
 * scrolls to, each key its label under `currentCycle.sectionNav`.
 */
export const CYCLE_SECTIONS = [
  { id: 'standings', key: 'standings' },
  { id: 'allocations', key: 'allocations' },
  { id: 'participants', key: 'participants' },
  { id: 'gesture-history', key: 'gestures' },
  { id: 'rules', key: 'rules' },
] as const;

/**
 * What every section above needs, so a jump lands below the site header and
 * this bar rather than under them.
 */
export const CYCLE_SECTION_SCROLL_MARGIN = 'scroll-mt-[calc(var(--header-height)+4.5rem)]';

/** Whether the bar is stuck under the site header (its sentinel scrolled past it). */
function useStuck() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const sticky = stickyRef.current;
    if (!sentinel || !sticky || typeof IntersectionObserver === 'undefined') return;
    const top = Math.ceil(parseFloat(getComputedStyle(sticky).top) || 0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
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
 * The current cycle's in-page navigation: one underline row of anchors
 * (Standings, Allocations, Participants, Gestures, Rules) stuck under the
 * site header, so a phone reader reaches the gesture history without
 * scrolling past every ledger. Its underline row is the page header's
 * bottom rule. The section being read is marked
 * `aria-current="location"`; a jump scrolls to the section, updates the
 * address and moves keyboard focus to its heading. Once the bar floats over
 * content it takes the header's glass across the full width. Standings are
 * listed only while the cycle has them.
 */
export function CycleSectionNav({ hasStandings }: { hasStandings: boolean }) {
  const t = useTranslations('currentCycle');
  const { sentinelRef, stickyRef, stuck } = useStuck();
  const sections = CYCLE_SECTIONS.filter((section) => hasStandings || section.id !== 'standings');
  const [active, setActive] = useState<string | null>(null);
  const ids = sections.map((section) => section.id).join(' ');

  // The entry for the section in the reading band is the current one.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-25% 0px -65% 0px' },
    );
    for (const id of ids.split(' ')) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-0" />
      <nav
        ref={stickyRef}
        aria-label={t('sectionNav.aria')}
        data-sticky-subnav=""
        data-stuck={stuck || undefined}
        className={cn(
          // Its own stacking layer, so the band behind the row covers the page.
          'sticky top-[var(--header-height)] z-[var(--z-sticky-nav)] mb-8 sm:mb-10',
          // The glass band spans the viewport, behind the container-wide row.
          'before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:border-b before:border-rule before:opacity-0 before:glass before:transition-opacity before:duration-base',
          'data-[stuck]:before:opacity-100',
        )}
      >
        <ScrollRail activeSelector='[aria-current="location"]'>
          <ul
            className={cn(
              tabsListVariants({ variant: 'underline' }),
              'w-max min-w-full flex-nowrap gap-0 sm:gap-2',
            )}
          >
            {sections.map((section) => (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  aria-current={active === section.id ? 'location' : undefined}
                  onClick={(event) => {
                    if (!jumpToSection(section.id)) return;
                    event.preventDefault();
                    setActive(section.id);
                  }}
                  className={cn(
                    tabsTriggerVariants({ variant: 'underline', scroll: true }),
                    'focus-ring-inset no-underline',
                    'aria-[current=location]:text-foreground aria-[current=location]:shadow-[inset_0_-2px_0_0_hsl(var(--primary))]',
                  )}
                >
                  {t(`sectionNav.${section.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </ScrollRail>
      </nav>
    </>
  );
}

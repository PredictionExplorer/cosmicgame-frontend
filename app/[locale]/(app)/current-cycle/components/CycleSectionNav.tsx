'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { jumpToSection } from '@/lib/jumpToSection';
import { cn } from '@/lib/utils';
import { ScrollRail } from '@/components/ui/scroll-rail';

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
 * What every section above needs, so a jump lands its heading just below
 * this bar. The page's scroll padding (`--sticky-offset`) already clears the
 * site header; the margin adds the bar (at most 2.75rem, its phone touch
 * height) and a 0.75rem gap, so the end of the previous section never shows
 * between the bar and the heading.
 */
export const CYCLE_SECTION_SCROLL_MARGIN = 'scroll-mt-[3.5rem]';

/** The reading band, 25–35% down the viewport: a section crossing it is the one being read. */
const READING_BAND_MARGIN = '-25% 0px -65% 0px';
const READING_BAND_BOTTOM = 0.35;

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
 * The current cycle's "On this page" bar: its label, then a row of plain
 * anchors (Standings, Allocations, Participants, Gestures, Rules) stuck under
 * the site header, so a phone reader reaches the gesture history without
 * scrolling past every ledger. It is not a tab row: no underline track, and
 * the section being read is marked with a small dot and full-contrast text
 * (`aria-current="location"`), so it never reads like the Participants view
 * switcher further down. The first section is current from the top of the
 * page. A jump scrolls to the section, updates the address and moves keyboard
 * focus to its heading. The bar's bottom edge is the page header's rule; once
 * it floats over content it takes the header's glass across the full width.
 * Standings are listed only while the cycle has them.
 */
export function CycleSectionNav({ hasStandings }: { hasStandings: boolean }) {
  const t = useTranslations('currentCycle');
  const { sentinelRef, stickyRef, stuck } = useStuck();
  const sections = CYCLE_SECTIONS.filter((section) => hasStandings || section.id !== 'standings');
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);
  const ids = sections.map((section) => section.id).join(' ');
  const labelId = 'cycle-section-nav-label';

  // The first section (in page order) crossing the reading band is the
  // current one. In a gap between sections the one above stays current; above
  // the first section (the page header) the first one is, where the bar leads.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const order = ids.split(' ');
    const crossing = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        const current = order.find((id) => crossing.has(id));
        if (current) {
          setActive(current);
          return;
        }
        const first = order.map((id) => document.getElementById(id)).find(Boolean);
        if (first && first.getBoundingClientRect().top > window.innerHeight * READING_BAND_BOTTOM) {
          setActive(first.id);
        }
      },
      { rootMargin: READING_BAND_MARGIN },
    );
    for (const id of order) {
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
        aria-labelledby={labelId}
        data-sticky-subnav=""
        data-stuck={stuck || undefined}
        className={cn(
          // Its own stacking layer, so the band behind the row covers the page.
          'sticky top-[var(--header-height)] z-[var(--z-sticky-nav)] mb-8 flex items-center gap-x-6 border-b border-rule sm:mb-10',
          // The glass band spans the viewport, behind the container-wide row.
          'before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:border-b before:border-rule before:opacity-0 before:glass before:transition-opacity before:duration-base',
          'data-[stuck]:before:opacity-100',
        )}
      >
        <span id={labelId} className="shrink-0 type-eyebrow text-subtle max-sm:sr-only">
          {t('sectionNav.aria')}
        </span>
        <ScrollRail activeSelector='[aria-current="location"]' className="min-w-0 flex-1">
          <ul className="flex w-max min-w-full flex-nowrap items-center gap-x-6">
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
                    'group focus-ring-inset inline-flex min-h-11 items-center gap-2 whitespace-nowrap type-label text-muted-foreground no-underline transition-colors duration-fast hover:text-foreground',
                    'aria-[current=location]:text-foreground',
                  )}
                >
                  {/* The dot marks the section being read; it keeps its space, so nothing shifts. */}
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 rounded-pill bg-primary opacity-0 transition-opacity duration-fast group-aria-[current=location]:opacity-100"
                  />
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

'use client';

import { useEffect, useState } from 'react';

import { jumpToSection } from '@/lib/jumpToSection';
import { useStickyClearance } from '@/hooks/useStickyClearance';
import { cn } from '@/lib/utils';
import { TimeZoneNote } from '@/components/ui/date-time';
import { ScrollRail } from '@/components/ui/scroll-rail';
import { tabsListVariants, tabsTriggerVariants } from '@/components/ui/tabs';
import { useStuck } from '@/components/statistics/useStuck';

/** One destination of the profile's contents: a section's anchor id and its short name. */
export interface ProfileSectionLink {
  id: string;
  label: string;
}

/**
 * The profile header's classes when the section rail follows it: the rail's
 * own rule takes the place of the header's bottom rule and margin, as the
 * statistics pages' tabs do.
 */
export const PROFILE_HEADER_WITH_NAV_CLASS = 'mb-0 border-b-0 pb-6 sm:mb-0 sm:pb-8';

/** The rail's outer spacing, shared with its placeholder so the two keep one height. */
const NAV_SPACING_CLASS = 'mb-10 sm:mb-12';

/** The underline trigger's current state, for an in-page link (`aria-current="location"`). */
const CURRENT_LOCATION_CLASS =
  'aria-[current=location]:text-foreground aria-[current=location]:shadow-[inset_0_-2px_0_0_hsl(var(--primary))]';

/**
 * The rail's shape while the profile loads, or when it has no sections: its
 * rule at its height, so nothing under the header moves when the links arrive.
 */
export function ProfileSectionNavPlaceholder() {
  return (
    <div
      aria-hidden
      className={cn(NAV_SPACING_CLASS, 'min-h-11 border-b border-rule sm:min-h-10')}
    />
  );
}

/** The section in the reading band near the top of the viewport. */
function useCurrentSection(ids: readonly string[]): [string | null, (id: string) => void] {
  const [current, setCurrent] = useState<string | null>(null);
  const key = ids.join('|');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const targets = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const inBand = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (inBand) setCurrent(inBand.target.id);
      },
      // A band a quarter of the way down: the section being read, under the sticky bars.
      { rootMargin: '-25% 0px -65% 0px' },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [key]);

  return [current, setCurrent];
}

/**
 * The profile's contents: underline links to each section it shows, set on
 * the header's bottom rule and stuck under the site header, with the time
 * zone of every date on the page stated once at its end (the ledgers then
 * leave out their own note, see `TimeZoneStated`). The section being read is
 * marked `aria-current="location"`; a link scrolls to its section, moves
 * focus to its heading and puts its anchor in the address bar. On a phone
 * the row scrolls sideways with edge fades and keeps the current link in
 * view beside the time zone.
 */
export function ProfileSectionNav({
  label,
  sections,
}: {
  /** The nav's accessible name. */
  label: string;
  sections: readonly ProfileSectionLink[];
}) {
  const { sentinelRef, stickyRef, stuck } = useStuck<HTMLElement>();
  // Focus moved into a section stops below the bar, not under it.
  useStickyClearance(stickyRef);
  const [current, setCurrent] = useCurrentSection(sections.map((section) => section.id));

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-0" />
      <nav
        ref={stickyRef}
        aria-label={label}
        data-stuck={stuck || undefined}
        className={cn(
          'sticky top-[var(--header-height)] z-30',
          NAV_SPACING_CLASS,
          // The glass band spans the viewport, behind the container-wide row.
          'before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:border-b before:border-rule before:opacity-0 before:glass before:transition-opacity before:duration-base',
          'data-[stuck]:before:opacity-100',
        )}
      >
        <div className="flex items-end">
          <ScrollRail activeSelector='[aria-current="location"]' className="min-w-0 flex-1">
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
                    aria-current={current === section.id ? 'location' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrent(section.id);
                      jumpToSection(section.id);
                    }}
                    className={cn(
                      tabsTriggerVariants({ variant: 'underline', scroll: true }),
                      CURRENT_LOCATION_CLASS,
                      'focus-ring-inset no-underline',
                    )}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </ScrollRail>
          {/* On the row's rule too, so the rule runs under the zone as under the links. */}
          <p className="shrink-0 border-b border-rule pb-3 ps-4 type-caption text-subtle sm:ps-6">
            <TimeZoneNote />
          </p>
        </div>
      </nav>
    </>
  );
}

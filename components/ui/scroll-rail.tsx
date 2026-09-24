'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

/** What counts as the current item, on tabs, links and options alike. */
const ACTIVE_SELECTOR = '[data-state="active"], [aria-current="page"], [aria-selected="true"]';

/** Width of each edge fade. */
const FADE = '1.75rem';

/** Anything a keyboard can reach inside the track. */
const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

export interface ScrollRailProps extends React.HTMLAttributes<HTMLDivElement> {
  /** CSS selector for the item to keep in view. */
  activeSelector?: string;
  /** Classes for the scrolling track (gap, padding); `className` styles the outer frame. */
  trackClassName?: string;
  /**
   * Names the track while it scrolls with nothing focusable inside (a timeline
   * of steps): it then becomes a focusable region, so a keyboard can scroll it.
   */
  label?: string;
}

/**
 * ScrollRail — a single row that scrolls sideways when its items do not fit
 * (tabs, sub-navigation, filter chips), instead of wrapping into a second
 * row or pushing the page wider.
 *
 * Each edge fades out only while there is more to scroll that way, so a row
 * that fits shows no fade and a clipped row says it continues. The current
 * item (`data-state="active"`, `aria-current="page"` or `aria-selected`) is
 * scrolled into view on mount and whenever it changes, without moving the
 * page. The scrollbar is hidden; the row still scrolls by touch, trackpad,
 * shift-wheel and by moving focus through it.
 */
export const ScrollRail = React.forwardRef<HTMLDivElement, ScrollRailProps>(
  (
    { activeSelector = ACTIVE_SELECTOR, className, trackClassName, label, children, ...props },
    ref,
  ) => {
    const trackRef = React.useRef<HTMLDivElement | null>(null);
    React.useImperativeHandle(ref, () => trackRef.current as HTMLDivElement, []);
    const [edges, setEdges] = React.useState({ start: false, end: false });
    // A track that scrolls must be reachable by keyboard (WCAG 2.1.1): through
    // its own items, or, when it holds none, by taking focus itself.
    const [focusableTrack, setFocusableTrack] = React.useState(false);

    const measure = React.useCallback(() => {
      const track = trackRef.current;
      if (!track) return;
      const max = track.scrollWidth - track.clientWidth;
      // Logical start: scrollLeft is negative in right-to-left layouts.
      const offset = Math.abs(track.scrollLeft);
      const next = { start: offset > 1, end: max - offset > 1 };
      setEdges((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
      setFocusableTrack(max > 1 && !track.querySelector(FOCUSABLE_SELECTOR));
    }, []);

    const revealActive = React.useCallback(
      (behavior: ScrollBehavior) => {
        const track = trackRef.current;
        const active = track?.querySelector<HTMLElement>(activeSelector);
        // jsdom and very old engines have no element scrolling API.
        if (!track || !active || typeof track.scrollBy !== 'function') return;
        const trackBox = track.getBoundingClientRect();
        const box = active.getBoundingClientRect();
        // Keep a fade's width of room beside the item (1.75rem).
        const inset = (parseFloat(getComputedStyle(track).fontSize) || 16) * 1.75;
        if (box.left < trackBox.left + inset) {
          track.scrollBy({ left: box.left - trackBox.left - inset, behavior });
        } else if (box.right > trackBox.right - inset) {
          track.scrollBy({ left: box.right - trackBox.right + inset, behavior });
        }
      },
      [activeSelector],
    );

    React.useEffect(() => {
      const track = trackRef.current;
      if (!track) return;
      // After layout, so widths are real.
      const frame = requestAnimationFrame(() => {
        revealActive('instant');
        measure();
      });

      const onScroll = () => measure();
      track.addEventListener('scroll', onScroll, { passive: true });
      const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
      resize?.observe(track);
      // The content can outgrow a track that keeps its size (a web font
      // arriving, a label changing), which moves the overflow too.
      for (const child of Array.from(track.children)) resize?.observe(child);

      // Follow the current item when it changes (a tab selected, a route
      // pushed): Radix and the router only flip attributes.
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const mutations =
        typeof MutationObserver === 'undefined'
          ? null
          : new MutationObserver(() => revealActive(reduceMotion ? 'instant' : 'smooth'));
      mutations?.observe(track, {
        subtree: true,
        attributes: true,
        attributeFilter: ['data-state', 'aria-current', 'aria-selected'],
      });

      return () => {
        cancelAnimationFrame(frame);
        track.removeEventListener('scroll', onScroll);
        resize?.disconnect();
        mutations?.disconnect();
      };
    }, [measure, revealActive]);

    const mask = `linear-gradient(to right, transparent 0, #000 ${edges.start ? FADE : '0px'}, #000 calc(100% - ${edges.end ? FADE : '0px'}), transparent 100%)`;

    return (
      <div className={cn('relative min-w-0', className)} {...props}>
        <div
          ref={trackRef}
          data-overflow-start={edges.start || undefined}
          data-overflow-end={edges.end || undefined}
          tabIndex={focusableTrack ? 0 : undefined}
          role={focusableTrack && label ? 'region' : undefined}
          aria-label={focusableTrack ? label : undefined}
          className={cn(
            'flex min-w-0 overflow-x-auto overscroll-x-contain scroll-smooth scrollbar-none motion-reduce:scroll-auto',
            // The track clips anything outside it (and its mask hides what
            // lies past its box), so focus rings draw inside their item, and
            // inside the track when the track itself takes focus.
            '[&_:focus-visible]:outline-offset-[-2px] focus-visible:outline-offset-[-2px]',
            trackClassName,
          )}
          style={{ maskImage: mask, WebkitMaskImage: mask }}
        >
          {children}
        </div>
      </div>
    );
  },
);
ScrollRail.displayName = 'ScrollRail';

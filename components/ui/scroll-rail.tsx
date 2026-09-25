'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

/** What counts as the current item, on tabs, links and options alike. */
const ACTIVE_SELECTOR = '[data-state="active"], [aria-current="page"], [aria-selected="true"]';

/**
 * Width of the end fade: wide enough that the item it cuts reads as fading
 * out, not as a clipped word, which is the cue that the row continues.
 */
const FADE_REM = 2.5;
const FADE = `${FADE_REM}rem`;

/**
 * The narrowest start fade, so an item scrolling out never ends on a hard
 * edge; it covers no more than an item's own padding at rest.
 */
const MIN_START_FADE_PX = 8;

/** Anything a keyboard can reach inside the track. */
const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

/**
 * Room after the row (px), made only when resting on whole items needs the
 * track to scroll further than the row reaches: the second-last tab of a
 * short row would otherwise stop at the end with a fragment at the start.
 */
const END_ROOM = '--rail-end-room';

/**
 * At the row's own end an item cut at the start may stay when no more than
 * this share of it is hidden: its first letters fade in, the word still reads
 * whole and says the row continues. More hidden than that is a fragment.
 */
const MOSTLY_IN_VIEW = 0.25;

/**
 * The row's items: the children of the one row the track scrolls (a tab list),
 * or the track's own children when they sit in it directly (filter chips).
 */
function railItems(track: HTMLElement): HTMLElement[] {
  const children = Array.from(track.children) as HTMLElement[];
  const [row] = children;
  return children.length === 1 && row ? (Array.from(row.children) as HTMLElement[]) : children;
}

/**
 * Where a scrolled row comes to rest: its first whole item starts one row gap
 * in from the track's start, so the item before it ends exactly on the edge
 * and no fragment of it shows ("ource code", "tion"). Measured between the
 * first two items, since rows space their items with a gap, a margin or none.
 */
function restInsetOf(items: readonly HTMLElement[], max: number): number {
  const [first, second] = items;
  if (!first || !second) return 0;
  const gap = second.getBoundingClientRect().left - first.getBoundingClientRect().right;
  return Math.min(Math.max(gap, 0), max);
}

/** The track's scroll padding: items snap to the rest inset; focus keeps a fade's room at the end. */
function scrollPaddingOf(inset: number): string {
  return `${inset}px ${FADE}`;
}

/** A box's horizontal extent. */
export interface RailSpan {
  left: number;
  right: number;
}

/**
 * How far to scroll a rail so its current item shows whole and the row rests
 * on whole items, or `null` to leave it. Every span is in one coordinate
 * space, measured before scrolling; `reach` is how far the row itself lets the
 * track scroll on (past it, the rail makes room after the row), and `atEnd`
 * says the track can scroll no further now, so it draws no end fade.
 *
 * - An item hidden to the start comes in with the item before it, whole, one
 *   rest inset from the edge.
 * - An item under the end fade, or a row resting on a fragment (the browser
 *   scrolled a focused tab in), moves to the nearest place where the current
 *   item shows whole and clear of the fade: an item start at the rest inset,
 *   so the item before it leaves view entirely, or the row's own end (which
 *   has no fade) when the item it cuts at the start stays mostly in view.
 */
export function restScroll({
  track,
  items,
  index,
  inset,
  fade,
  reach,
  atEnd,
}: {
  track: RailSpan;
  items: readonly RailSpan[];
  index: number;
  inset: number;
  fade: number;
  reach: number;
  atEnd: boolean;
}): number | null {
  const active = items[index];
  if (!active) return null;
  const restOn = (item: RailSpan) => item.left - track.left - inset;
  if (active.left < track.left + inset - 0.5) return restOn(items[index - 1] ?? active);
  // An item the edge cuts with most of it out of view: a fragment.
  const fragmentAt = (edge: number) =>
    items.some(
      (item) =>
        item.left < edge &&
        item.right > edge &&
        edge - item.left > (item.right - item.left) * MOSTLY_IN_VIEW,
    );
  const underFade = active.right > track.right - (atEnd ? 0 : fade) + 0.5;
  if (!underFade && !fragmentAt(track.left)) return null;
  // Whole and clear of the end fade; at the row's end there is no fade.
  const clear = (delta: number) =>
    active.right - delta <= track.right - (delta >= reach - 1 ? 0 : fade) + 0.5;
  const candidates = items.slice(0, index + 1).map(restOn);
  if (!fragmentAt(track.left + reach)) candidates.push(reach);
  const valid = candidates.filter(clear);
  if (valid.length === 0) return underFade ? restOn(active) : null;
  return valid.reduce((best, delta) => (Math.abs(delta) < Math.abs(best) ? delta : best));
}

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
 * that fits shows no fade and a clipped row says it continues. A scrolled row
 * rests on whole items: the current item (`data-state="active"`,
 * `aria-current="page"` or `aria-selected`) is scrolled into view, without
 * moving the page, on mount, again when a web font or a new width moves the
 * items (until the reader scrolls the row) and whenever it changes; the row
 * then starts on an item one row gap from the edge, and a flick settles the
 * same way. The scrollbar is hidden; the row still scrolls by touch,
 * trackpad, shift-wheel and by moving focus through it.
 */
export const ScrollRail = React.forwardRef<HTMLDivElement, ScrollRailProps>(
  (
    { activeSelector = ACTIVE_SELECTOR, className, trackClassName, label, children, ...props },
    ref,
  ) => {
    const trackRef = React.useRef<HTMLDivElement | null>(null);
    React.useImperativeHandle(ref, () => trackRef.current as HTMLDivElement, []);
    const [edges, setEdges] = React.useState({ start: false, end: false });
    // Where the row rests (px): one row gap in from the start edge.
    const [restInset, setRestInset] = React.useState(0);
    // A track that scrolls must be reachable by keyboard (WCAG 2.1.1): through
    // its own items, or, when it holds none, by taking focus itself.
    const [focusableTrack, setFocusableTrack] = React.useState(false);

    const fadePx = React.useCallback(
      (track: HTMLElement) => (parseFloat(getComputedStyle(track).fontSize) || 16) * FADE_REM,
      [],
    );

    const measure = React.useCallback(() => {
      const track = trackRef.current;
      if (!track) return;
      const max = track.scrollWidth - track.clientWidth;
      // Logical start: scrollLeft is negative in right-to-left layouts.
      const offset = Math.abs(track.scrollLeft);
      const next = { start: offset > 1, end: max - offset > 1 };
      setEdges((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
      setRestInset(Math.round(restInsetOf(railItems(track), fadePx(track))));
      setFocusableTrack(max > 1 && !track.querySelector(FOCUSABLE_SELECTOR));
    }, [fadePx]);

    const revealActive = React.useCallback(
      (behavior: ScrollBehavior, { fresh = false }: { fresh?: boolean } = {}) => {
        const track = trackRef.current;
        const active = track?.querySelector<HTMLElement>(activeSelector);
        // jsdom and very old engines have no element scrolling API.
        if (!track || !active || typeof track.scrollTo !== 'function') return;
        if (fresh) {
          // Measure the row as laid out now, from its start, without old room.
          track.style.setProperty(END_ROOM, '0px');
          track.removeAttribute('data-end-room');
          // Instant: the track's own scroll-behavior would glide there.
          track.scrollTo({ left: 0, behavior: 'instant' });
        }
        const fade = fadePx(track);
        const rowItems = railItems(track);
        const found = rowItems.findIndex((item) => item.contains(active));
        // An item the row does not hold directly: the item alone.
        const items = found < 0 ? [active] : rowItems;
        const inset = Math.round(restInsetOf(items, fade));
        // Snap to the rest inset before scrolling (the render that follows
        // writes the same value): padding that changed after the scroll would
        // re-snap the row onto another item.
        track.style.scrollPaddingInline = scrollPaddingOf(inset);
        const room = parseFloat(track.style.getPropertyValue(END_ROOM)) || 0;
        const offset = Math.abs(track.scrollLeft);
        const left = track.scrollWidth - track.clientWidth - offset;
        // How far the row itself lets the track scroll on from here.
        const reach = left - room;
        const delta = restScroll({
          track: track.getBoundingClientRect(),
          items: items.map((item) => item.getBoundingClientRect()),
          index: Math.max(found, 0),
          inset,
          fade,
          reach,
          atEnd: left <= 1,
        });
        if (delta === null) return;
        // Never past the row's start.
        const target = Math.max(0, offset + delta);
        // A sub-pixel nudge would read as a directed scroll and snap a whole item away.
        if (Math.abs(target - offset) < 1) return;
        // Room after the row, when the rest lies past its end, with an
        // underline row's hairline running on under it.
        const need = Math.max(0, Math.ceil(target - offset - reach));
        track.style.setProperty(END_ROOM, `${need}px`);
        track.toggleAttribute('data-end-room', need > 0);
        const row = track.firstElementChild;
        const ruled = row ? parseFloat(getComputedStyle(row).borderBottomWidth) > 0 : false;
        track.toggleAttribute('data-end-rule', ruled);
        // To a place, not by an amount: snapping then keeps that rest.
        track.scrollTo({ left: target, behavior });
      },
      [activeSelector, fadePx],
    );

    React.useEffect(() => {
      const track = trackRef.current;
      if (!track) return;
      // After layout, so widths are real.
      const frame = requestAnimationFrame(() => {
        revealActive('instant');
        measure();
      });
      // A web font arriving (a locale's companion face can come late) or a
      // new width changes where the items fall, which leaves a row revealed
      // earlier resting mid-item; rest it again from its start, unless the
      // reader has taken the row in hand since.
      let handled = false;
      const takeHold = () => {
        handled = true;
      };
      const holdEvents = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;
      for (const type of holdEvents) track.addEventListener(type, takeHold, { passive: true });
      const onResize = () => {
        if (!handled) revealActive('instant', { fresh: true });
        measure();
      };

      const onScroll = () => measure();
      track.addEventListener('scroll', onScroll, { passive: true });
      const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize);
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
        for (const type of holdEvents) track.removeEventListener(type, takeHold);
        track.removeEventListener('scroll', onScroll);
        resize?.disconnect();
        mutations?.disconnect();
      };
    }, [measure, revealActive]);

    // The start fade covers the rest inset, so at rest it lies over the gap
    // alone and the first item shows whole; the end fade cuts an item.
    const startFade = edges.start ? `${Math.max(restInset, MIN_START_FADE_PX)}px` : '0px';
    const mask = `linear-gradient(to right, transparent 0, #000 ${startFade}, #000 calc(100% - ${edges.end ? FADE : '0px'}), transparent 100%)`;

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
            // The row inside never shrinks to the rail: its own box (an
            // underline row's hairline, a segmented track's fill) spans all
            // of its items, not just the first screenful.
            '[&>*]:shrink-0',
            // The end room, when resting on whole items needs it, with the
            // row's hairline under it when the row has one.
            // (Only then: a track's own gap would space an empty one too.)
            "data-[end-room]:after:block data-[end-room]:after:w-(--rail-end-room) data-[end-room]:after:shrink-0 data-[end-room]:after:content-['']",
            'data-[end-rule]:after:border-b data-[end-rule]:after:border-rule',
            // A flick settles on an item's start, at the rest inset, or on
            // the row's own end (the last item's end, clamped to it).
            'snap-x snap-proximity [&>*>*]:snap-start [&>*>*:last-child]:snap-end',
            // The track clips anything outside it (and its mask hides what
            // lies past its box), so focus rings draw inside their item, and
            // inside the track when the track itself takes focus.
            '[&_:focus-visible]:outline-offset-[-2px] focus-visible:outline-offset-[-2px]',
            trackClassName,
          )}
          style={{
            maskImage: mask,
            WebkitMaskImage: mask,
            scrollPaddingInline: scrollPaddingOf(restInset),
          }}
        >
          {children}
        </div>
      </div>
    );
  },
);
ScrollRail.displayName = 'ScrollRail';

/**
 * The one chart theme for the statistics pages (docs/design-system.md →
 * Charts): every Recharts axis, grid and tooltip on those pages takes its
 * props from here, so ticks, gridlines and series read the same on every
 * chart and follow the palette through tokens instead of hard-coded colours.
 *
 * - Ticks: 12px (the caption floor) in `--subtle-foreground`, no tick marks.
 * - Axis lines: the `--rule` hairline under the plot; no vertical axis line.
 * - Grid: horizontal `--rule-faint` hairlines only.
 * - Series: named data, track and method tokens, never red (styles/themes.css).
 */

/**
 * The neutral series ink: `--data-8`'s grey drawn a quarter of the way to
 * the palette's accent. The bare grey is one cool slate in every palette,
 * which reads as disabled beside Midnight's lavender and clashes with
 * Ember's warm and Aurora's teal ground; the mix keeps its lightness (and
 * contrast) and takes the palette's hue, still no gesture method's hue.
 */
const PALETTE_NEUTRAL = 'color-mix(in oklab, hsl(var(--data-8)) 75%, hsl(var(--primary)))';

/**
 * Series colours for SVG `fill`/`stroke` and inline styles, by meaning. A
 * hue keeps one meaning per page: the activity page draws the gesture
 * methods (`GESTURE_METHOD_COLOR`: ETH violet, ETH with a Random Walk NFT
 * sky, CST gold) beside its counts and its lead timeline, so neither of those
 * uses a method's hue.
 */
export const SERIES_COLOR = {
  /** Gestures counted over time, every method together: the palette's neutral, never a method's hue. */
  gestures: PALETTE_NEUTRAL,
  /** CST total supply. */
  supply: 'hsl(var(--data-1))',
  /** An ordinary lead stint on the Endurance timeline. */
  lead: PALETTE_NEUTRAL,
  /**
   * The Endurance Champion's stint and record. Not `--track-endurance`: that
   * track shares its gold with the CST method, which the charts around the
   * lead timeline draw, so the champion takes the one series hue no gesture
   * method and no other timeline series uses.
   */
  endurance: 'hsl(var(--data-5))',
  /** The Chrono-Warrior's lane and record. */
  chrono: 'hsl(var(--track-chrono))',
  /** A reference series drawn behind the data (the allocation clock). */
  reference: 'hsl(var(--subtle-foreground))',
  /** The CST Calibration Window line: the measure itself, in ink. */
  measure: 'hsl(var(--foreground))',
} as const;

export type SeriesKey = keyof typeof SERIES_COLOR;

/** Tick text: the caption size in the subtle tier. */
export const AXIS_TICK = { fill: 'hsl(var(--subtle-foreground))', fontSize: 12 } as const;

/** Shared XAxis props: a hairline under the plot, no tick marks. */
export const X_AXIS_PROPS = {
  tick: AXIS_TICK,
  tickLine: false,
  axisLine: { stroke: 'hsl(var(--rule))' },
  tickMargin: 8,
} as const;

/** Shared YAxis props: no axis line, no tick marks; the grid carries the values. */
export const Y_AXIS_PROPS = {
  tick: AXIS_TICK,
  tickLine: false,
  axisLine: false,
  tickMargin: 6,
} as const;

/** Shared CartesianGrid props: horizontal hairlines only. */
export const GRID_PROPS = {
  stroke: 'var(--rule-faint)',
  vertical: false,
} as const;

/** Room around the plot; the axes' own widths hold their labels. */
export const CHART_MARGIN = { top: 8, right: 8, bottom: 0, left: 0 } as const;

/** Shared Tooltip props: no animation, inside the plot, never catching the pointer. */
export const TOOLTIP_PROPS = {
  isAnimationActive: false,
  allowEscapeViewBox: { x: false, y: false },
  wrapperStyle: { pointerEvents: 'none', zIndex: 10 },
  cursor: { fill: 'hsl(var(--foreground) / 0.06)', stroke: 'hsl(var(--rule))' },
} as const;

/** Above this many points a line draws no dots at rest, only the hovered one. */
export const DOTS_MAX_POINTS = 40;

/**
 * The widest a bar draws, in px: a few buckets would otherwise fill the plot
 * with 330px slabs that read as a different kind of chart.
 */
export const MAX_BAR_SIZE = 24;

/**
 * Below this many points a chart shows its summary and its table first: one
 * dot at the edge of a full plot reads as a broken chart, not as early data.
 */
export const MIN_PLOT_POINTS = 3;

/**
 * Past this many points, or on a phone, a scatter of gestures drops its
 * joining line and draws small, lighter dots, so a dense run stays a cloud
 * of points instead of merging into a solid band.
 */
export const DENSE_POINTS = 200;

/**
 * A focusable mark on a timeline lane (a lead stint, an active period). The
 * mark sits at `--mark-at` (a percentage of its lane, set inline) and never
 * narrower than `--mark-min` (set per chart with `[--mark-min:2px]`), held
 * inside the lane at its right end. The lane must not clip (no
 * `overflow-hidden`): keyboard focus draws the shared ring outside the mark,
 * lifts it over its neighbours and widens a sliver to 6px, so the ring
 * reads as a ring rather than a line (WCAG 2.4.7). A transparent pad,
 * 24px wide and a little taller than the mark, takes the pointer and the
 * finger, so a 2px sliver is still a target (WCAG 2.5.8). Pair it with
 * `TIMELINE_LANE_FOCUS_CLASS` on the lane's row.
 */
export const TIMELINE_MARK_CLASS =
  "absolute left-[min(var(--mark-at),calc(100%-var(--mark-min)))] min-w-[var(--mark-min)] cursor-pointer before:absolute before:-inset-y-1 before:left-1/2 before:w-6 before:-translate-x-1/2 before:content-[''] focus-visible:z-10 focus-visible:opacity-100 focus-visible:outline-solid focus-visible:[--mark-min:0.375rem]";

/** The row of a timeline lane: tinted while one of its marks has keyboard focus. */
export const TIMELINE_LANE_FOCUS_CLASS = 'has-[[role=img]:focus-visible]:bg-surface';

/** Inline position of a timeline mark: its start and width as fractions of the lane. */
export function timelineMarkStyle(start: number, width: number): Record<string, string> {
  const pct = (value: number) => `${Math.max(0, Math.min(100, value * 100))}%`;
  return { '--mark-at': pct(start), width: pct(width) };
}

/**
 * Classes for the element that wraps a Recharts chart: tabular figures in the
 * SVG text, and the chart's keyboard focus drawn inside its own box.
 */
export const CHART_SURFACE_CLASS =
  '[&_.recharts-text]:tabular-nums [&_.recharts-wrapper:focus-visible]:outline-offset-[-2px]';

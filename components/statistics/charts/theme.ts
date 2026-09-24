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

/** Series colours for SVG `fill`/`stroke` and inline styles, by meaning. */
export const SERIES_COLOR = {
  /** Gestures counted over time. */
  gestures: 'hsl(var(--data-1))',
  /** Distinct participants over time. */
  participants: 'hsl(var(--data-2))',
  /** CST total supply. */
  supply: 'hsl(var(--data-1))',
  /** An ordinary lead stint on the Endurance timeline. */
  lead: 'hsl(var(--data-8))',
  /** The Endurance Champion's stint and record. */
  endurance: 'hsl(var(--track-endurance))',
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
 * Classes for the element that wraps a Recharts chart: tabular figures in the
 * SVG text, and the chart's keyboard focus drawn inside its own box.
 */
export const CHART_SURFACE_CLASS =
  '[&_.recharts-text]:tabular-nums [&_.recharts-wrapper:focus-visible]:outline-offset-[-2px]';

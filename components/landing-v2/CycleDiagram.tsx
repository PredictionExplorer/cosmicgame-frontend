import type { LandingEthTrack } from '@/content/landing';

import { cn } from '@/lib/utils';

import styles from './Landing.module.css';

/*
 * The drawing's coordinates. Its three zones are the thirds of the width,
 * under which The Cycle's three step captions sit: gestures (0–400), the
 * clock they extend (400–800), and finalization fanning into the tracks
 * (800–1200).
 */
const WIDTH = 1200;
const HEIGHT = 220;
const AXIS_Y = 176;
/** When each gesture lands: irregular, as people take part. */
const GESTURES = [24, 80, 132, 198, 244, 310, 372] as const;
/** The finalization time before the first gesture's extension, and each gesture's step. */
const FIRST_DEADLINE = 440;
const EXTENSION = 50;
/** The stacked bar the reserve fans into, at the drawing's right edge. */
const BAR_X = 1104;
const BAR_WIDTH = 24;
const BAR_TOP = 24;
const BAR_BOTTOM = 208;
const BAR_GAP = 2;

interface Segment {
  id: LandingEthTrack['id'];
  top: number;
  height: number;
}

/** The ETH split as a vertical stack, drawn to scale against 100%. */
function stackSegments(tracks: readonly LandingEthTrack[]): Segment[] {
  const total = tracks.reduce((sum, track) => sum + track.share, 0) || 1;
  const drawable = BAR_BOTTOM - BAR_TOP - BAR_GAP * Math.max(0, tracks.length - 1);
  let top = BAR_TOP;
  return tracks.map((track) => {
    const height = (track.share / total) * drawable;
    const segment = { id: track.id, top, height };
    top += height + BAR_GAP;
    return segment;
  });
}

/**
 * How a cycle runs, drawn: gestures land along the cycle's time line, each
 * pushes the finalization time one extension further (the arcs, the latest
 * in the accent), the line ends where the clock reaches zero, and the cycle
 * finalizes into the allocation tracks, in the colours and shares of the bar
 * below. Decorative: the step captions under it say the same in words.
 * Strokes keep their width at every size.
 */
export function CycleDiagram({
  tracks,
  className,
}: {
  /** The ETH tracks with their shares (`getLandingContent(locale).tracks.eth`). */
  tracks: readonly LandingEthTrack[];
  className?: string;
}) {
  const deadlines = GESTURES.map((_, index) => FIRST_DEADLINE + index * EXTENSION);
  const finalAt = deadlines[deadlines.length - 1]!;
  const segments = stackSegments(tracks);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn(styles.cycleDiagram, className)}
      aria-hidden="true"
      focusable="false"
      data-testid="cycle-diagram"
    >
      {/* The cycle's time line, from the opening to the moment the clock reaches zero. */}
      <line x1="0" y1={AXIS_Y} x2={finalAt} y2={AXIS_Y} className={styles.cycleAxis} />

      {/* Each gesture pushes the finalization time one extension further. */}
      {GESTURES.map((x, index) => {
        const deadline = deadlines[index]!;
        const rise = 36 + index * 18;
        const latest = index === GESTURES.length - 1;
        return (
          <path
            key={`arc-${x}`}
            d={`M ${x} ${AXIS_Y} Q ${(x + deadline) / 2} ${AXIS_Y - 2 * rise} ${deadline} ${AXIS_Y}`}
            className={latest ? styles.cycleArcLatest : styles.cycleArc}
          />
        );
      })}

      {/* Finalization times a later gesture has already moved past. */}
      {deadlines.slice(0, -1).map((x) => (
        <line
          key={`deadline-${x}`}
          x1={x}
          y1={AXIS_Y}
          x2={x}
          y2={AXIS_Y + 10}
          className={styles.cycleTick}
        />
      ))}

      {GESTURES.map((x) => (
        <line
          key={`gesture-${x}`}
          x1={x}
          y1={AXIS_Y - 10}
          x2={x}
          y2={AXIS_Y + 10}
          className={styles.cycleGesture}
        />
      ))}

      {/* Finalization fans the reserve into the tracks. */}
      {segments.map((segment) => {
        const y = segment.top + segment.height / 2;
        return (
          <path
            key={`fan-${segment.id}`}
            d={`M ${finalAt} ${AXIS_Y} C ${finalAt + 170} ${AXIS_Y} ${BAR_X - 170} ${y} ${BAR_X} ${y}`}
            className={cn(styles.cycleFan, styles[`track-${segment.id}`])}
          />
        );
      })}
      {segments.map((segment) => (
        <rect
          key={`segment-${segment.id}`}
          x={BAR_X}
          y={segment.top}
          width={BAR_WIDTH}
          height={Math.max(segment.height, 1)}
          rx="2"
          // Every track solid in its own colour, the compounding remainder
          // included, as on the bar below and on every app page (a hatched
          // fill is the Stellar Selection NFT track's, never the remainder's).
          className={cn(styles.cycleSegment, styles[`track-${segment.id}`])}
        />
      ))}

      <circle cx={finalAt} cy={AXIS_Y} r="7" className={styles.cycleFinal} />
    </svg>
  );
}

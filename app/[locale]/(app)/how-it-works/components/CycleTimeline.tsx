import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';
import { protocolFacts } from '@/content/protocol-facts';

import {
  ALLOCATION_TRACK_COLORS,
  ALLOCATION_TRACK_IDS,
  type AllocationTrackId,
} from '@/config/allocationTracks';
import { Link } from '@/i18n/navigation';
import { GESTURE_METHOD_BG_CLASS, type GestureMethod } from '@/lib/theme/dataColors';
import { cn } from '@/lib/utils';
import { ArtFrame } from '@/components/ui/art-frame';
import { SectionHeader } from '@/components/ui/section-header';
import { SignatureWallLabel } from '@/components/ui/signature-label';
import { signatureMedia, signatureSources } from '@/components/nft/signatureMedia';
import { formatPercent } from '@/utils/format';
import { formatId } from '@/utils/format/ids';

/**
 * One arrangement of the drawing, in its own coordinate space. The numbered
 * stages are HTML placed in the same space, so they stay legible at every
 * width.
 */
interface DrawingLayout {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly trackY: number;
  /** The opening gesture. */
  readonly openX: number;
  /** The zero point: the Cycle Finalization Time. */
  readonly zeroX: number;
  /** The end of the Final Gesture participant's exclusive window. */
  readonly windowEndX: number;
  /** The allocation bar. */
  readonly splitStartX: number;
  readonly splitEndX: number;
  /** Gestures on the clock: where they land and how they were paid. */
  readonly gestures: ReadonlyArray<{ x: number; method: GestureMethod }>;
  /** Where the finalization time stood before the last gestures pushed it right. */
  readonly earlierEnds: readonly number[];
  /** The six stages, numbered where they happen. */
  readonly stages: ReadonlyArray<{ x: number; y: number }>;
}

/** Tablets and wider: the full clock with seven gestures. */
const WIDE: DrawingLayout = {
  id: 'wide',
  width: 960,
  height: 210,
  trackY: 96,
  openX: 40,
  zeroX: 620,
  windowEndX: 736,
  splitStartX: 772,
  splitEndX: 936,
  gestures: [
    { x: 104, method: 'eth' },
    { x: 158, method: 'eth' },
    { x: 196, method: 'cst' },
    { x: 262, method: 'ethRandomWalk' },
    { x: 318, method: 'cst' },
    { x: 356, method: 'eth' },
    { x: 418, method: 'cst' },
  ],
  earlierEnds: [482, 528, 574],
  stages: [
    { x: 40, y: 44 },
    { x: 262, y: 44 },
    { x: 620, y: 44 },
    { x: 686, y: 44 },
    { x: 812, y: 44 },
    { x: 470, y: 186 },
  ],
};

/** Phones: half the width and fewer gestures, so each mark stays readable. */
const COMPACT: DrawingLayout = {
  id: 'compact',
  width: 480,
  height: 210,
  trackY: 90,
  openX: 16,
  zeroX: 290,
  windowEndX: 348,
  splitStartX: 368,
  splitEndX: 470,
  gestures: [
    { x: 62, method: 'eth' },
    { x: 104, method: 'cst' },
    { x: 146, method: 'ethRandomWalk' },
    { x: 190, method: 'cst' },
  ],
  earlierEnds: [230, 260],
  stages: [
    { x: 16, y: 38 },
    { x: 146, y: 38 },
    { x: 290, y: 38 },
    { x: 319, y: 138 },
    { x: 419, y: 38 },
    { x: 222, y: 190 },
  ],
};

/** Each track's share of the reserve, from protocol-facts, in the order every chart uses. */
const SHARES: Readonly<Record<AllocationTrackId, number>> = {
  signature: protocolFacts.mainEthPercentage,
  chrono: protocolFacts.chronoWarriorEthPercentage,
  stellar: protocolFacts.stellarSelectionEthPercentage,
  anchor: protocolFacts.anchorDistributionPercentage,
  publicGoods: protocolFacts.publicGoodsPercentage,
  nextCycle: protocolFacts.compoundingReservePercentage,
};

const TRACK_FILL: Readonly<Record<AllocationTrackId, string>> = {
  signature: 'fill-track-signature',
  chrono: 'fill-track-chrono',
  stellar: 'fill-track-stellar-eth',
  anchor: 'fill-track-anchoring',
  publicGoods: 'fill-track-public-goods',
  nextCycle: 'fill-track-compounding',
};

const METHOD_FILL: Readonly<Record<GestureMethod, string>> = {
  eth: 'fill-method-eth',
  ethRandomWalk: 'fill-method-eth-rwlk',
  cst: 'fill-method-cst',
};

/** The legend: the payment methods, named by their tickers in every locale. */
const METHOD_LEGEND: ReadonlyArray<{ method: GestureMethod; label: string }> = [
  { method: 'eth', label: 'ETH' },
  { method: 'ethRandomWalk', label: 'ETH + RWLK' },
  { method: 'cst', label: 'CST' },
];

/** The Final Gesture participant's exclusive window, drawn hatched (one pattern per drawing). */
function WindowPattern({ id }: { id: string }) {
  return (
    <pattern
      id={id}
      width="8"
      height="8"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <rect width="8" height="8" className="fill-primary/15" />
      <line x1="0" y1="0" x2="0" y2="8" strokeWidth="3" className="stroke-primary/60" />
    </pattern>
  );
}

/** The reserve split as segments of the allocation bar (x and width in drawing units). */
function splitSegments(layout: DrawingLayout) {
  const total = ALLOCATION_TRACK_IDS.reduce((sum, id) => sum + SHARES[id], 0);
  const span = layout.splitEndX - layout.splitStartX;
  let x = layout.splitStartX;
  return ALLOCATION_TRACK_IDS.map((id) => {
    const width = (SHARES[id] / total) * span;
    const segment = { id, x, width };
    x += width;
    return segment;
  });
}

function StageNumber({
  n,
  className,
  style,
}: {
  n: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        'flex size-6 items-center justify-center rounded-pill border border-rule bg-surface-raised type-caption font-medium tabular-nums text-foreground',
        className,
      )}
    >
      {n}
    </span>
  );
}

/**
 * The drawing in one layout: the clock bar from the opening gesture, the
 * gestures landing on it in their method colours, each pushing the
 * finalization marker right; the zero point and the exclusive window; the
 * reserve splitting across the allocation tracks; and the part that carries
 * over looping back to open the next cycle.
 */
function CycleDrawing({ layout, className }: { layout: DrawingLayout; className?: string }) {
  const { trackY, openX, zeroX, windowEndX, splitStartX, gestures, earlierEnds } = layout;
  const segments = splitSegments(layout);
  const carried = segments.find((segment) => segment.id === 'nextCycle');
  const loopStartX = carried ? carried.x + carried.width / 2 : layout.splitEndX;
  const lastGestureX = gestures.at(-1)?.x ?? openX;
  const arrowId = `cycle-arrow-${layout.id}`;
  const windowId = `cycle-window-${layout.id}`;
  const at = (x: number, y: number): CSSProperties => ({
    left: `${(x / layout.width) * 100}%`,
    top: `${(y / layout.height) * 100}%`,
  });

  return (
    <div className={cn('relative', className)} data-layout={layout.id}>
      <svg
        aria-hidden
        focusable="false"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="block h-auto w-full overflow-visible"
      >
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-subtle" />
          </marker>
          <WindowPattern id={windowId} />
        </defs>

        {/* The clock: from the opening gesture to the zero point. */}
        <rect
          x={openX}
          y={trackY - 6}
          width={zeroX - openX}
          height={12}
          rx={6}
          className="fill-surface-sunken stroke-rule"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x={openX}
          y={trackY - 6}
          width={lastGestureX - openX}
          height={12}
          rx={6}
          className="fill-primary/20"
        />

        {/* Earlier finalization times, each pushed right by the next gesture. */}
        {earlierEnds.map((x, index) => {
          const next = earlierEnds[index + 1] ?? zeroX;
          return (
            <g key={x}>
              <line
                x1={x}
                x2={x}
                y1={trackY - 22}
                y2={trackY + 22}
                strokeDasharray="3 4"
                className="stroke-subtle"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={`M ${x + 4} ${trackY - 30} Q ${(x + next) / 2} ${trackY - 46} ${next - 4} ${trackY - 30}`}
                fill="none"
                markerEnd={`url(#${arrowId})`}
                className="stroke-subtle"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}

        {/* The zero point: the Cycle Finalization Time. */}
        <line
          x1={zeroX}
          x2={zeroX}
          y1={trackY - 26}
          y2={trackY + 26}
          strokeWidth={2}
          className="stroke-foreground"
          vectorEffect="non-scaling-stroke"
        />

        {/* The Final Gesture participant's exclusive window. */}
        <rect
          x={zeroX + 4}
          y={trackY - 6}
          width={windowEndX - zeroX - 4}
          height={12}
          rx={2}
          fill={`url(#${windowId})`}
        />

        {/* Finalization hands the reserve to the allocation tracks. */}
        <line
          x1={windowEndX + 6}
          x2={splitStartX - 8}
          y1={trackY}
          y2={trackY}
          markerEnd={`url(#${arrowId})`}
          className="stroke-subtle"
          vectorEffect="non-scaling-stroke"
        />
        {segments.map((segment) => (
          <rect
            key={segment.id}
            data-track={segment.id}
            x={segment.x + 1}
            y={trackY - 12}
            width={Math.max(segment.width - 2, 2)}
            height={24}
            rx={2}
            className={TRACK_FILL[segment.id]}
          />
        ))}

        {/* What carries over opens the next cycle. */}
        <path
          d={`M ${loopStartX} ${trackY + 16} C ${loopStartX} ${layout.height - 8}, ${openX} ${layout.height - 8}, ${openX} ${trackY + 12}`}
          fill="none"
          strokeDasharray="4 5"
          markerEnd={`url(#${arrowId})`}
          className="stroke-subtle"
          vectorEffect="non-scaling-stroke"
        />

        {/* The opening gesture and the gestures that follow, in their method colours. */}
        <circle cx={openX} cy={trackY} r={8} className="fill-primary" />
        {gestures.map((gesture) => (
          <circle
            key={gesture.x}
            cx={gesture.x}
            cy={trackY}
            r={5}
            className={cn(METHOD_FILL[gesture.method], 'stroke-background')}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div aria-hidden className="pointer-events-none absolute inset-0">
        {layout.stages.map((mark, index) => (
          <StageNumber
            key={index}
            n={index + 1}
            style={at(mark.x, mark.y)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The drawing's key, as its caption: the gesture dots by method, the hatched
 * exclusive window, and every allocation segment with its name and share, in
 * the colours and order every chart of the split uses.
 */
function CycleLegend({
  legend,
  trackLabels,
  locale,
}: {
  legend: HowItWorksContent['gameCycle']['legend'];
  trackLabels: Readonly<Record<AllocationTrackId, string>>;
  locale: string;
}) {
  const itemsClass = 'flex flex-wrap items-center gap-x-5 gap-y-1.5';
  return (
    // Three rows, each named in the start column: the gesture methods, the
    // hatched window (its swatch stands in for a name) and the allocation tracks.
    <figcaption className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-5 gap-y-2.5 type-caption text-subtle sm:mt-3">
      <span className="type-label text-muted-foreground">{legend.gestures}</span>
      <ul className={itemsClass}>
        {METHOD_LEGEND.map((entry) => (
          <li key={entry.method} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className={cn('size-2 rounded-pill', GESTURE_METHOD_BG_CLASS[entry.method])}
            />
            {entry.label}
          </li>
        ))}
      </ul>
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 24 8"
        className="h-2 w-6 shrink-0 self-center justify-self-end"
      >
        <defs>
          <WindowPattern id="cycle-window-legend" />
        </defs>
        <rect width="24" height="8" rx="1" fill="url(#cycle-window-legend)" />
      </svg>
      <p data-legend="exclusive-window">{legend.exclusiveWindow}</p>
      <span className="type-label text-muted-foreground">{legend.allocations}</span>
      <ul className={itemsClass}>
        {ALLOCATION_TRACK_IDS.map((id) => (
          <li key={id} data-legend-track={id} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={cn('size-2 rounded-edge', ALLOCATION_TRACK_COLORS[id])} />
            {trackLabels[id]}
            <span className="tabular-nums text-muted-foreground">
              {formatPercent(SHARES[id], locale)}
            </span>
          </li>
        ))}
      </ul>
    </figcaption>
  );
}

/**
 * How it works, drawn once: the cycle's mechanism as one diagram (a compact
 * arrangement on phones) with its key, its six numbered stages captioned
 * below with the page's own copy, and the cycle's payoff, a real Signature.
 * Server-rendered and static: every rule is in the visible captions, so the
 * drawing itself is hidden from assistive technology.
 */
export function CycleTimeline({
  gameCycle,
  payoff,
  trackLabels,
  locale,
  unavailableLabel,
}: {
  gameCycle: HowItWorksContent['gameCycle'];
  payoff: HowItWorksContent['payoff'];
  /** Each allocation track's name, as /current-cycle and /contracts name it. */
  trackLabels: Readonly<Record<AllocationTrackId, string>>;
  locale: string;
  /** "Artwork unavailable", for the plate when the image cannot load. */
  unavailableLabel: string;
}) {
  const media = signatureMedia(payoff.sample.seed);

  return (
    <section aria-labelledby="cycle-timeline-heading" id="cycle">
      <SectionHeader
        headingId="cycle-timeline-heading"
        title={gameCycle.heading}
        description={gameCycle.subhead}
      />

      <figure className="mt-8 sm:mt-12" data-testid="cycle-diagram">
        <CycleDrawing layout={COMPACT} className="sm:hidden" />
        <CycleDrawing layout={WIDE} className="max-sm:hidden" />
        <CycleLegend legend={gameCycle.legend} trackLabels={trackLabels} locale={locale} />
      </figure>

      <ol className="mt-10 grid gap-x-10 gap-y-8 border-t border-rule pt-8 sm:grid-cols-2 lg:grid-cols-3">
        {gameCycle.phases.map((phase, index) => (
          <li key={phase.label} className="flex gap-4">
            <StageNumber n={index + 1} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <h3 className="type-title text-foreground">{phase.label}</h3>
              <p className="mt-1.5 type-body-sm text-muted-foreground">{phase.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 grid items-center gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-12">
        <figure className="lg:col-span-7">
          <ArtFrame
            sources={signatureSources(media)}
            alt={`Cosmic Signature ${formatId(payoff.sample.tokenId)}`}
            sizes="(min-width: 1024px) 45vw, 100vw"
            unavailableLabel={unavailableLabel}
          />
          <SignatureWallLabel
            as="figcaption"
            className="mt-3"
            tokenId={payoff.sample.tokenId}
            cycle={payoff.sample.cycle}
          />
        </figure>
        <div className="lg:col-span-5">
          <h3 className="type-heading-2 text-foreground">{payoff.heading}</h3>
          <p className="mt-4 type-body-md text-muted-foreground">{payoff.body}</p>
          <Link
            href={payoff.link.href}
            className="link mt-6 inline-flex min-h-6 items-center gap-1.5"
          >
            {payoff.link.label}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

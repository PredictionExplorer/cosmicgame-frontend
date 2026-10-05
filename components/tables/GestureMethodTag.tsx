import { GESTURE_METHOD_BG_CLASS, type GestureMethod } from '@/lib/theme/dataColors';
import { cn } from '@/lib/utils';
import { TableTag } from '@/components/ui/data-table';

/** The API's numeric `GestureType`: 0 ETH, 1 ETH with a RandomWalk NFT, 2 CST. */
const METHODS: Readonly<Record<number, { label: string; method: GestureMethod }>> = {
  0: { label: 'ETH', method: 'eth' },
  1: { label: 'ETH + RWLK', method: 'ethRandomWalk' },
  2: { label: 'CST', method: 'cst' },
};

/**
 * How a gesture was paid, as a tag with the method's series dot, so the
 * method reads the same here as in every chart. Tickers are Latin in every
 * locale. Replaces the unexplained per-method row tints. The tag keeps its
 * one line and the dot its size in a narrow column: the dot is the method's
 * only colour cue.
 */
export function GestureMethodTag({
  gestureType,
  unknownLabel,
}: {
  gestureType: number | undefined;
  /** Shown for a type the app does not know. */
  unknownLabel: string;
}) {
  const method = gestureType === undefined ? undefined : METHODS[gestureType];
  return (
    <TableTag className="gap-1.5">
      {method ? (
        <span
          aria-hidden
          className={cn('size-1.5 shrink-0 rounded-full', GESTURE_METHOD_BG_CLASS[method.method])}
        />
      ) : null}
      {method?.label ?? unknownLabel}
    </TableTag>
  );
}

/**
 * The method's series dot alone, named for assistive tech, where the unit
 * beside it already says the currency (a gesture's phone record): the dot
 * tells ETH from ETH with a Random Walk NFT, as it does in every chart.
 */
export function GestureMethodDot({
  gestureType,
  unknownLabel,
}: {
  gestureType: number | undefined;
  unknownLabel: string;
}) {
  const method = gestureType === undefined ? undefined : METHODS[gestureType];
  return (
    <span className="inline-flex items-center self-center">
      <span
        aria-hidden
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          method ? GESTURE_METHOD_BG_CLASS[method.method] : 'bg-subtle-foreground',
        )}
      />
      <span className="sr-only">{method?.label ?? unknownLabel}</span>
    </span>
  );
}

/** A gesture's type from either the current field or the backend's legacy `BidType`. */
export function resolveGestureType(gesture: {
  GestureType?: number;
  BidType?: unknown;
}): number | undefined {
  if (typeof gesture.GestureType === 'number') return gesture.GestureType;
  return typeof gesture.BidType === 'number' ? gesture.BidType : undefined;
}

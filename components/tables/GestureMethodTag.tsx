import { cn } from '@/lib/utils';
import { TableTag } from '@/components/ui/data-table';

/** The API's numeric `GestureType`: 0 ETH, 1 ETH with a RandomWalk NFT, 2 CST. */
const METHODS: Readonly<Record<number, { label: string; dot: string }>> = {
  0: { label: 'ETH', dot: 'bg-method-eth' },
  1: { label: 'ETH + RWLK', dot: 'bg-method-eth-rwlk' },
  2: { label: 'CST', dot: 'bg-method-cst' },
};

/**
 * How a gesture was paid, as a tag with the method's series dot, so the
 * method reads the same here as in every chart. Tickers are Latin in every
 * locale. Replaces the unexplained per-method row tints.
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
      {method ? <span aria-hidden className={cn('size-1.5 rounded-full', method.dot)} /> : null}
      {method?.label ?? unknownLabel}
    </TableTag>
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

import { useEffect, useState } from 'react';

interface UseRotatingIndexOptions {
  count: number;
  intervalMs?: number;
  enabled?: boolean;
  randomStart?: boolean;
  /**
   * Index to start from, typically a server-picked value threaded through
   * page props. When provided (and in range) it wins over `randomStart`'s
   * post-mount scramble, so the first client render matches the server HTML
   * and the initial artwork/image never swaps right after hydration.
   */
  initialIndex?: number | null;
}

function nextIndex(current: number, count: number): number {
  if (count <= 1) return current;
  return (current + 1) % count;
}

export function useRotatingIndex({
  count,
  intervalMs = 15_000,
  enabled = true,
  randomStart = false,
  initialIndex = null,
}: UseRotatingIndexOptions): number | null {
  const normalizedCount = Math.max(0, Math.trunc(count));
  const hasValidInitialIndex =
    initialIndex != null &&
    Number.isInteger(initialIndex) &&
    initialIndex >= 0 &&
    (normalizedCount === 0 || initialIndex < normalizedCount);
  const [index, setIndex] = useState(hasValidInitialIndex ? initialIndex : 0);

  useEffect(() => {
    if (hasValidInitialIndex || !randomStart || normalizedCount <= 1) return undefined;
    const timerId = window.setTimeout(() => {
      setIndex(Math.floor(Math.random() * normalizedCount));
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [hasValidInitialIndex, normalizedCount, randomStart]);

  useEffect(() => {
    if (!enabled || normalizedCount <= 1) return undefined;
    const timerId = window.setInterval(() => {
      setIndex((current) => nextIndex(current, normalizedCount));
    }, intervalMs);
    return () => window.clearInterval(timerId);
  }, [enabled, intervalMs, normalizedCount]);

  if (normalizedCount === 0) return null;
  return Math.min(index, normalizedCount - 1);
}

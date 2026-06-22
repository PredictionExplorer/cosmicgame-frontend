import { useEffect, useState } from 'react';

interface UseRotatingIndexOptions {
  count: number;
  intervalMs?: number;
  enabled?: boolean;
  randomStart?: boolean;
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
}: UseRotatingIndexOptions): number | null {
  const normalizedCount = Math.max(0, Math.trunc(count));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!randomStart || normalizedCount <= 1) return undefined;
    const timerId = window.setTimeout(() => {
      setIndex(Math.floor(Math.random() * normalizedCount));
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [normalizedCount, randomStart]);

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

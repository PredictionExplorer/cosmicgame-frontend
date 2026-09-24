'use client';

import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react';

export interface RovingPosition {
  row: number;
  item: number;
}

/** Whether a key event's target is one of the registered marks. */
function isMark(marks: ReadonlyMap<string, HTMLElement>, target: EventTarget): boolean {
  for (const node of marks.values()) if (node === target) return true;
  return false;
}

/**
 * One tab stop for a timeline of lanes (rows) of marks (stints, periods):
 * Tab enters on the current mark, Left and Right step along its lane, Up and
 * Down move to the nearest mark of the next lane that has one, Home and End
 * jump to the lane's ends. Marks render `tabIndex={isCurrent ? 0 : -1}` and
 * register themselves with `markRef`. `counts[row]` is the number of marks
 * in each lane. Keys pressed on anything else inside the group (a lane's
 * address link) keep their own meaning: scrolling the page, for one.
 */
export function useRovingStints(counts: readonly number[]) {
  const [current, setCurrent] = useState<RovingPosition>({ row: 0, item: 0 });
  const marks = useRef(new Map<string, HTMLElement>());

  // The remembered mark, or the first mark when the lanes changed under it.
  const position = useMemo<RovingPosition>(() => {
    if (current.item < (counts[current.row] ?? 0)) return current;
    return {
      row: Math.max(
        0,
        counts.findIndex((count) => count > 0),
      ),
      item: 0,
    };
  }, [counts, current]);

  const focus = useCallback((next: RovingPosition) => {
    setCurrent(next);
    marks.current.get(`${next.row}:${next.item}`)?.focus();
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!isMark(marks.current, event.target)) return;
      const { row, item } = position;
      const inRow = counts[row] ?? 0;
      const nearestRow = (from: number, step: 1 | -1): number | null => {
        for (let next = from + step; next >= 0 && next < counts.length; next += step) {
          if ((counts[next] ?? 0) > 0) return next;
        }
        return null;
      };
      let next: RovingPosition | null = null;
      switch (event.key) {
        case 'ArrowRight':
          next = { row, item: Math.min(item + 1, inRow - 1) };
          break;
        case 'ArrowLeft':
          next = { row, item: Math.max(item - 1, 0) };
          break;
        case 'Home':
          next = { row, item: 0 };
          break;
        case 'End':
          next = { row, item: inRow - 1 };
          break;
        case 'ArrowDown':
        case 'ArrowUp': {
          const target = nearestRow(row, event.key === 'ArrowDown' ? 1 : -1);
          if (target !== null) {
            const targetCount = counts[target] ?? 1;
            // Keep the reader's place along the time axis, roughly.
            const ratio = inRow > 1 ? item / (inRow - 1) : 0;
            next = { row: target, item: Math.round(ratio * (targetCount - 1)) };
          }
          break;
        }
        default:
          return;
      }
      event.preventDefault();
      if (next) focus(next);
    },
    [counts, focus, position],
  );

  const markRef = useCallback(
    (row: number, item: number) => (node: HTMLElement | null) => {
      const key = `${row}:${item}`;
      if (node) marks.current.set(key, node);
      else marks.current.delete(key);
    },
    [],
  );

  const isCurrent = (row: number, item: number) => position.row === row && position.item === item;

  return { onKeyDown, markRef, isCurrent, setCurrent };
}

/** The route's event-log id, or null when it is not a whole number ("12abc" is not 12). */
export function parseGestureId(id: string): number | null {
  if (!/^\d+$/.test(id)) return null;
  const value = Number(id);
  return Number.isSafeInteger(value) ? value : null;
}

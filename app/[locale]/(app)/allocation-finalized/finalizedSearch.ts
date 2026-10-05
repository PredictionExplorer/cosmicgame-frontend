/** The page's query, as the server receives it. */
export type FinalizedSearchParams = Record<string, string | string[] | undefined>;

export interface FinalizedSearch {
  /** The cycle the page records, or `null` for the index of the latest cycles. */
  cycle: number | null;
  /** The reader arrived from their own finalization (`message=success`). */
  isClaimSuccess: boolean;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Reads `?cycle=N&message=success`. The cycle must be a plain non-negative
 * integer; anything else (`abc`, `-1`, `1.5`, an unsafe integer) is no cycle,
 * and the page shows its index instead. Read on the server, so the first HTML
 * already holds the right shell: the record or the index.
 */
export function parseFinalizedSearch(params: FinalizedSearchParams): FinalizedSearch {
  const raw = first(params.cycle);
  const cycle =
    raw !== undefined && /^\d+$/.test(raw) && Number.isSafeInteger(Number(raw))
      ? Number(raw)
      : null;
  return { cycle, isClaimSuccess: cycle !== null && first(params.message) === 'success' };
}

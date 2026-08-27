/**
 * Pure scheduling math for backdated history seeding — kept free of chain
 * and ABI imports so the orchestrator (and unit tests) can use it without
 * pulling in the director's action stack.
 */

/** Wall-clock budget reserved per seeded cycle (daily cadence). */
export const SEED_SECONDS_PER_CYCLE = 86_400;

/** Extra margin between the last seeded cycle and "now". */
export const SEED_TAIL_MARGIN_SECONDS = 6 * 3_600;

/** Chain genesis date for a given number of seeded cycles. */
export function seedChainStartIso(cycles: number, wallNowMs = Date.now()): string {
  const backSeconds = cycles * SEED_SECONDS_PER_CYCLE + SEED_TAIL_MARGIN_SECONDS;
  return new Date(wallNowMs - backSeconds * 1_000).toISOString();
}

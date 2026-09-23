/**
 * The one reader for numeric values that arrive untyped: API fields, contract reads and
 * props that may be missing. Callers render `null` as unknown (`UnknownValue`), never as 0,
 * so a failed or missing read cannot pass for a confident zero.
 */

/**
 * A finite number from a number, a bigint or a numeric string; `null` for anything else
 * (missing, empty, `NaN`, `Infinity`, booleans, objects). A bigint beyond the double range
 * is `null` too, rather than `Infinity`.
 */
export function toFiniteNumber(value: unknown): number | null {
  let numeric: number;
  if (typeof value === 'number') numeric = value;
  else if (typeof value === 'bigint') numeric = Number(value);
  else if (typeof value === 'string' && value.trim() !== '') numeric = Number(value);
  else return null;
  return Number.isFinite(numeric) ? numeric : null;
}

/**
 * Helpers for ledgers with a two-line phone record (`DataTable`'s
 * `phoneRecord`). jsdom applies no media queries, so each row holds both
 * layouts: the ledger's cells, and the record CSS shows below `sm` only.
 */

/**
 * The ledger as a wide screen reads it: a detached copy without the phone
 * records, for text queries (`within(wideLedger(container))`). Being
 * detached, assert on counts or content rather than `toBeInTheDocument`.
 */
export function wideLedger(container: HTMLElement): HTMLElement {
  const copy = container.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[data-slot="phone-record"]').forEach((record) => record.remove());
  return copy;
}

/** Every row's phone record, in row order. */
export function phoneRecords(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-slot="phone-record"]'));
}

/** A record's two lines: the title line and, when it has any, the details line. */
export function recordLines(record: HTMLElement): [HTMLElement, HTMLElement | undefined] {
  const [title, details] = Array.from(record.children) as HTMLElement[];
  return [title!, details];
}

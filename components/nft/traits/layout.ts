/**
 * The trait ledger: the spec-sheet pattern the detail page's provenance
 * ledger uses (a label, its value, faint hairlines between rows), so the
 * traits read as one record with it rather than as boxed tiles. Two columns
 * from `lg`; the rows of both columns carry their own hairline, so a column
 * that ends early leaves no orphaned box.
 */
export const TRAIT_LEDGER_CLASS = 'grid border-t border-rule-faint lg:grid-cols-2 lg:gap-x-12';

/** The ledger of the gallery quick view's narrow column: one column. */
export const TRAIT_LEDGER_DENSE_CLASS = 'grid border-t border-rule-faint';

/** One label / value row of the trait ledger. */
export const TRAIT_ROW_CLASS =
  'grid min-w-0 grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] items-baseline gap-x-4 border-b border-rule-faint py-3';

/** A row of the dense ledger. */
export const TRAIT_ROW_DENSE_CLASS =
  'grid min-w-0 grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-baseline gap-x-3 border-b border-rule-faint py-2.5';

/** A row whose value needs the width (the masses, a braid word, file hashes): both columns. */
export const TRAIT_ROW_WIDE_CLASS = 'lg:col-span-2';

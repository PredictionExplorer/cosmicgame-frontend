/**
 * The page's one label-and-fact list ("What a gesture costs", "Good to
 * know"): rows on the page's hairlines, the name in a fixed column and the
 * fact beside it at body size. The list stops at the text's own width, so a
 * rule ends where its row's words do instead of running on across the page.
 */
export const FACT_LIST_CLASS = 'max-w-4xl divide-y divide-rule-faint border-y border-rule';

export const FACT_ROW_CLASS =
  'grid gap-1.5 py-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-x-10 sm:py-5';

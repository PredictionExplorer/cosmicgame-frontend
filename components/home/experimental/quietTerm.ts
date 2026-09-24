import { cn } from '@/lib/utils';

/**
 * For an explained term that names a row the page has already introduced (a
 * standings role, an allocation track): the dotted underline shows only on
 * hover, on focus and while its card is open, so a ledger of names does not
 * read as a glossary. The first mention of each concept (the monument, the
 * console) keeps the visible underline.
 *
 * On coarse pointers the trigger's hit area grows by 6px above and below, so
 * a 16–20px label becomes a target of at least 24px (WCAG 2.5.8) without
 * making its row any taller.
 */
export const QUIET_TERM_CLASS = cn(
  '[text-decoration-color:transparent]',
  "pointer-coarse:relative pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:-inset-y-1.5 pointer-coarse:after:content-['']",
);

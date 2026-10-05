import { TOUCH_TARGET_INLINE_TEXT_CLASS } from '@/lib/touch-target';

/**
 * For an explained term that names a row the page has already introduced (a
 * standings role, an allocation track): the dotted underline shows only on
 * hover, on focus and while its card is open, so a ledger of names does not
 * read as a glossary. The first mention of each concept (the monument, the
 * console) keeps the visible underline.
 *
 * On coarse pointers the trigger keeps a hit area at least 24px tall
 * (WCAG 2.5.8) without making its row any taller.
 */
export const QUIET_TERM_CLASS = `[text-decoration-color:transparent] ${TOUCH_TARGET_INLINE_TEXT_CLASS}`;

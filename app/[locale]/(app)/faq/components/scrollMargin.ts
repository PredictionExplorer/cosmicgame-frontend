/**
 * Where an FAQ jump lands a category, question or glossary term. The page's
 * scroll padding (`--sticky-offset`) already clears the site header; on
 * phones the margin adds the contents bar pinned under it (about 3.8rem) and
 * a small gap, and from `lg`, where the contents sit in the side column, it
 * adds nothing, so the heading lines up with the top of that column.
 */
export const FAQ_SCROLL_MARGIN_CLASS = 'scroll-mt-[4.5rem] lg:scroll-mt-0';

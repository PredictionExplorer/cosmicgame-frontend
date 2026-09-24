/**
 * The one grid every trait tile sits on, in the TraitSheet and in the facts
 * the detail page's trait panel adds under it, so the column edges line up:
 * two columns on a phone, four on a wide screen, where the four composition
 * traits fill one row.
 */
export const TRAIT_GRID_CLASS = 'grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4';

/**
 * For a grid of one-column facts: the last one fills the rest of its row
 * instead of leaving an empty cell (the third of three spans two columns).
 */
export const TRAIT_GRID_FILL_ROW_CLASS =
  'max-lg:[&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(4n+3)]:col-span-2';

/** The dense grid of the gallery quick view's narrow column. */
export const TRAIT_GRID_DENSE_CLASS = 'grid grid-cols-2 gap-2 sm:grid-cols-3';

/** A trait tile: a sunken well with a label over its value (no border: one bordered level per region). */
export const TRAIT_TILE_CLASS = 'min-w-0 rounded-control bg-surface-sunken px-3 py-3 sm:px-4';

/** A trait tile in the dense grid. */
export const TRAIT_TILE_DENSE_CLASS = 'min-w-0 rounded-control bg-surface-sunken px-3 py-2.5';

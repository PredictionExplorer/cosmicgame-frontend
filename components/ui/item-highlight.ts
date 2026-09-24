/**
 * The highlighted row of a Select option or a menu item.
 *
 * Radix moves focus through these rows programmatically (roving tabindex
 * -1), so the page-wide :focus-visible ring did not reliably show on them and
 * the old 20% accent fill measured 1.03:1 against the popover. The row now
 * marks itself from Radix's `data-highlighted` state, whether the pointer or
 * the arrow keys put it there: a 12% primary fill, full-strength text and a
 * 2px primary bar on its leading edge. The bar is 6.5:1 or more against the
 * popover in all five palettes, so the row draws its own indicator
 * (`focus-ring-none`) instead of stacking the ring on top of it.
 */
export const itemHighlight =
  'outline-none focus-ring-none data-[highlighted]:bg-primary/12 data-[highlighted]:text-foreground data-[highlighted]:shadow-[inset_2px_0_0_0_hsl(var(--primary))]';

/** The floating surface every menu, listbox and popover shares. */
export const floatingSurface =
  'rounded-control border border-rule bg-surface-raised text-popover-foreground shadow-float';

/**
 * A form control's boundary and fill: a sunken well, a 1px --input edge that
 * meets 3:1 on every surface, and 16px text below `sm` so focusing it never
 * zooms iOS Safari.
 */
export const fieldSurface =
  'rounded-control border border-input bg-surface-sunken text-base text-foreground transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] placeholder:text-subtle hover:enabled:border-foreground/45 aria-invalid:border-critical disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm';

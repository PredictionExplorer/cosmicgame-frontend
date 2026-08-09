/**
 * Touch target sizing for phones (WCAG 2.5.5, verified by
 * `e2e/mobile-tap-targets.mobile.spec.ts`).
 *
 * Everything here is scoped below `sm` so pointer layouts keep their density.
 *
 * These use `min-*` rather than `h-*`/`w-*` on purpose. A control is very often
 * a flex item, and along a flex container's main axis `flex-basis` supersedes
 * `height`/`width` outright — a field with `h-11` inside a `flex-col` row still
 * resolves to its content height. `min-height`/`min-width` are applied after
 * the flex algorithm runs and are the only declarations it cannot discard.
 */

/**
 * Grows a compact control to 44x44 below `sm` and centres its content — an
 * icon-only button, or a pill whose label is short enough to leave it narrower
 * than 44px ("≥5").
 *
 * Use when the control has room to grow. When it sits inline beside text and
 * growing it would push the whole row taller, use
 * {@link TOUCH_TARGET_EXTENDED_CLASS} instead.
 */
export const TOUCH_TARGET_ICON_CLASS =
  'max-sm:inline-flex max-sm:min-h-11 max-sm:min-w-11 max-sm:items-center max-sm:justify-center';

/** Raises a control to a 44px-tall target below `sm` without touching its width. */
export const TOUCH_TARGET_HEIGHT_CLASS = 'min-h-11 sm:min-h-0';

/**
 * Lifts a block-level text link to the 24px WCAG 2.5.8 target on phones.
 *
 * Text links get 24px rather than 44px because padding out every breadcrumb and
 * footer list to 44px is precisely what 2.5.8 exists to avoid. Growing the line
 * box rather than setting `min-height` keeps the text optically centred instead
 * of stranding it against the top of a taller box.
 */
export const TOUCH_TARGET_TEXT_LINK_CLASS = 'max-sm:leading-6';

/**
 * Extends a control's hit area to 44x44 with a transparent pseudo-element,
 * leaving layout untouched. Pair it with `data-touch-target="extended"` so the
 * audit measures the pseudo-element rather than the control's own box.
 *
 * The content utility must be written in the single-quote form. Tailwind does
 * not emit `after:content-[""]`, which silently produces no box at all — the
 * first attempt at this technique in the codebase failed exactly that way.
 */
export const TOUCH_TARGET_EXTENDED_CLASS =
  "relative after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] sm:after:hidden";

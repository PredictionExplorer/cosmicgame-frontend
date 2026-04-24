/**
 * Typography scale — string map of utility class names that mirror the
 * @utility definitions in styles/typography.css.
 *
 * Prefer the class name directly (`className="type-display-lg"`) in JSX.
 * Use this map for dynamic/variant-driven cases, e.g. inside cva() recipes.
 */

export const typography = {
  displayXl: 'type-display-xl',
  displayLg: 'type-display-lg',
  displayMd: 'type-display-md',
  displaySm: 'type-display-sm',
  heading1: 'type-heading-1',
  heading2: 'type-heading-2',
  heading3: 'type-heading-3',
  bodyLg: 'type-body-lg',
  bodyMd: 'type-body-md',
  bodySm: 'type-body-sm',
  monoMd: 'type-mono-md',
  monoSm: 'type-mono-sm',
  eyebrow: 'type-eyebrow',
} as const;

export type TypographyScale = keyof typeof typography;

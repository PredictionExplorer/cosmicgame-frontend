/**
 * Typography scale — string map of utility class names that mirror the
 * @utility definitions in styles/typography.css (docs/design-system.md).
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
  section: 'type-section',
  heading3: 'type-heading-3',
  title: 'type-title',
  bodyLg: 'type-body-lg',
  lede: 'type-lede',
  prose: 'type-prose',
  bodyMd: 'type-body-md',
  bodySm: 'type-body-sm',
  label: 'type-label',
  eyebrow: 'type-eyebrow',
  caption: 'type-caption',
  figureXl: 'type-figure-xl',
  figureLg: 'type-figure-lg',
  figureMd: 'type-figure-md',
  figureSm: 'type-figure-sm',
  figureDisplay: 'type-figure-display',
  hash: 'type-hash',
  mono: 'type-mono',
  monoMd: 'type-mono-md',
  monoSm: 'type-mono-sm',
} as const;

export type TypographyScale = keyof typeof typography;

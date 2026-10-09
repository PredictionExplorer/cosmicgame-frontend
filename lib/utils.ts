import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import { typography } from '@/lib/typography';

/** The type-scale names without their `type-` prefix, as tailwind-merge matches them. */
const TYPE_SCALE = Object.values(typography).map((className) => className.replace(/^type-/, ''));

/**
 * tailwind-merge that knows the design system's type scale
 * (styles/typography.css). Each `type-*` utility sets a size, line height,
 * weight, tracking and face together, so:
 *
 * - two type utilities conflict, and the later one wins, as two `text-*`
 *   sizes do;
 * - a type utility replaces an earlier font size, line height, tracking or
 *   weight, so a caller's `type-heading-3` wins over a primitive's default
 *   `text-lg font-semibold` instead of fighting it in the cascade.
 *
 * The reverse is left alone: a later `text-sm` beside a `type-*` stays a
 * deliberate size override and keeps the rest of the tier. The face is left
 * to the cascade too, so `font-mono` beside a tier (a mono Badge) keeps
 * its mono face.
 */
const twMerge = extendTailwindMerge<'type-scale'>({
  extend: {
    classGroups: {
      'type-scale': [{ type: TYPE_SCALE }],
    },
    conflictingClassGroups: {
      'type-scale': ['font-size', 'leading', 'tracking', 'font-weight'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

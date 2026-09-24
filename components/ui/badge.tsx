import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Badge — a short tag or state beside a value: "Eligible for Anchoring",
 * "Locked", "#000025", "Live".
 *
 * Tones
 *   neutral    a hairline --rule outline and muted text: a static tag
 *   accent     --primary on a 10% fill: the one tag that should be noticed
 *   positive   --positive on its 12% surface: healthy, growing, retrieved
 *   attention  --attention on its 12% surface: needs action soon
 *   critical   --critical on its 12% surface: failed, blocked
 *   live       --live on its 12% surface; its dot breathes while the value
 *              is actually live
 *
 * State colour is never the only signal: a state badge always carries a
 * word, and `dot` adds a 6px mark in the same colour. Badges are sentence
 * case and never smaller than the 12px caption floor. Use at most two per
 * wall label, and `shape="pill"` only for the live Cycle state.
 */
const badgeVariants = cva(
  'inline-flex max-w-full items-center gap-1.5 border align-middle font-medium [overflow-wrap:anywhere] [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        neutral: 'border-rule bg-transparent text-muted-foreground',
        accent: 'border-primary/35 bg-primary/10 text-primary',
        positive: 'border-transparent bg-positive-surface text-positive',
        attention: 'border-transparent bg-attention-surface text-attention',
        critical: 'border-transparent bg-critical-surface text-critical',
        live: 'border-transparent bg-live-surface text-live',
      },
      size: {
        /** 12px: table cells, wall labels, dense rows. */
        sm: 'min-h-5 px-1.5 py-px',
        /** 13px: page headers and cards. */
        md: 'min-h-6 px-2 py-0.5',
      },
      shape: {
        tag: 'rounded-edge',
        pill: 'rounded-pill',
      },
      /** Token numbers and short ids: JetBrains Mono, tabular, never broken. */
      mono: {
        true: 'whitespace-nowrap font-mono tabular-nums slashed-zero [overflow-wrap:normal]',
        false: '',
      },
      /**
       * Uppercase tracked status for an overline position: the `type-eyebrow`
       * face, whose own :lang() rule sets Chinese, Japanese and Korean as a
       * plain label, so a new locale needs no change here.
       */
      overline: {
        true: 'type-eyebrow',
        false: '',
      },
    },
    compoundVariants: [
      // One type utility per badge: the size's face, or the eyebrow's.
      { size: 'sm', overline: false, class: 'type-caption font-medium' },
      { size: 'md', overline: false, class: 'type-label' },
      { size: 'sm', shape: 'pill', class: 'px-2' },
      { size: 'md', shape: 'pill', class: 'px-2.5' },
    ],
    defaultVariants: {
      tone: 'neutral',
      size: 'md',
      shape: 'tag',
      mono: false,
      overline: false,
    },
  },
);

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

/** @deprecated Use `tone`. Kept so existing call sites render until they migrate. */
type LegacyBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'dot';

const LEGACY_TONE: Record<LegacyBadgeVariant, BadgeTone> = {
  default: 'accent',
  secondary: 'accent',
  destructive: 'critical',
  outline: 'neutral',
  dot: 'neutral',
};

const DOT_TONE: Record<BadgeTone, string> = {
  neutral: 'bg-subtle',
  accent: 'bg-primary',
  positive: 'bg-positive',
  attention: 'bg-attention',
  critical: 'bg-critical',
  live: 'bg-live motion-safe:animate-live-dot',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /**
   * @deprecated Use `tone` (`default`/`secondary` → `accent`, `destructive` →
   * `critical`, `outline` → `neutral`, `dot` → `neutral` with `dot`).
   */
  variant?: LegacyBadgeVariant | null;
  /** A 6px mark in the tone's colour before the label. It breathes only for `tone="live"`. */
  dot?: boolean;
  /** A leading lucide icon, drawn at 14px and hidden from assistive technology. */
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      tone,
      size,
      shape,
      mono,
      overline,
      variant,
      dot = false,
      icon,
      children,
      ...props
    },
    ref,
  ) => {
    const resolvedTone: BadgeTone = tone ?? (variant ? LEGACY_TONE[variant] : 'neutral');
    const showDot = dot || variant === 'dot';
    return (
      <span
        ref={ref}
        data-tone={resolvedTone}
        className={cn(
          badgeVariants({ tone: resolvedTone, size, shape, mono, overline }),
          className,
        )}
        {...props}
      >
        {showDot ? (
          <span
            aria-hidden
            data-slot="badge-dot"
            className={cn('size-1.5 shrink-0 rounded-full', DOT_TONE[resolvedTone])}
          />
        ) : null}
        {icon ? (
          <span aria-hidden className="inline-flex shrink-0">
            {icon}
          </span>
        ) : null}
        {children}
      </span>
    );
  },
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };

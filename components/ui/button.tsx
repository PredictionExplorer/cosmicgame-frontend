import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Button — every clickable action that is not a link in running text.
 *
 * Labels are written in sentence case in the catalogs and rendered as
 * written: the button never transforms case, which would turn "Make a
 * gesture" into "Make A Gesture" in English and has no meaning in the other
 * seven locales.
 *
 * Variants
 *   default      solid --primary, the ordinary primary action
 *   commit       the signature gradient: the ONE action a view exists for
 *                (make a gesture, imprint, retrieve, finalize). At most one
 *                per view.
 *   secondary    tinted --secondary, a second action beside a primary one
 *   outline      a --input boundary (3:1 on every surface) on transparent
 *   ghost        no boundary until hover; toolbars and icon buttons
 *   quiet        text with an underline on hover; a low-emphasis action
 *   link         primary text with an underline on hover
 *   destructive  a white label on the destructive fill
 *   text         legacy square-cornered chip; prefer outline
 *
 * Every variant eases colour, border, shadow, filter and transform together
 * (the old `transition-colors` skipped `filter`, so the primary hover
 * snapped), answers a press with an instant darken and a 2% settle (the
 * settle only when motion is allowed), and shows `aria-pressed="true"` as a
 * held state for toggle buttons. `loading` keeps the label, adds an inline
 * spinner and marks the button busy; it renders only without `asChild`.
 */
const buttonVariants = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-semibold',
    'transition-[color,background-color,border-color,box-shadow,filter,transform,text-decoration-color] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
    'active:duration-[var(--duration-instant)] motion-safe:active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default:
          'border border-transparent bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.16)] hover:brightness-110 active:brightness-95',
        commit:
          'border border-transparent bg-signature-gradient text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.16)] hover:brightness-110 active:brightness-95 active:shadow-[inset_0_1px_2px_rgb(0_0_0/0.18)]',
        destructive:
          'border border-transparent bg-destructive text-destructive-foreground hover:brightness-110 active:brightness-95',
        outline:
          'border border-input bg-transparent px-6 text-foreground hover:border-foreground/60 hover:bg-surface-raised active:bg-surface-sunken aria-pressed:border-primary aria-pressed:bg-surface-raised',
        secondary:
          'border border-secondary/35 bg-secondary/[0.08] px-6 text-secondary hover:border-secondary/60 hover:bg-secondary/[0.14] active:bg-secondary/[0.18] aria-pressed:border-secondary aria-pressed:bg-secondary/[0.18]',
        ghost:
          'text-muted-foreground hover:bg-surface-raised hover:text-foreground active:bg-surface-sunken aria-pressed:bg-surface-raised aria-pressed:text-foreground',
        quiet:
          'text-foreground underline decoration-transparent decoration-1 underline-offset-4 hover:decoration-current active:text-muted-foreground',
        link: 'text-primary underline decoration-transparent decoration-1 underline-offset-4 hover:decoration-current active:brightness-90',
        text: 'rounded-none border border-rule-faint bg-surface-sunken text-foreground hover:border-rule hover:bg-surface active:bg-surface-sunken',
      },
      // Every size reaches the 44px touch target below `sm` and keeps its
      // desktop density above it, so pointer UIs stay compact without asking
      // a thumb to hit a 36px button.
      //
      // `min-h-*` carries the guarantee that `h-*` cannot: a button is often
      // a flex item, and along a flex container's main axis `flex-basis`
      // supersedes `height`, so only min sizing survives the flex algorithm.
      //
      // There is deliberately no matching `min-w-11`. A width floor on every
      // button starves its siblings in a tight row, and only a handful of
      // buttons with two-character labels are narrower than 44px. Those set
      // `max-sm:min-w-11` at the call site instead.
      size: {
        default: 'h-11 min-h-11 px-4 py-2 sm:h-10 sm:min-h-0',
        sm: 'h-11 min-h-11 px-3 sm:h-9 sm:min-h-0',
        lg: 'h-11 min-h-11 px-8 sm:min-h-0',
        /** 56px: the commit action in the dock and the gesture form, and landing CTAs. */
        xl: 'h-14 min-h-14 px-6 text-base',
        icon: 'h-11 w-11 min-h-11 min-w-11 sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * A pending action: keeps the label, adds an inline spinner, disables the
   * button and sets `aria-busy`. Ignored with `asChild`.
   */
  loading?: boolean;
}

function ButtonSpinner() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      className="motion-safe:animate-spin"
      data-slot="button-spinner"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const classes = cn(
      buttonVariants({ variant, size }),
      // A pending action is busy, not unavailable: it keeps full contrast.
      loading && !asChild && 'disabled:opacity-100',
      className,
    );
    if (asChild) {
      return (
        <Slot className={classes} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }
    return (
      <button
        className={classes}
        ref={ref}
        {...props}
        disabled={props.disabled || loading}
        aria-busy={loading ? true : props['aria-busy']}
      >
        {loading ? <ButtonSpinner /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

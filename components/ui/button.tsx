import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'liquid-glass-cta capitalize border-0 bg-gradient-to-r from-[#06AEEC] via-[#35C9FF] to-[#9C37FD] text-white hover:-translate-y-0.5 hover:brightness-110',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'liquid-glass-control capitalize border border-primary/50 bg-transparent px-6 text-secondary hover:bg-primary/10',
        secondary:
          'liquid-glass-control relative capitalize px-6 text-primary border border-primary/50 bg-primary/[0.04] hover:-translate-y-0.5 hover:bg-primary/10',
        ghost:
          'hover:bg-white/[0.07] hover:text-foreground hover:shadow-[0_10px_36px_-26px_rgb(var(--aurora-cyan-rgb)/0.8)]',
        link: 'text-primary underline-offset-4 hover:underline',
        text: 'text-white border border-white/[0.06] bg-white/[0.02] rounded-none',
      },
      // Every size reaches the 44px touch target below `sm` and keeps its
      // original desktop density above it, so pointer UIs stay compact
      // without asking a thumb to hit a 36px button.
      //
      // `min-h-11` carries the guarantee that `h-11` cannot: a button is often
      // a flex item, and along a flex container's main axis `flex-basis`
      // supersedes `height`, so only min sizing survives the flex algorithm.
      //
      // There is deliberately no matching `min-w-11`. A width floor on every
      // button starves its siblings in a tight row — it pushed the language
      // switcher's own label 6px out of its box — and only a handful of
      // buttons with two-character labels are narrower than 44px. Those set
      // `max-sm:min-w-11` at the call site instead.
      size: {
        default: 'h-11 min-h-11 px-4 py-2 sm:h-10 sm:min-h-0',
        sm: 'h-11 min-h-11 rounded-md px-3 sm:h-9 sm:min-h-0',
        lg: 'h-11 min-h-11 rounded-md px-8 sm:min-h-0',
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

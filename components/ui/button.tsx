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
          'capitalize border-0 bg-gradient-to-r from-[#06AEEC] via-[#35C9FF] to-[#9C37FD] text-white shadow-[0_14px_40px_-22px_rgb(var(--aurora-cyan-rgb)/0.9)] hover:-translate-y-0.5 hover:brightness-110',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'capitalize border border-primary/50 bg-transparent px-6 text-secondary hover:bg-primary/10',
        secondary:
          'relative capitalize px-6 text-primary border border-primary/50 bg-primary/[0.04] hover:-translate-y-0.5 hover:bg-primary/10',
        ghost:
          'hover:bg-white/[0.07] hover:text-foreground hover:shadow-[0_10px_36px_-26px_rgb(var(--aurora-cyan-rgb)/0.8)]',
        link: 'text-primary underline-offset-4 hover:underline',
        text: 'text-white border border-white/[0.06] bg-white/[0.02] rounded-none',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
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

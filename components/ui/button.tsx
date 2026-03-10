'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'relative text-white [background:linear-gradient(92.49deg,#06AEEC_0.4%,#9C37FD_86.02%)] hover:brightness-110 [@supports(background:paint(id))]:border-0 [@supports(background:paint(id))]:rounded-none [@supports(background:paint(id))]:[--border:1px] [@supports(background:paint(id))]:[--radius:4px] [@supports(background:paint(id))]:[--t:0] [@supports(background:paint(id))]:[--path:0_0px,20px_0,100%_0,100%_calc(100%-16px),calc(100%-20px)_100%,0_100%] [@supports(background:paint(id))]:[mask:paint(rounded-shape)]',
        outline:
          "relative text-secondary border border-primary/50 hover:bg-white/5 [@supports(background:paint(id))]:border-0 [@supports(background:paint(id))]:rounded-none [@supports(background:paint(id))]:[--border:1px] [@supports(background:paint(id))]:[--radius:4px] [@supports(background:paint(id))]:[--t:0] [@supports(background:paint(id))]:[--path:0_0px,20px_0,100%_0,100%_calc(100%-16px),calc(100%-20px)_100%,0_100%] [@supports(background:paint(id))]:bg-transparent [@supports(background:paint(id))]:[mask:paint(rounded-shape)] [@supports(background:paint(id))]:before:content-[''] [@supports(background:paint(id))]:before:absolute [@supports(background:paint(id))]:before:inset-0 [@supports(background:paint(id))]:before:[--t:1] [@supports(background:paint(id))]:before:[background:linear-gradient(152.14deg,#15BFFD_9.96%,#9C37FD_100%)] [@supports(background:paint(id))]:before:[mask:paint(rounded-shape)]",
        secondary: 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20',
        ghost: 'text-white hover:bg-white/5',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-6 py-2 rounded-sm',
        sm: 'h-8 px-4 text-xs rounded-sm',
        lg: 'h-12 px-8 text-base rounded-sm',
        icon: 'h-10 w-10 rounded-sm',
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

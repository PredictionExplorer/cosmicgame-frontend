import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'relative capitalize text-white border-0 bg-gradient-to-r from-[#06AEEC] to-[#9C37FD] [--border:1px] [--radius:4px] [--t:0] [--path:0_0px,20px_0,100%_0,100%_calc(100%-16px),calc(100%-20px)_100%,0_100%] [@supports(background:paint(id))]:[-webkit-mask:paint(rounded-shape)] hover:opacity-90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'relative capitalize px-6 text-secondary border border-primary/50 bg-transparent hover:bg-primary/10 [--border:1px] [--radius:4px] [--t:0] [--path:0_0px,20px_0,100%_0,100%_calc(100%-16px),calc(100%-20px)_100%,0_100%] [@supports(background:paint(id))]:border-0 [@supports(background:paint(id))]:[-webkit-mask:paint(rounded-shape)] [@supports(background:paint(id))]:bg-transparent before:[@supports(background:paint(id))]:content-[""] before:[@supports(background:paint(id))]:absolute before:[@supports(background:paint(id))]:inset-0 before:[@supports(background:paint(id))]:bg-gradient-to-br before:[@supports(background:paint(id))]:from-primary before:[@supports(background:paint(id))]:to-accent before:[@supports(background:paint(id))]:[--t:1] before:[@supports(background:paint(id))]:[-webkit-mask:paint(rounded-shape)]',
        secondary:
          'relative capitalize px-6 text-primary border border-primary/50 bg-transparent hover:bg-primary/10',
        ghost: 'hover:bg-white/5 hover:text-foreground',
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

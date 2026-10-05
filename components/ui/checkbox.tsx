'use client';

import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          // A 2px corner reads as a box, so a multi-select filter no longer
          // looks like a group of radio buttons.
          'peer size-4 shrink-0 appearance-none rounded-edge border border-input bg-surface-sunken transition-colors duration-[var(--duration-fast)] hover:enabled:border-foreground/60 disabled:cursor-not-allowed disabled:opacity-50 checked:border-primary checked:bg-primary',
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden
        strokeWidth={3}
        className="pointer-events-none absolute size-4 p-0.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
      />
    </div>
  ),
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };

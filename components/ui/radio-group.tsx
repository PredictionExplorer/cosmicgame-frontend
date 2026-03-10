'use client';

import * as React from 'react';
import { Circle } from 'lucide-react';

import { cn } from '@/lib/utils';

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}>({});

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
        <div className={cn('grid gap-2', className)} role="radiogroup" ref={ref} {...props} />
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = 'RadioGroup';

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const checked = context.value === value;

    return (
      <div className="relative inline-flex items-center">
        <input
          type="radio"
          ref={ref}
          name={context.name}
          value={value}
          checked={checked}
          onChange={() => context.onValueChange?.(value)}
          className={cn(
            'peer h-4 w-4 shrink-0 appearance-none rounded-full border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:border-primary',
            className,
          )}
          {...props}
        />
        {checked && (
          <Circle className="pointer-events-none absolute h-4 w-4 p-0.5 fill-current text-primary" />
        )}
      </div>
    );
  },
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };

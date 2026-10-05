import * as React from 'react';

import { cn } from '@/lib/utils';

/** A clearly outlined writing surface for optional participant messages. */
const MessageTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      // Keep mobile text at 16px so focusing the editor does not zoom iOS Safari.
      'flex min-h-24 w-full resize-y rounded-control border border-input bg-surface-sunken px-3.5 py-3 text-base leading-relaxed text-foreground transition-colors duration-[var(--duration-fast)] placeholder:text-subtle hover:enabled:border-foreground/45 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none sm:text-sm',
      className,
    )}
    {...props}
  />
));
MessageTextarea.displayName = 'MessageTextarea';

export { MessageTextarea };

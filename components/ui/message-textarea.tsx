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
      'flex min-h-24 w-full resize-y rounded-xl border border-primary/55 bg-background bg-[linear-gradient(135deg,hsl(var(--primary)/0.08),hsl(var(--secondary)/0.03))] px-3.5 py-3 text-base leading-relaxed text-foreground shadow-sm ring-offset-background transition-colors placeholder:text-muted-foreground hover:enabled:border-primary/75 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none sm:text-sm',
      className,
    )}
    {...props}
  />
));
MessageTextarea.displayName = 'MessageTextarea';

export { MessageTextarea };

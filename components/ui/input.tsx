import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // `h-11` meets the 44px touch target on phones. The 16px font size
          // is not cosmetic: iOS Safari zooms the whole viewport when a
          // focused field is smaller than that, which strands the user
          // scrolled sideways on a page they were only trying to type into.
          //
          // `min-h-11` is not redundant with `h-11`. A field placed in a
          // column flex container — which every `flex-col sm:flex-row` form row
          // becomes below `sm` — is a flex item along the vertical axis, so a
          // `flex-1`/`flex-basis` from the caller replaces `height` outright
          // and the field resolves to its content height (~38px). `min-height`
          // is applied after flexing and is the only declaration the flex
          // algorithm cannot discard.
          'flex h-11 min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:min-h-0 sm:text-[15px]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };

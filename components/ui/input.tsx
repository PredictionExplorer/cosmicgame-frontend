import * as React from 'react';

import { cn } from '@/lib/utils';
import { fieldSurface } from '@/components/ui/item-highlight';

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
          'flex h-11 min-h-11 w-full px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-primary sm:h-10 sm:min-h-0',
          fieldSurface,
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

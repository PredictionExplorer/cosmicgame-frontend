'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

type TooltipProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;

function Tooltip({ open: openProp, defaultOpen, onOpenChange, ...props }: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const contextValue = React.useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <TooltipContext.Provider value={contextValue}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </TooltipContext.Provider>
  );
}

Tooltip.displayName = TooltipPrimitive.Root.displayName;

const TooltipTrigger = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onPointerDown, onClickCapture, onClick, ...props }, ref) => {
  const tooltip = React.useContext(TooltipContext);
  const shouldSuppressClickRef = React.useRef(false);

  const suppressClick = React.useCallback((event: React.MouseEvent) => {
    if (!shouldSuppressClickRef.current) {
      return false;
    }

    shouldSuppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
    return true;
  }, []);

  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      {...props}
      onPointerDown={(event) => {
        if (event.pointerType === 'touch' && tooltip && !tooltip.open) {
          tooltip.setOpen(true);
          shouldSuppressClickRef.current = true;
        }

        onPointerDown?.(event);
      }}
      onClickCapture={(event) => {
        if (suppressClick(event)) {
          return;
        }

        onClickCapture?.(event);
      }}
      onClick={(event) => {
        if (event.defaultPrevented || suppressClick(event)) {
          return;
        }

        onClick?.(event);
      }}
    />
  );
});
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

/**
 * `TooltipContent` is rendered through a `TooltipPrimitive.Portal` so the popper
 * escapes the trigger's render tree. Without a portal, the content gets clipped
 * by ancestors with `overflow: hidden` (e.g. the `StatCard` on `/contracts`) and
 * confined to local stacking contexts spawned by `transform`, `filter`, or
 * `backdrop-filter` ancestors — which manifests as tooltips that look "blocked
 * by other elements." Portaling to the document root makes z-index global and
 * exempts the tooltip from any ancestor clipping or stacking-context isolation.
 */
const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={8}
      className={cn(
        'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

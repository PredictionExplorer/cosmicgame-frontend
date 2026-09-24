'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn('border-b', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

interface AccordionContentProps extends Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>,
  'forceMount' | 'hidden'
> {
  /**
   * Keep the body in the page while it is closed, for crawlers and the
   * browser's find-in-page: pass `true` while the item is closed and
   * `false` while it is open. A closed body is then `hidden="until-found"`
   * (out of the layout and the accessibility tree, still searchable), and a
   * find-in-page match opens the item through its trigger. The server
   * renders plain `hidden`, so nothing flashes open before hydration. Leave
   * it undefined for a body that mounts only while open.
   */
  hiddenUntilFound?: boolean;
}

/**
 * Upgrades a closed, kept-mounted body from `hidden` to `hidden="until-found"`
 * and opens its item when find-in-page reveals it. React writes `hidden` as a
 * boolean and has no `beforematch` event, so both go through the DOM. It runs
 * as a layout effect so the upgrade lands before the first paint.
 */
function useHiddenUntilFound(ref: React.RefObject<HTMLDivElement | null>, closed: boolean) {
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !closed) return undefined;
    element.setAttribute('hidden', 'until-found');
    const open = () => {
      const trigger = Array.from(document.querySelectorAll<HTMLElement>('[aria-controls]')).find(
        (candidate) => candidate.getAttribute('aria-controls') === element.id,
      );
      trigger?.click();
    };
    element.addEventListener('beforematch', open);
    return () => element.removeEventListener('beforematch', open);
  }, [ref, closed]);
}

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, hiddenUntilFound, ...props }, forwardedRef) => {
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const keepMounted = hiddenUntilFound !== undefined;
  useHiddenUntilFound(innerRef, hiddenUntilFound === true);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  return (
    <AccordionPrimitive.Content
      ref={setRef}
      {...(keepMounted ? { forceMount: true as const, hidden: hiddenUntilFound } : {})}
      className={cn(
        'overflow-hidden text-sm data-[state=open]:animate-accordion-down',
        // A kept-mounted body hides at once when it closes: it is `hidden`,
        // so a height animation would only shrink an empty box.
        !keepMounted && 'data-[state=closed]:animate-accordion-up',
      )}
      {...props}
    >
      <div className={cn('pb-4 pt-0', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

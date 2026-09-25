'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { ScrollRail } from '@/components/ui/scroll-rail';

/**
 * Tabs in three shapes, one behaviour (Radix: arrow keys move between tabs,
 * Home and End jump, one tab stop for the list):
 *
 *   segmented  a sunken track with the selected option raised on it, edged
 *              by the 3:1 control boundary (--input): switching views of one
 *              thing (the default). It draws no --primary rule, so it never
 *              competes with an underline tab row above it for "current".
 *   underline  a hairline with a 2px --primary indicator under the selected
 *              tab: page sub-navigation (statistics, detail, Trust Center)
 *   pills      separate chips, the selected one tinted: filters and short sets
 *
 * `scroll` puts the list on a ScrollRail: one row that scrolls sideways with
 * edge fades instead of wrapping, keeping the selected tab in view. Link-based
 * sub-navigation uses the same look through `tabsListVariants` and
 * `tabsTriggerVariants` (mark the current link `aria-current="page"`).
 */
export type TabsVariant = 'segmented' | 'underline' | 'pills';

const TabsVariantContext = React.createContext<{ variant: TabsVariant; scroll: boolean }>({
  variant: 'segmented',
  scroll: false,
});

const tabsListVariants = cva('min-w-0 items-center text-muted-foreground', {
  variants: {
    variant: {
      // The list is content-height below `sm` so its triggers can reach the
      // 44px touch target; a fixed height would pin them to 32px. The sunken
      // fill alone draws the track: a default border would survive a
      // caller's `border-b` (tailwind-merge keeps both) and box in lists
      // that reshape themselves into a rule.
      segmented: 'inline-flex h-auto justify-center gap-1 rounded-control bg-surface-sunken p-1',
      underline: 'flex h-auto justify-start gap-1 border-b border-rule',
      pills: 'flex h-auto flex-wrap justify-start gap-2',
    },
  },
  defaultVariants: { variant: 'segmented' },
});

const tabsTriggerVariants = cva(
  [
    // 44×44 below `sm` (a one-word segment such as "All" is narrower than
    // its height); from `sm` the variants set their own compact heights.
    'relative inline-flex min-h-11 min-w-11 select-none items-center justify-center gap-2 text-center text-sm font-medium sm:min-w-0',
    'transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
    'hover:text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        segmented: [
          'rounded-[calc(var(--radius-control)-2px)] px-3 py-1.5 sm:min-h-9',
          // The selected edge is --input, the control boundary tuned to 3:1 on
          // every surface: the fill step alone is 1.1-1.3:1, below what a
          // component's state needs (WCAG 1.4.11).
          'data-[state=active]:bg-surface-raised data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_0_0_1px_hsl(var(--input))]',
          'aria-[current=page]:bg-surface-raised aria-[current=page]:text-foreground aria-[current=page]:shadow-[inset_0_0_0_1px_hsl(var(--input))]',
        ],
        underline: [
          '-mb-px rounded-t-control px-3 pb-2.5 pt-2 sm:min-h-10',
          'shadow-[inset_0_-2px_0_0_transparent] hover:shadow-[inset_0_-2px_0_0_hsl(var(--rule))]',
          'data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_-2px_0_0_hsl(var(--primary))]',
          'aria-[current=page]:text-foreground aria-[current=page]:shadow-[inset_0_-2px_0_0_hsl(var(--primary))]',
        ],
        pills: [
          'rounded-pill border border-rule px-3.5 py-1.5 sm:min-h-9',
          'hover:border-foreground/40',
          'data-[state=active]:border-primary/50 data-[state=active]:bg-primary/12 data-[state=active]:text-foreground',
          'aria-[current=page]:border-primary/50 aria-[current=page]:bg-primary/12 aria-[current=page]:text-foreground',
        ],
      },
      scroll: {
        true: 'shrink-0 whitespace-nowrap',
        // Labels wrap on a phone when the row does not scroll: `nowrap` made
        // multi-word tabs such as "Endurance Champions" overrun the list.
        false: 'break-words sm:whitespace-nowrap',
      },
    },
    defaultVariants: { variant: 'segmented', scroll: false },
  },
);

const Tabs = TabsPrimitive.Root;

export interface TabsListProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {
  /** One row that scrolls sideways, with edge fades, instead of wrapping. */
  scroll?: boolean;
}

const TabsList = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, scroll = false, ...props }, ref) => {
    const resolved = variant ?? 'segmented';
    const context = React.useMemo(() => ({ variant: resolved, scroll }), [resolved, scroll]);
    const list = (
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          tabsListVariants({ variant: resolved }),
          // At least the rail's width, so an underline row's hairline runs
          // under the whole content column rather than stopping at its
          // last tab.
          scroll && 'w-max min-w-full flex-nowrap',
          className,
        )}
        {...props}
      />
    );
    return (
      <TabsVariantContext.Provider value={context}>
        {scroll ? <ScrollRail trackClassName="w-full">{list}</ScrollRail> : list}
      </TabsVariantContext.Provider>
    );
  },
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { variant, scroll } = React.useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant, scroll }), className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('mt-2', className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };

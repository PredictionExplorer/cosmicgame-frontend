'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { ScrollRail } from '@/components/ui/scroll-rail';
import {
  SEGMENT_SELECTED_CLASS,
  tabsListVariants,
  tabsTriggerVariants,
} from '@/components/ui/tabs-variants';

/**
 * Tabs in three shapes, one behaviour (Radix: arrow keys move between tabs,
 * Home and End jump, one tab stop for the list):
 *
 *   segmented  a sunken track with the selected option raised on it, edged
 *              by the 3:1 control boundary (--input): switching views of one
 *              thing (the default). It draws no --primary rule, so it never
 *              competes with an underline tab row above it for "current".
 *   underline  a hairline with a 2px --primary indicator under the selected
 *              tab: page sub-navigation (statistics, detail, Trust Center).
 *              Flush: the first label starts on the content edge and the
 *              indicator spans the word, the labels 1.5rem apart.
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

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  SEGMENT_SELECTED_CLASS,
  tabsListVariants,
  tabsTriggerVariants,
};

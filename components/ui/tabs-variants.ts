import { cva } from 'class-variance-authority';

/**
 * The tab and segmented-control recipes, in a module without `'use client'`
 * so a server component (PageHeader's sibling-page row) can draw the same
 * trigger as the client `Tabs` (components/ui/tabs.tsx re-exports them).
 */

export const tabsListVariants = cva('min-w-0 items-center text-muted-foreground', {
  variants: {
    variant: {
      // The list is content-height below `sm` so its triggers can reach the
      // 44px touch target; a fixed height would pin them to 32px. The sunken
      // fill alone draws the track: a default border would survive a
      // caller's `border-b` (tailwind-merge keeps both) and box in lists
      // that reshape themselves into a rule.
      segmented: 'inline-flex h-auto justify-center gap-1 rounded-control bg-surface-sunken p-1',
      underline: 'flex h-auto justify-start gap-x-6 border-b border-rule',
      pills: 'flex h-auto flex-wrap justify-start gap-2',
    },
  },
  defaultVariants: { variant: 'segmented' },
});

/**
 * The segmented control's selected segment as plain classes, for a picker
 * that marks its choice itself (`aria-pressed` or `aria-checked`, a boolean)
 * rather than through `data-state="active"` or `aria-current`: the raised
 * surface edged by --input, never a --primary rule. The same classes the
 * segmented variant applies (a test keeps them equal).
 */
export const SEGMENT_SELECTED_CLASS =
  'bg-surface-raised text-foreground shadow-[inset_0_0_0_1px_hsl(var(--input))]';

export const tabsTriggerVariants = cva(
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
          '-mb-px px-0 pb-2.5 pt-2 sm:min-h-10',
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

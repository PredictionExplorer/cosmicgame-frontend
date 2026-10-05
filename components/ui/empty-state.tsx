import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

export type StateVariant = 'page' | 'panel' | 'inline';

/**
 * The layout every empty, error and loading state shares, sized to the
 * space it stands in for:
 *
 *   page    replaces a page's content under its H1: generous and centred
 *   panel   fills a card or a table's body: centred, compact (the default)
 *   inline  one row inside a list or beside a control: icon and text side by side
 */
export const stateLayoutVariants = cva('flex', {
  variants: {
    variant: {
      page: 'flex-col items-center justify-center px-4 py-20 text-center sm:py-24',
      panel: 'flex-col items-center justify-center px-4 py-12 text-center',
      inline: 'items-start gap-3 px-1 py-3 text-left',
    },
  },
  defaultVariants: { variant: 'panel' },
});

/** The icon tile: a sunken well with the glyph in the subtle tier. */
export const stateIconVariants = cva(
  'flex shrink-0 items-center justify-center rounded-surface border border-rule-faint bg-surface-sunken text-subtle',
  {
    variants: {
      variant: {
        page: 'mb-5 size-14 [&_svg]:size-6',
        panel: 'mb-4 size-11 [&_svg]:size-5',
        inline: 'mt-0.5 size-8 rounded-control [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'panel' },
  },
);

const TITLE_CLASS: Record<StateVariant, string> = {
  page: 'type-heading-3 text-foreground',
  panel: 'type-title text-foreground',
  inline: 'type-body-sm font-medium text-foreground',
};

interface EmptyStateProps {
  icon?: ReactNode;
  /**
   * A figure of its own in place of the icon tile (art on its plates), for a
   * page state that can show what will fill it. Centred variants only.
   */
  visual?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** The space the state stands in for. Defaults to `panel`. */
  variant?: StateVariant;
  /**
   * Heading level of the title. Defaults to 4; pass 3 under a page `h2`, or 2
   * when the state replaces a page's content under its `h1`.
   */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/**
 * EmptyState — says there is nothing here yet, and what would put something
 * here. Say why the list is empty and offer the action that fills it; never
 * show an empty table.
 */
export function EmptyState({
  icon,
  visual,
  title,
  description,
  action,
  variant = 'panel',
  headingLevel = 4,
  className,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  const isInline = variant === 'inline';
  const text = (
    <>
      <Heading className={TITLE_CLASS[variant]}>{title}</Heading>
      {description ? (
        <div
          className={cn(
            'type-body-sm text-muted-foreground',
            isInline ? 'mt-0.5' : 'mt-2 max-w-sm text-pretty',
          )}
        >
          {description}
        </div>
      ) : null}
      {action ? <div className={isInline ? 'mt-3' : 'mt-6'}>{action}</div> : null}
    </>
  );
  // Centred variants keep the title a direct child of the root, so callers
  // that size the root (min-height, full height) size the state itself.
  return (
    <div className={cn(stateLayoutVariants({ variant }), className)}>
      {visual && !isInline ? (
        visual
      ) : (
        <div aria-hidden className={stateIconVariants({ variant })}>
          {icon ?? <Inbox />}
        </div>
      )}
      {isInline ? <div className="min-w-0">{text}</div> : text}
    </div>
  );
}

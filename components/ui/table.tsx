import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Static ledger primitives: the same `.cs-table` layout as the app's
 * ResponsiveTable (styles/tables.css), with no client JavaScript, for
 * server-rendered content such as the white paper and the landing host.
 *
 * - Headers and cells state their alignment (`align`), so they agree.
 * - Every cell names its column (`label`), which a phone shows beside the
 *   value when the row becomes a record; `stack` puts long text under its
 *   label instead.
 * - A table wider than its column scrolls inside `Table`'s own container,
 *   which fades the edge with more content beyond it and, given a `label`,
 *   is a named region reachable from the keyboard.
 *
 * Interactive data tables use `<DataTable>` (`@/components/ui/data-table`).
 */

type Align = 'start' | 'end' | 'center';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /**
   * Names the table's scroll container, which then becomes a focusable
   * region so a wide table can be scrolled from the keyboard.
   */
  label?: string;
  /** Phone layout: `cards` (default) turns rows into records; `compact` keeps a table. */
  layout?: 'cards' | 'compact';
  /** Classes on the scroll container. */
  containerClassName?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, label, layout = 'cards', containerClassName, ...props }, ref) => (
    <div
      {...(label ? { role: 'region', 'aria-label': label, tabIndex: 0 } : {})}
      className={cn('cs-table-scroll relative w-full min-w-0 overflow-x-auto', containerClassName)}
    >
      <table
        ref={ref}
        data-layout={layout}
        className={cn('cs-table w-full border-collapse text-sm', className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => <thead ref={ref} className={className} {...props} />);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => <tbody ref={ref} className={className} {...props} />);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn('border-t border-rule font-medium', className)} {...props} />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => <tr ref={ref} className={className} {...props} />,
);
TableRow.displayName = 'TableRow';

interface TableHeadProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: Align;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = 'start', scope = 'col', ...props }, ref) => (
    <th
      ref={ref}
      scope={scope}
      data-align={align}
      className={cn(
        'border-b border-rule px-4 pt-3 pb-2.5 align-bottom type-label text-subtle',
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = 'TableHead';

interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** The column's name, shown beside (or above) the value in a phone record. */
  label?: string;
  align?: Align;
  /** Tabular figures for a number column. */
  numeric?: boolean;
  /** In a phone record, set the value under its label at full width (long text). */
  stack?: boolean;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, label, align = 'start', numeric, stack, children, ...props }, ref) => (
    <td
      ref={ref}
      data-label={label}
      data-align={align}
      data-numeric={numeric ? 'true' : undefined}
      data-stack={stack ? 'true' : undefined}
      className={cn(
        'border-b border-rule-faint px-4 py-3 align-top leading-6 text-muted-foreground',
        className,
      )}
      {...props}
    >
      <div data-slot="value">{children}</div>
    </td>
  ),
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-3 caption-bottom text-start type-caption text-subtle', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

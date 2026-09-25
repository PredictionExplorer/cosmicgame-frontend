import type { ReactNode } from 'react';

/**
 * The state and framing every table in components/tables accepts, passed
 * straight to `<DataTable>`. A page hands over its query state instead of
 * swapping the table for a "Loading..." paragraph or a bare error line.
 */
export interface LedgerStateProps {
  /** Placeholder rows at the finished table's height while the list loads. */
  loading?: boolean;
  /** A load failure: the message shown in place of the table. */
  error?: ReactNode;
  /** Offers "Try again" beside the error. */
  onRetry?: () => void;
  /** A visible heading that also names the table (H2 by default). */
  title?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  /** A line under the title: what the table lists. */
  description?: ReactNode;
  /** The empty state's title, when the table's own does not fit the page. */
  emptyTitle?: string;
  /** Explains what the empty table will list, under its empty title. */
  emptyDescription?: string;
  /** A next step from the empty state (a link, an address to send to). */
  emptyAction?: ReactNode;
  /** `false` where the page already states the time zone beside a standalone date. */
  timeZoneNote?: boolean;
  className?: string;
}

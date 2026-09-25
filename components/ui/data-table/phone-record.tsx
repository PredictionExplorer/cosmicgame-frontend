import * as React from 'react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * One row of an activity ledger as a phone reads it (`DataTableProps.phoneRecord`):
 * two lines, with no label repeated beside every value.
 *
 * ```
 * Received                              +1,200.00 CST   ← title · titleEnd
 * 0x1Ec1…E990 · Sep 24, 07:31                            ← details
 * ```
 */
export interface PhoneRecordContent {
  /**
   * Line 1, at the start: what names the row (its date, its activity). The
   * table wraps it in the row link when the row has one, and adds the
   * connected wallet's "You" tag after it.
   */
  title: React.ReactNode;
  /** Line 1, at the end: the figure the row is about (an amount, an artwork), or who it concerns. */
  titleEnd?: React.ReactNode;
  /**
   * Line 2, in the muted tier: the row's other facts, in reading order,
   * separated by middle dots. `null`, `false` and `undefined` entries drop out.
   */
  details?: readonly React.ReactNode[];
  /** Line 2 reads from the start (default), or sits at the end edge under `titleEnd` (figures). */
  detailsAlign?: 'start' | 'end';
}

/** What a `phoneRecord` renderer is told about the row besides the row itself. */
export interface PhoneRecordContext {
  /** The row's position in the sorted rows, across all pages (0-based). */
  index: number;
  /**
   * The table wraps the title in the row link: the title must not carry a
   * link of its own (a date's proof), which would nest inside it.
   */
  linked: boolean;
}

const present = (node: React.ReactNode) => node !== null && node !== undefined && node !== false;

/**
 * The two lines, shown below `sm` only: the ledger's own cells carry the
 * same values from `sm` up (DataTable hides this record there, and the
 * host cell's desktop value below `sm`). Each link in it keeps a 24px
 * target (WCAG 2.5.8), and a shortened address stays one word
 * (styles/tables.css).
 */
export function PhoneRecord({
  title,
  titleEnd,
  details = [],
  detailsAlign = 'start',
}: PhoneRecordContent) {
  const facts = details.filter(present);
  return (
    <span
      data-slot="phone-record"
      className="flex flex-col gap-1 sm:hidden [&_a]:inline-block [&_a]:min-h-6 [&_a]:leading-6"
    >
      <span className="flex items-center justify-between gap-x-4">
        <span className="min-w-0">{title}</span>
        {present(titleEnd) ? (
          <span className="shrink-0 text-end font-medium text-foreground">{titleEnd}</span>
        ) : null}
      </span>
      {facts.length > 0 ? (
        <span
          className={cn(
            'flex flex-wrap items-baseline gap-x-2 type-body-sm font-normal text-muted-foreground',
            // The second tier's links keep the line's ink until hovered.
            '[&_a]:text-muted-foreground',
            detailsAlign === 'end' && 'justify-end text-end',
          )}
        >
          {facts.map((fact, index) => (
            <React.Fragment key={index}>
              {index > 0 ? (
                <span aria-hidden className="text-subtle">
                  ·
                </span>
              ) : null}
              <span className="min-w-0">{fact}</span>
            </React.Fragment>
          ))}
        </span>
      ) : null}
    </span>
  );
}

/** A loading record at the finished record's two-line height, below `sm` only. */
export function PhoneRecordSkeleton() {
  return (
    <span aria-hidden className="flex flex-col gap-2 py-0.5 sm:hidden">
      <span className="flex items-center justify-between gap-4">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3.5 w-16" />
      </span>
      <Skeleton className="h-3 w-40" />
    </span>
  );
}

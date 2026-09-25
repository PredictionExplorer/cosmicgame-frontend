import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import styles from './Landing.module.css';

export interface NumberedRow {
  key: string;
  /** The row's number ("01", in tabular figures) or its glyph. */
  marker: ReactNode;
  title: string;
  body: string;
}

export interface NumberedRowsProps {
  rows: readonly NumberedRow[];
  /** `ol` for a sequence or a set of rules, `ul` for peers marked by glyphs. */
  as?: 'ol' | 'ul';
  className?: string;
}

/**
 * The landing's one numbered-row pattern, shared by The Art's pipeline
 * stages, the Council's rules and the Verifiability pillars: a marker column,
 * an H3 and one line of body between hairlines, with one gutter, one padding
 * and one title size, so sibling sections read as one system. The Cycle's
 * three steps set the same marker and title type as captions under its
 * drawing (./CycleDiagram.tsx).
 */
export function NumberedRows({ rows, as: List = 'ol', className }: NumberedRowsProps) {
  return (
    <List className={cn(styles.numberedRows, className)}>
      {rows.map((row) => (
        <li key={row.key} className={styles.numberedRow}>
          <span className="type-label pt-1 tabular-nums text-subtle">{row.marker}</span>
          <div className="min-w-0">
            <h3 className="type-heading-3">{row.title}</h3>
            <p className="type-body-sm mt-1.5 text-muted-foreground">{row.body}</p>
          </div>
        </li>
      ))}
    </List>
  );
}

import { Fragment, type ReactNode } from 'react';

/**
 * The items of a page header's meta line ("Guide 3 of 11 · Updated Jun 24,
 * 2026"), one pattern on every reading page: each item on its own, joined by
 * a middot that assistive technology skips. Empty items are dropped, so an
 * optional reading time never leaves a stray separator.
 */
export function MetaItems({ items }: { items: readonly ReactNode[] }) {
  const present = items.filter((item) => item !== null && item !== undefined && item !== false);
  return present.map((item, index) => (
    <Fragment key={index}>
      {index > 0 ? (
        <span aria-hidden="true" className="text-subtle">
          ·
        </span>
      ) : null}
      {item}
    </Fragment>
  ));
}

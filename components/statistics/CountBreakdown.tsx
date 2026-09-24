'use client';

import { Fragment } from 'react';

import { NBSP } from '@/utils/format';
import { useFormat } from '@/hooks/useFormat';

export interface CountPart {
  key: string;
  count: number;
  /** A ticker or token kind, Latin in every locale (ETH, NFT, CST, ERC-20). */
  unit: string;
}

/**
 * Counts by kind on one line: "2 NFT · 1 CST". Each count keeps its unit on
 * its line (a no-break space), zero counts are left out, and the dots are
 * visual only (the pattern `ArtFrame` uses), so no separator is written
 * into the text in any one language's style.
 */
export function CountBreakdown({
  parts,
  className,
}: {
  parts: readonly CountPart[];
  className?: string;
}) {
  const format = useFormat();
  const shown = parts.filter((part) => part.count > 0);
  if (shown.length === 0) return null;
  return (
    <span className={className}>
      {shown.map((part, index) => (
        <Fragment key={part.key}>
          {/* Real spaces around the dot, so a screen reader hears "4 ETH 2 NFT". */}
          {index > 0 ? (
            <>
              {' '}
              <span aria-hidden>·</span>{' '}
            </>
          ) : null}
          <span className="whitespace-nowrap">{`${format.count(part.count)}${NBSP}${part.unit}`}</span>
        </Fragment>
      ))}
    </span>
  );
}

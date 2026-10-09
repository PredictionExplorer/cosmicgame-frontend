import { Fragment } from 'react';

export interface CountPart {
  key: string;
  count: number;
  /**
   * The count in words, from the catalog's plural message ("4 ETH
   * allocations", "1 NFT"), so a count is never read as an amount beside a
   * ticker, and each locale words and orders it itself.
   */
  text: string;
}

/**
 * Counts by kind on one line: "4 ETH allocations · 2 NFTs". Zero counts are
 * left out, each part keeps to one line, and the dots are visual only (the
 * pattern `ArtFrame` uses), so no separator is written into the text in any
 * one language's style.
 */
export function CountBreakdown({
  parts,
  className,
}: {
  parts: readonly CountPart[];
  className?: string;
}) {
  const shown = parts.filter((part) => part.count > 0);
  if (shown.length === 0) return null;
  return (
    <span className={className}>
      {shown.map((part, index) => (
        <Fragment key={part.key}>
          {/* Real spaces around the dot, so a screen reader hears "4 ETH allocations 2 NFTs". */}
          {index > 0 ? (
            <>
              {' '}
              <span aria-hidden>·</span>{' '}
            </>
          ) : null}
          <span className="whitespace-nowrap">{part.text}</span>
        </Fragment>
      ))}
    </span>
  );
}

import type { ReactNode } from 'react';

import { ArtFrame, WallLabel } from '@/components/ui/art-frame';
import { withMonoId } from '@/components/ui/mono-id';
import { cn } from '@/lib/utils';
import { formatId } from '@/utils/format/ids';

import { shortSeed, type SignaturePlateArt } from './signaturePlates';

export interface SignaturePlateCopy {
  /** The artwork's alt text ("Cosmic Signature #000013"). */
  alt: string;
  /** The wall label's first line. */
  title: string;
  /** "Cycle 0" in the locale's own form. */
  cycle: string;
  /** Label before the short seed ("Seed"); the seed line is left out without it. */
  seedLabel?: string;
  /** Caption of the unavailable state ("Artwork unavailable"). */
  unavailable: string;
}

export interface SignaturePlateProps {
  art: SignaturePlateArt;
  copy: SignaturePlateCopy;
  /** The token's detail page on the app host; the title links there. */
  href?: string;
  /** The plate's rendered width at each breakpoint. */
  sizes: string;
  priority?: boolean;
  /** Caption lines after the wall label, e.g. why the piece is here. */
  children?: ReactNode;
  className?: string;
}

/**
 * A real Signature on its black plate at the native ratio, with its wall
 * label underneath: the title (linking to the token), the token number,
 * the cycle and, where the text talks about seeds, the seed itself.
 */
export function SignaturePlate({
  art,
  copy,
  href,
  sizes,
  priority,
  children,
  className,
}: SignaturePlateProps) {
  const number = formatId(art.tokenId);
  // "Cosmic Signature #000013": the number in the identifier face.
  const title = withMonoId(copy.title, number);
  return (
    <figure className={cn('min-w-0', className)}>
      <ArtFrame
        sources={[art.src]}
        alt={copy.alt}
        sizes={sizes}
        priority={priority}
        unavailableLabel={copy.unavailable}
        unavailableDetail={number}
      />
      <WallLabel
        as="figcaption"
        className="mt-3"
        title={
          href ? (
            <a href={href} className="link-quiet">
              {title}
            </a>
          ) : (
            title
          )
        }
        meta={[
          // An unnamed token's title already carries its number.
          copy.title.includes(number) ? null : (
            <span key="number" className="type-mono">
              {number}
            </span>
          ),
          copy.cycle,
          copy.seedLabel ? (
            <span key="seed" className="inline-flex items-baseline gap-1.5">
              {copy.seedLabel}
              <span className="type-mono">{shortSeed(art.seed)}</span>
            </span>
          ) : null,
        ]}
      >
        {children}
      </WallLabel>
    </figure>
  );
}

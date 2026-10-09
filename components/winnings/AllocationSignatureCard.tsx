'use client';

import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { signatureMedia, signatureSources } from '@/components/nft/signatureArt';
import { ArtFrame, PendingPlate, WallLabel } from '@/components/ui/art-frame';

import type { SignatureArtState } from './useSignatureIndex';

export interface AllocationSignatureCardProps {
  tokenId: number;
  /** The token's seed; without one the plate shows the designed unavailable state. */
  seed: string | number | null | undefined;
  /**
   * Whether the seed is known yet. `loading`: a busy pending plate with no
   * caption (the art is on its way, not unavailable). `failed`: the bare
   * plate, while the page says once that the artwork could not be loaded.
   */
  artState?: SignatureArtState;
  /** Line 1 of the wall label: the token's name, or what the token stands for (a role). */
  title: ReactNode;
  /** Where the plate and the title lead. Default: the token's page. */
  href?: string;
  /**
   * Set `false` when the title names something other than the token (a
   * role): it is then plain text, and a link in `meta` leads to the token.
   */
  linkTitle?: boolean;
  titleAs?: 'h2' | 'h3' | 'p';
  /** Line 2: short facts (token number, cycle, date). */
  meta?: readonly ReactNode[];
  /** At most two tags. */
  tags?: ReactNode;
  /** Lines under the label that may hold their own links (a recipient address). */
  children?: ReactNode;
  /** The plate's rendered width, for the rendition choice. */
  sizes: string;
  /** Caption of the pending plate ("Artwork unavailable", "Rendering"). */
  unavailableLabel: string;
  unavailableDetail?: ReactNode;
  /** Above the fold: load eagerly. */
  priority?: boolean;
  /**
   * Join the parent's rows: the parent spans four rows as a subgrid (the
   * plate, the title, the meta line and one line of `children`), so each
   * line of the label starts at the same height across a row of cards even
   * where a neighbour's meta wraps. The grid sets a 4px row gap. Every level
   * keeps a `minmax(0, 1fr)` column, so a long name wraps inside the card
   * instead of widening it past its grid column.
   */
  subgrid?: boolean;
  className?: string;
}

/**
 * A Signature on its black plate with a wall label under it: the one way an
 * allocation page shows a token (a cycle's recipients, a finalized cycle, a
 * participant's Stellar Selection NFTs). Its title is a role or a cycle, not
 * the token's traits: the gallery's wall card is `SignatureCard`
 * (components/nft), a different card with a different job. The plate and the title lead to the same
 * place (the token's page unless `href` says otherwise); the plate is a
 * pointer shortcut only (out of the tab order and hidden from screen
 * readers), so each card is one stop. Nothing is drawn over the art.
 */
export function AllocationSignatureCard({
  tokenId,
  seed,
  artState = 'ready',
  title,
  href = `/detail/${tokenId}`,
  linkTitle = true,
  titleAs = 'p',
  meta,
  tags,
  children,
  sizes,
  unavailableLabel,
  unavailableDetail,
  priority = false,
  subgrid = false,
  className,
}: AllocationSignatureCardProps) {
  return (
    <figure
      className={cn(
        'min-w-0',
        subgrid ? 'row-span-4 grid grid-cols-1 grid-rows-subgrid' : 'flex flex-col gap-3',
        className,
      )}
      data-token-id={tokenId}
    >
      <Link href={href} tabIndex={-1} aria-hidden className={cn('block', subgrid && 'mb-2')}>
        {artState === 'ready' ? (
          <ArtFrame
            sources={signatureSources(signatureMedia(seed))}
            alt=""
            sizes={sizes}
            priority={priority}
            unavailableLabel={unavailableLabel}
            unavailableDetail={unavailableDetail}
          />
        ) : (
          <PendingPlate busy={artState === 'loading'} />
        )}
      </Link>
      <WallLabel
        as="figcaption"
        titleAs={titleAs}
        title={
          linkTitle ? (
            <Link href={href} className="link-quiet">
              {title}
            </Link>
          ) : (
            title
          )
        }
        meta={meta}
        tags={tags}
        className={subgrid ? 'row-span-3 grid grid-cols-1 grid-rows-subgrid' : undefined}
      >
        {children}
      </WallLabel>
    </figure>
  );
}

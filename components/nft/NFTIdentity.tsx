'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils';

import type { NftTraitEntry, RarityInfo } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { WallLabelMeta } from '@/components/ui/art-frame';

import { NFTSpecList, type NFTSpecListProps } from './NFTMetadata';
import { signatureTitle } from './nftName';
import { useTraitLabels } from './traits/useTraitLabels';

export interface NFTIdentityProps {
  tokenId: number;
  /** The token's current name; `null` for an unnamed Signature. */
  name: string | null;
  /** `id` of the H1, for an `aria-labelledby` on the hero around it. */
  titleId?: string;
  nft: NFTSpecListProps['nft'];
  entry?: NftTraitEntry | null;
  rarity?: RarityInfo | null;
  rarityTotal?: number;
  /** The quiet action row: share and the marketplace. */
  actions?: ReactNode;
  className?: string;
}

/**
 * NFTIdentity — the detail page's wall label: the trail to the gallery, the
 * name (or "Cosmic Signature #000025" at full contrast when the token has
 * none), the token number with its structure and palette, then the
 * provenance ledger and a quiet action row. Beside the art from `lg`; below
 * it on phones; a two-column label on tablets. The palette's hue strip lives
 * on its trait tile, where it is labelled.
 */
export function NFTIdentity({
  tokenId,
  name,
  titleId,
  nft,
  entry,
  rarity,
  rarityTotal,
  actions,
  className,
}: NFTIdentityProps) {
  const tCommon = useTranslations('common');
  const tTraits = useTranslations('traits');
  const { valueLabel } = useTraitLabels();
  const id = formatId(tokenId);
  const title = signatureTitle(tTraits, { id, name });

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-6',
        // Tablets: the label and actions on the left, the ledger on the right;
        // the second row takes the ledger's extra height so the actions sit
        // right under the label.
        'md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:grid-rows-[auto_1fr] md:max-lg:items-start md:max-lg:gap-x-10',
        className,
      )}
      data-testid="token-identity"
    >
      {/*
       * The header's `data` variant already sets the H1 in the display face.
       * The trail stops at the gallery: the H1 names the Signature.
       */}
      <PageHeader
        title={title}
        titleId={titleId}
        breadcrumbs={[{ label: tCommon('breadcrumbs.gallery'), href: '/gallery' }]}
        className="mb-0 border-b-0 pb-0 pt-0 sm:mb-0 sm:pb-0 md:max-lg:col-start-1 [&_h1]:[overflow-wrap:anywhere]"
      >
        <WallLabelMeta
          className="mt-3"
          items={[
            // An unnamed Signature already carries its number in the title.
            name ? <span className="tabular-nums">{id}</span> : null,
            entry?.structure ? valueLabel('structure', entry.structure) : null,
            entry?.palette ? valueLabel('palette', entry.palette) : null,
          ]}
        />
      </PageHeader>

      <NFTSpecList
        nft={nft}
        entry={entry}
        rarity={rarity}
        rarityTotal={rarityTotal}
        className="md:max-lg:col-start-2 md:max-lg:row-span-2 md:max-lg:row-start-1"
      />

      {actions ? (
        <div className="flex flex-wrap items-center gap-2 md:max-lg:col-start-1 md:max-lg:row-start-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

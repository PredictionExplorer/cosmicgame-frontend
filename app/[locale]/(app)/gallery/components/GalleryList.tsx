'use client';

import { useMemo } from 'react';
import { Maximize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import type { CollectionTraits } from '@/hooks/useNftTraits';
import type { NftTraitEntry } from '@/lib/nftMetadata';
import { AnchoringIcon } from '@/lib/conceptIcons';
import { ArtFrame } from '@/components/ui/art-frame';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { HueStrip, useTraitLabels } from '@/components/nft/traits';
import { signatureCardSources } from '@/components/nft/SignatureCard';
import { useSignatureAlt } from '@/components/nft/signatureArt';

import type { GalleryNFTData } from './galleryTypes';

interface GalleryListProps {
  items: readonly GalleryNFTData[];
  /** `undefined` while the index loads, `null` when it is unavailable. */
  collectionTraits: CollectionTraits | null | undefined;
  onQuickView?: (tokenId: number) => void;
}

interface ListRow {
  nft: GalleryNFTData;
  entry: NftTraitEntry | null | undefined;
}

/** Imprint time in unix seconds, from whichever field the record carries. */
function imprintTime(nft: GalleryNFTData): number | undefined {
  return nft.MintTimeStamp ?? nft.TimeStamp;
}

/**
 * The gallery as a ledger: a 96px plate, the name and number, and the traits
 * as columns, for readers who compare pieces. The page already sorts and
 * pages the collection, so the table shows the rows it is given as they are.
 */
export function GalleryList({ items, collectionTraits, onQuickView }: GalleryListProps) {
  const t = useTranslations('gallery');
  const tDetail = useTranslations('detail');
  const tTraits = useTranslations('traits');
  const signatureAlt = useSignatureAlt();
  const { valueLabel } = useTraitLabels();

  const rows = useMemo<ListRow[]>(
    () =>
      items.map((nft) => ({
        nft,
        entry:
          collectionTraits === undefined
            ? undefined
            : (collectionTraits?.byId.get(nft.TokenId) ?? null),
      })),
    [items, collectionTraits],
  );

  const trait = (row: ListRow, key: 'structure' | 'palette' | 'spectralClass' | 'fate') => {
    const raw = row.entry?.[key];
    return raw ? valueLabel(key, raw) : null;
  };

  const columns: DataTableColumn<ListRow>[] = [
    {
      // On a phone the picture leads its record, unlabelled (at most 15rem, so
      // the 640px thumbnail still covers it on a 2x screen).
      id: 'artwork',
      header: <span className="sr-only">{t('list.headers.artwork')}</span>,
      label: '',
      stack: true,
      value: (row) => row.nft.TokenId,
      width: '7.5rem',
      cell: (row) => {
        const id = formatId(row.nft.TokenId);
        return (
          <ArtFrame
            sources={signatureCardSources(row.nft.Seed)}
            alt={signatureAlt({ id, name: row.nft.TokenName, entry: row.entry })}
            sizes="(max-width: 639px) 15rem, 96px"
            density="compact"
            unavailableLabel={tDetail('image.artworkUnavailable')}
            className="w-24 max-sm:w-full max-sm:max-w-60"
          />
        );
      },
    },
    {
      id: 'token',
      header: t('list.headers.token'),
      value: (row) => row.nft.TokenName || formatId(row.nft.TokenId),
      cell: (row) => {
        const name = row.nft.TokenName?.trim();
        const id = formatId(row.nft.TokenId);
        return (
          <span className="flex min-w-0 flex-col">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              {name || <span className="tabular-nums">{id}</span>}
              {row.nft.Staked ? (
                <>
                  <AnchoringIcon aria-hidden className="size-3.5 shrink-0 text-subtle" />
                  <span className="sr-only">{tTraits('card.anchoredState')}</span>
                </>
              ) : null}
            </span>
            {name ? <span className="type-mono text-subtle">{id}</span> : null}
          </span>
        );
      },
    },
    {
      id: 'structure',
      header: t('list.headers.structure'),
      value: (row) => trait(row, 'structure'),
    },
    {
      id: 'palette',
      header: t('list.headers.palette'),
      value: (row) => trait(row, 'palette'),
      cell: (row) => (
        // A phone record aligns its values to the end; the strip follows its name.
        <span className="flex min-w-0 flex-col gap-1.5 max-sm:items-end">
          <span>{trait(row, 'palette')}</span>
          <HueStrip hues={row.entry?.hues} size="xs" className="max-w-24" />
        </span>
      ),
    },
    {
      id: 'spectral',
      header: t('list.headers.spectral'),
      value: (row) => trait(row, 'spectralClass'),
      nowrap: true,
    },
    {
      id: 'fate',
      header: t('list.headers.fate'),
      value: (row) => trait(row, 'fate'),
      priority: 'secondary',
    },
    {
      id: 'chaos',
      header: t('list.headers.chaos'),
      kind: 'count',
      value: (row) => row.entry?.chaos ?? null,
      whenBlank: 'empty',
      priority: 'secondary',
    },
    {
      id: 'cycle',
      header: t('list.headers.cycle'),
      kind: 'count',
      value: (row) => row.nft.RoundNum ?? row.entry?.cycle ?? null,
    },
    {
      id: 'imprinted',
      header: t('list.headers.age'),
      kind: 'datetime',
      value: (row) => imprintTime(row.nft) ?? null,
      priority: 'secondary',
    },
  ];

  if (onQuickView) {
    columns.push({
      id: 'quickView',
      header: <span className="sr-only">{tTraits('card.quickView')}</span>,
      label: '',
      align: 'end',
      // A touch opens the detail page from the row; the quick view is for a mouse.
      priority: 'secondary',
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onQuickView(row.nft.TokenId)}
          aria-label={tTraits('card.quickViewAria', { id: formatId(row.nft.TokenId) })}
          data-testid="quick-view-button"
        >
          <Maximize2 aria-hidden />
        </Button>
      ),
    });
  }

  return (
    <div data-testid="gallery-list">
      <DataTable
        data={rows}
        columns={columns}
        ariaLabel={t('view.list')}
        getRowKey={(row) => row.nft.TokenId}
        getRowHref={(row) => `/detail/${row.nft.TokenId}`}
        rowLinkColumn="token"
        pageSize={Infinity}
        layout="cards"
      />
    </div>
  );
}

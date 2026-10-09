'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { DataTable, TableLink, TableTag, type DataTableColumn } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { useSignatureIndex } from '@/components/winnings/useSignatureIndex';

import { TokenCell } from './TokenCell';
import { anchorActionHref } from './anchorLinks';
import type { AnchoringLedgerProps } from './ledgerProps';

interface GlobalAnchorAction {
  EvtLogId: string | number;
  ActionId: number;
  TimeStamp: number;
  TxHash?: string;
  ActionType: number;
  TokenId: number;
  StakerAddr: string;
  NumStakedNFTs: number;
}

interface GlobalAnchorActionsTableProps extends AnchoringLedgerProps {
  list: GlobalAnchorAction[];
  IsRWLK: boolean;
}

/** A release, the exception: anchoring is what nearly every row records. */
function isRelease(action: GlobalAnchorAction): boolean {
  return action.ActionType === 1;
}

/**
 * Every anchor and release across all anchor-holders for one collection,
 * shown by the NFT's artwork, like the anchored-NFT ledger beside it: the
 * NFT, "Action #34" (only a release carries a tag, since nearly every row
 * is an anchor) leading to the action's record, the date as the
 * transaction's proof, and the anchor-holder. A dense ledger of several
 * links a row, so its links keep their ink until hover. On a phone each
 * record is one media object: the art and its number, "Action #34 · Sep 23"
 * beside it, then the holder.
 */
export const GlobalAnchorActionsTable = ({
  list,
  IsRWLK,
  headingLevel = 3,
  ...state
}: GlobalAnchorActionsTableProps) => {
  const t = useTranslations('anchoring');
  const collection = IsRWLK ? 'randomWalk' : 'cosmicSignature';
  // The rows carry no seed: one collection read serves every Cosmic Signature thumbnail.
  const signatures = useSignatureIndex({ enabled: !IsRWLK && list.length > 0 });
  const seedsPending = signatures.state === 'loading';
  const { seedFor } = signatures;

  const columns = useMemo<DataTableColumn<GlobalAnchorAction>[]>(() => {
    const actionLink = (row: GlobalAnchorAction) => (
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        {/* Beside its tag the link is not the whole value: it takes the 24px line itself. */}
        <TableLink
          href={anchorActionHref(collection, row.ActionId)}
          className={TOUCH_TARGET_TEXT_LINK_CLASS}
        >
          {t('anchorActionDetail.breadcrumbs.action', { id: row.ActionId })}
        </TableLink>
        {isRelease(row) ? <TableTag>{t('common.release')}</TableTag> : null}
      </span>
    );
    return [
      {
        id: 'token',
        kind: 'link',
        header: t('tables.globalAnchorActions.headers.tokenId.desktop'),
        // The record's media object (the art and its number) heads a phone record unlabelled.
        label: '',
        value: (row) => row.TokenId,
        stack: true,
        cell: (row) => (
          <TokenCell
            collection={collection}
            tokenId={row.TokenId}
            seed={IsRWLK ? undefined : seedFor(row.TokenId)}
            seedPending={!IsRWLK && seedsPending}
            thumbnail
            phoneCaption={
              <>
                {actionLink(row)}
                {' · '}
                <DateTime timestamp={row.TimeStamp} />
              </>
            }
          />
        ),
      },
      {
        id: 'action',
        kind: 'link',
        header: t('tables.globalAnchorActions.headers.actionType.desktop'),
        value: (row) => row.ActionId,
        cell: actionLink,
        nowrap: true,
        // On a phone the token's caption carries the action and the date.
        priority: 'secondary',
      },
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('tables.globalAnchorActions.headers.anchorDatetime.desktop'),
        label: t('tables.globalAnchorActions.headers.anchorDatetime.mobile'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
        priority: 'secondary',
      },
      {
        id: 'holder',
        kind: 'address',
        header: t('tables.globalAnchorActions.headers.holderAddress.desktop'),
        label: t('tables.globalAnchorActions.headers.holderAddress.mobile'),
        value: (row) => row.StakerAddr,
      },
      {
        id: 'nfts',
        kind: 'count',
        header: t('tables.globalAnchorActions.headers.nftCount.desktop'),
        label: t('tables.globalAnchorActions.headers.nftCount.mobile'),
        help: t('tables.globalAnchorActions.headers.nftCount.tooltip'),
        value: (row) => row.NumStakedNFTs,
        // A running total: the record's NFT, action and holder come first on a phone.
        priority: 'secondary',
      },
    ];
  }, [IsRWLK, collection, seedFor, seedsPending, t]);

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('tables.globalAnchorActions.label')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('common.empty.actions.title')}
      emptyDescription={t('common.empty.actions.description')}
      tableClassName="sm:min-w-[44rem] lg:min-w-0"
      headingLevel={headingLevel}
      layout="cards"
      links="quiet"
      {...state}
    />
  );
};

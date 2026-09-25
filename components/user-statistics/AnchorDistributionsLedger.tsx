'use client';

import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format';
import { useAnchorActions } from '@/hooks/useAnchorActions';
import { Link } from '@/i18n/navigation';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { DataTable, TableLink, type DataTableColumn } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import { TokenCell } from '@/components/anchoring/TokenCell';
import { ReleaseConfirmDialog } from '@/components/anchoring/ReleaseConfirmDialog';
import { tokenDistributionsHref } from '@/components/anchoring/anchorLinks';
import { unretrievedActionIds } from '@/components/anchoring/UnretrievedCSTAnchorDistributionsTable';

import type { AnchoredNftDistributions, NftDeposit } from './anchorLedger';

export interface AnchorDistributionsLedgerProps {
  address: string;
  rows: readonly AnchoredNftDistributions[];
  /** The address's by-deposit read, which names the anchors still owed ETH. */
  deposits: readonly unknown[];
  /** Seeds of the Signatures the page already read (held and anchored), for the plates. */
  seeds: ReadonlyMap<number, string>;
  /** The connected wallet's own profile: offers "Release all and retrieve". */
  canRelease: boolean;
  /** The heading level of the ledger's own heading, for its states. */
  headingLevel?: 3 | 4;
}

/**
 * The deposits one anchored NFT shared in, under its ledger row: when each
 * was made and in which cycle, the whole deposit and how many NFTs shared it,
 * this NFT's part and whether it was retrieved. Ends with a link to the NFT's
 * full record.
 */
function NftDeposits({
  address,
  tokenId,
  deposits,
}: {
  address: string;
  tokenId: number;
  deposits: readonly NftDeposit[];
}) {
  const t = useTranslations('anchoring');
  const tCommon = useTranslations('common');
  const columns = useMemo<DataTableColumn<NftDeposit>[]>(
    () => [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('distributionsByToken.columns.depositDatetime'),
        value: (row) => row.timestamp,
        txHash: (row) => row.txHash,
      },
      {
        id: 'cycle',
        kind: 'link',
        header: t('distributionsByToken.columns.cycle'),
        value: (row) => row.cycle,
        cell: (row) =>
          row.cycle === null ? null : (
            <TableLink href={`/allocation/${row.cycle}`}>
              {tCommon('pageHeader.crumbs.cycle', { cycle: row.cycle })}
            </TableLink>
          ),
        nowrap: true,
      },
      {
        id: 'deposit',
        kind: 'amount',
        header: t('tables.distributionsByDeposit.columns.totalDepositAmount'),
        value: (row) => row.depositEth,
        showUnit: false,
        priority: 'secondary',
      },
      {
        id: 'anchored',
        kind: 'count',
        header: t('tables.distributionsByDeposit.columns.totalAnchoredNfts'),
        value: (row) => row.anchoredNfts,
        priority: 'secondary',
      },
      {
        id: 'retrieved',
        kind: 'text',
        header: t('distributionsByToken.columns.retrieved'),
        value: (row) => (row.retrieved ? t('common.yes') : t('common.no')),
        nowrap: true,
      },
      {
        id: 'distribution',
        kind: 'amount',
        header: t('distributionsByToken.columns.distributionEth'),
        value: (row) => row.distributionEth,
        showUnit: false,
      },
    ],
    [t, tCommon],
  );

  return (
    <div className="space-y-3 py-2">
      <DataTable
        data={deposits}
        columns={columns}
        ariaLabel={t('distributionsByToken.label')}
        getRowKey={(row) => row.depositId}
        density="compact"
        width="fill"
      />
      <Link
        href={tokenDistributionsHref(address, tokenId)}
        className="link-quiet inline-flex min-h-6 items-center gap-1.5 type-body-sm"
      >
        {t('distributionsByToken.title', { id: formatId(tokenId) })}
        <ArrowRight aria-hidden className="size-3.5 text-subtle" />
      </Link>
    </div>
  );
}

/**
 * An address's ETH Anchor Distributions, one row per anchored Cosmic
 * Signature NFT: the artwork, when it was anchored, what it has retrieved
 * and what is left to retrieve. A row opens onto the deposits it shared in.
 * When nothing has been retrieved the ledger says so in its caption, not
 * with a second empty ledger. On the connected wallet's own profile it ends
 * with the total to retrieve and "Release all and retrieve", which goes
 * through ReleaseConfirmDialog because releasing is permanent.
 */
export function AnchorDistributionsLedger({
  address,
  rows,
  deposits,
  seeds,
  canRelease,
  headingLevel = 4,
}: AnchorDistributionsLedgerProps) {
  const t = useTranslations('anchoring');
  const tPages = useTranslations('myPages');
  const { release, txStage } = useAnchorActions();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const toRetrieveEth = rows.reduce((sum, row) => sum + row.toRetrieveEth, 0);
  const nothingRetrieved = rows.length > 0 && rows.every((row) => row.retrievedEth === 0);
  const actionIds = useMemo(() => unretrievedActionIds(deposits), [deposits]);
  const canReleaseAll = canRelease && toRetrieveEth > 0 && actionIds.length > 0;

  const columns = useMemo<DataTableColumn<AnchoredNftDistributions>[]>(
    () => [
      {
        id: 'nft',
        kind: 'link',
        header: t('tables.tokenDistributions.columns.tokenId'),
        value: (row) => row.tokenId,
        cell: (row) => (
          <TokenCell
            collection="cosmicSignature"
            tokenId={row.tokenId}
            seed={seeds.get(row.tokenId)}
            thumbnail
            // The Anchored column drops out on a phone; its date rides under the number.
            phoneCaption={row.anchoredAt ? <DateTime timestamp={row.anchoredAt} /> : undefined}
          />
        ),
      },
      {
        id: 'anchored',
        kind: 'datetime',
        header: t('tables.globalAnchoredTokens.headers.anchorDatetime.desktop'),
        value: (row) => row.anchoredAt,
        priority: 'secondary',
      },
      {
        id: 'retrieved',
        kind: 'amount',
        header: t('tables.tokenDistributions.columns.retrievedEth'),
        value: (row) => row.retrievedEth,
        showUnit: false,
        sortable: true,
      },
      {
        id: 'toRetrieve',
        kind: 'amount',
        header: t('tables.tokenDistributions.columns.retrievableEth'),
        value: (row) => row.toRetrieveEth,
        showUnit: false,
        sortable: true,
      },
    ],
    [seeds, t],
  );

  const releaseAll = async () => {
    const result = await release(actionIds, false);
    if (result.status === 'confirmed') setConfirmOpen(false);
  };

  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        ariaLabel={t('tables.tokenDistributions.label')}
        getRowKey={(row) => row.tokenId}
        renderDetails={(row) =>
          row.deposits.length > 0 ? (
            <NftDeposits address={address} tokenId={row.tokenId} deposits={row.deposits} />
          ) : null
        }
        detailsLabel={(_row, expanded) =>
          expanded
            ? tPages('statistics.anchoring.hideDeposits')
            : tPages('statistics.anchoring.showDeposits')
        }
        detailsHeader={tPages('statistics.anchoring.depositsHeader')}
        caption={nothingRetrieved ? tPages('statistics.anchoring.nothingRetrieved') : undefined}
        emptyTitle={t('common.empty.distributions.title')}
        emptyDescription={t('common.empty.distributions.description')}
        headingLevel={headingLevel}
      />

      {canReleaseAll ? (
        <div className="mt-6 flex flex-col gap-4 border-t border-rule-faint pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="type-label text-subtle">{t('tables.unretrievedDistributions.summary')}</p>
            <p className="type-figure-md text-foreground">
              <Amount value={toRetrieveEth} unit="ETH" context="card" />
            </p>
          </div>
          <ChainGuard explain={false}>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              {t('tables.unretrievedDistributions.releaseAll')}
            </Button>
          </ChainGuard>
        </div>
      ) : null}

      {canRelease ? (
        <ReleaseConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          collection="cosmicSignature"
          count={actionIds.length}
          retrievableEth={toRetrieveEth}
          onConfirm={releaseAll}
          stage={txStage}
        />
      ) : null}
    </>
  );
}

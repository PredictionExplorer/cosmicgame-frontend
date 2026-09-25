'use client';

import { useMemo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format';
import { useFormat } from '@/hooks/useFormat';
import { useAnchorDistributionsByUserByTokenDetails, useCSTInfo } from '@/hooks/useApiQuery';
import { Link } from '@/i18n/navigation';
import { PageHeader, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { useParticipantTrail } from '@/components/layout/participantTrail';
import { AddressChip } from '@/components/ui/address-chip';
import { WallLabel } from '@/components/ui/art-frame';
import { Amount } from '@/components/ui/amount';
import { buttonVariants } from '@/components/ui/button';
import {
  DataTable,
  TableLink,
  TxProofLink,
  type DataTableColumn,
} from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { PageShell } from '@/components/ui/page-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { TokenPlate } from '@/components/anchoring/TokenPlate';
import { anchorActionHref } from '@/components/anchoring/anchorLinks';

interface AnchorRecord {
  ActionId?: number;
  EvtLogId?: number;
  TxHash?: string;
  TimeStamp?: number;
  NumStakedNFTs?: number;
  RewardAmountEth?: number;
}

/** One ETH Anchor Distribution deposit the NFT shared in, with its anchor and release. */
interface TokenDeposit {
  DepositId: number;
  DepositTimeStamp: number;
  RoundNum: number;
  RewardEth: number;
  Claimed: boolean;
  Stake: AnchorRecord | null;
  Unstake: AnchorRecord | null;
}

/** The deposits of the details payload, which arrive as an object keyed "0", "1", … */
export function depositsFromDetails(details: Record<string, unknown> | null | undefined) {
  if (!details) return [];
  return Object.keys(details)
    .filter((key) => /^\d+$/.test(key))
    .map((key) => details[key])
    .filter((item): item is TokenDeposit => Boolean(item) && typeof item === 'object');
}

/**
 * Every ETH Anchor Distribution deposit one anchored Cosmic Signature NFT
 * shared in, for one anchor-holder: the artwork and its holder, the totals,
 * and one row per deposit that opens onto its anchor and release.
 */
function RewardsByTokenPage({ address, tokenId }: { address: string; tokenId: number }) {
  const t = useTranslations('anchoring');
  const tCommon = useTranslations('common');
  const format = useFormat();
  const query = useAnchorDistributionsByUserByTokenDetails(address, tokenId);
  const token = useCSTInfo(tokenId);
  const participantTrail = useParticipantTrail(address);
  const deposits = useMemo(() => depositsFromDetails(query.data), [query.data]);

  const totals = useMemo(() => {
    let distributed = 0;
    let unretrieved = 0;
    for (const deposit of deposits) {
      distributed += deposit.RewardEth ?? 0;
      if (!deposit.Claimed) unretrieved += deposit.RewardEth ?? 0;
    }
    return { distributed, unretrieved };
  }, [deposits]);

  const pending = <Skeleton className="h-7 w-20" />;
  const unread = query.isError;
  const figures: PageHeaderFigure[] = [
    {
      id: 'deposits',
      label: t('distributionsByToken.figures.deposits'),
      value: query.isLoading ? pending : unread ? null : format.count(deposits.length),
    },
    {
      id: 'distributed',
      label: t('distributionsByToken.figures.distributed'),
      value: query.isLoading ? (
        pending
      ) : unread ? null : (
        <Amount value={totals.distributed} unit="ETH" context="card" />
      ),
    },
    {
      id: 'unretrieved',
      label: t('distributionsByToken.figures.unretrieved'),
      value: query.isLoading ? (
        pending
      ) : unread ? null : (
        <Amount value={totals.unretrieved} unit="ETH" context="card" />
      ),
      caption: t('distributionsByToken.figures.unretrievedCaption'),
    },
  ];

  const columns = useMemo<DataTableColumn<TokenDeposit>[]>(
    () => [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('distributionsByToken.columns.depositDatetime'),
        value: (row) => row.DepositTimeStamp,
      },
      {
        id: 'cycle',
        kind: 'link',
        header: t('distributionsByToken.columns.cycle'),
        value: (row) => row.RoundNum,
        // "Cycle 1", not a bare "1": a word-sized link, as every other ledger names a cycle.
        cell: (row) => (
          <TableLink href={`/allocation/${row.RoundNum}`}>
            {tCommon('pageHeader.crumbs.cycle', { cycle: row.RoundNum })}
          </TableLink>
        ),
        nowrap: true,
      },
      {
        id: 'deposit',
        kind: 'text',
        header: t('distributionsByToken.columns.depositId'),
        value: (row) => row.DepositId,
        nowrap: true,
        cellClassName: 'font-mono tabular-nums',
        priority: 'secondary',
      },
      {
        id: 'retrieved',
        kind: 'text',
        header: t('distributionsByToken.columns.retrieved'),
        value: (row) => (row.Claimed ? t('common.yes') : t('common.no')),
        nowrap: true,
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('distributionsByToken.columns.distributionEth'),
        value: (row) => row.RewardEth,
        showUnit: false,
        sortable: true,
      },
    ],
    [t, tCommon],
  );

  const tokenName = token.data?.TokenName?.trim() || null;
  const tokenTitle = tokenName ?? t('art.signatureTitle', { id: formatId(tokenId) });
  // An NFT with no deposit yet: the ledger's empty state says so once; zero figures above it
  // would repeat it.
  const noDeposits = !query.isLoading && !query.isError && deposits.length === 0;

  return (
    <PageShell variant="data">
      <PageHeader
        section="explore"
        breadcrumbs={participantTrail}
        title={t('distributionsByToken.title', { id: formatId(tokenId) })}
        subtitle={t('distributionsByToken.subtitle')}
        figures={noDeposits ? undefined : figures}
      />

      <div className="mb-10 flex flex-col gap-5 border-b border-rule-faint pb-8 sm:flex-row sm:items-center sm:gap-6">
        {/* The plate spans the column on a phone, and sits beside its label from `sm`. */}
        <Link href={`/detail/${tokenId}`} className="block w-full shrink-0 sm:w-48">
          <TokenPlate
            collection="cosmicSignature"
            tokenId={tokenId}
            alt=""
            sizes="(min-width: 640px) 12rem, 100vw"
          />
          <span className="sr-only">{tokenTitle}</span>
        </Link>
        <WallLabel
          title={tokenTitle}
          meta={[
            // An unnamed token's title already carries its number (as on its anchor actions).
            tokenName ? (
              <span key="id" className="font-mono">
                {formatId(tokenId)}
              </span>
            ) : null,
            typeof token.data?.RoundNum === 'number'
              ? t('picker.cycle', { cycle: token.data.RoundNum })
              : null,
          ]}
        >
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 type-body-sm text-muted-foreground">
            <span className="type-label text-subtle">{t('distributionsByToken.holder')}</span>
            <AddressChip address={address} variant="plain" />
          </p>
        </WallLabel>
      </div>

      <DataTable
        data={deposits}
        columns={columns}
        ariaLabel={t('distributionsByToken.label')}
        getRowKey={(row) => row.DepositId}
        loading={query.isLoading}
        error={query.isError ? t('distributionsByToken.error') : undefined}
        onRetry={() => void query.refetch()}
        renderDetails={(row) => <DepositAnchorDetails deposit={row} />}
        detailsLabel={(_row, expanded) =>
          expanded ? t('distributionsByToken.details.hide') : t('distributionsByToken.details.show')
        }
        emptyTitle={t('distributionsByToken.empty.title')}
        emptyDescription={t('distributionsByToken.empty.description')}
        emptyAction={
          <Link href="/anchoring" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            {t('distributionsByToken.empty.action')}
          </Link>
        }
      />
    </PageShell>
  );
}

/** The anchor behind a deposit and, once it ended, the release that retrieved the ETH. */
function DepositAnchorDetails({ deposit }: { deposit: TokenDeposit }) {
  const t = useTranslations('anchoring');
  const format = useFormat();
  const { Stake: anchor, Unstake: release } = deposit;
  const released = Boolean(release?.EvtLogId);

  return (
    <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
      {anchor ? (
        <DetailGroup title={t('distributionsByToken.details.anchorTitle')}>
          <DetailLine label={t('distributionsByToken.details.anchoredDatetime')}>
            <ProvenDate action={anchor} />
          </DetailLine>
          <DetailLine label={t('distributionsByToken.details.anchoredNfts')}>
            {format.count(anchor.NumStakedNFTs ?? 0)}
          </DetailLine>
          {typeof anchor.ActionId === 'number' ? (
            <DetailLine label={t('distributionsByToken.details.action')}>
              <Link href={anchorActionHref('cosmicSignature', anchor.ActionId)} className="link">
                {t('anchorActionDetail.breadcrumbs.action', { id: anchor.ActionId })}
              </Link>
            </DetailLine>
          ) : null}
        </DetailGroup>
      ) : null}
      {released && release ? (
        <DetailGroup title={t('distributionsByToken.details.releaseTitle')}>
          <DetailLine label={t('distributionsByToken.details.releasedDatetime')}>
            <ProvenDate action={release} />
          </DetailLine>
          <DetailLine label={t('distributionsByToken.details.distribution')}>
            <Amount value={release.RewardAmountEth ?? 0} unit="ETH" context="card" />
          </DetailLine>
        </DetailGroup>
      ) : (
        <p className="self-center type-body-sm text-muted-foreground">
          {t('distributionsByToken.details.stillAnchored')}
        </p>
      )}
    </div>
  );
}

function ProvenDate({ action }: { action: AnchorRecord }) {
  const date = <DateTime timestamp={action.TimeStamp} />;
  return action.TxHash ? <TxProofLink hash={action.TxHash}>{date}</TxProofLink> : date;
}

function DetailGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-2">
      <p className="type-label font-semibold text-foreground">{title}</p>
      <dl className="space-y-1.5">{children}</dl>
    </div>
  );
}

function DetailLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="type-caption text-subtle">{label}</dt>
      <dd className="type-body-sm tabular-nums text-foreground">{children}</dd>
    </div>
  );
}

export default RewardsByTokenPage;

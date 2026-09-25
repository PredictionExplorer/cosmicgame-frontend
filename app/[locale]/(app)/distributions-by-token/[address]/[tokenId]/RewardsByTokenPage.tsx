'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { distributionPerAnchoredNft } from '@/utils/anchoringStats';
import { formatAddress, formatId } from '@/utils/format';
import { useFormat } from '@/hooks/useFormat';
import {
  useAnchorDistributionsByUserByTokenDetails,
  useCSTAnchorActionsByUser,
  useCSTInfo,
  useDashboardInfo,
} from '@/hooks/useApiQuery';
import { Link } from '@/i18n/navigation';
import type { AnchorAction } from '@/services/api/types';
import {
  PageHeader,
  PageHeaderFigures,
  type PageHeaderFigure,
} from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { WallLabel } from '@/components/ui/art-frame';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { DataTable, TxProofLink, type DataTableColumn } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { PageShell } from '@/components/ui/page-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { SpecList, SpecRow } from '@/components/ui/spec-list';
import { UnknownValue } from '@/components/ui/unknown-value';
import { TokenPlate } from '@/components/anchoring/TokenPlate';
import { anchorActionHref } from '@/components/anchoring/anchorLinks';
import { useCycleCell } from '@/components/tables/useCycleCell';

/** One ETH Anchor Distribution deposit the NFT shared in. */
interface TokenDeposit {
  DepositId: number;
  DepositTimeStamp: number;
  RoundNum: number;
  RewardEth: number;
  Claimed: boolean;
}

/** The deposits of the details payload, which arrive as an object keyed "0", "1", … */
export function depositsFromDetails(details: Record<string, unknown> | null | undefined) {
  if (!details) return [];
  return Object.keys(details)
    .filter((key) => /^\d+$/.test(key))
    .map((key) => details[key])
    .filter((item): item is TokenDeposit => Boolean(item) && typeof item === 'object');
}

/** Where one NFT's anchor stands for one anchor-holder. */
export interface TokenAnchorState {
  /** The anchor action, or `null` when this address never anchored the NFT. */
  anchor: AnchorAction | null;
  /** The release, or `null` while the NFT is still anchored. */
  release: AnchorAction | null;
}

/**
 * The NFT's anchor and release among the anchor-holder's actions. An NFT can
 * be anchored only once, so there is at most one of each.
 */
export function tokenAnchorState(
  actions: readonly AnchorAction[],
  tokenId: number,
): TokenAnchorState {
  const ofToken = actions.filter((action) => action.TokenId === tokenId);
  return {
    anchor: ofToken.find((action) => action.ActionType === 0) ?? null,
    release: ofToken.find((action) => action.ActionType === 1) ?? null,
  };
}

/** A date that is its transaction's proof: the explorer link when the hash is known. */
function ProvenDate({ action }: { action: AnchorAction }) {
  const date = <DateTime timestamp={action.TimeStamp} year="always" />;
  return action.TxHash ? <TxProofLink hash={action.TxHash}>{date}</TxProofLink> : date;
}

/**
 * Every ETH Anchor Distribution deposit one anchored Cosmic Signature NFT
 * shared in, for one anchor-holder. The artwork leads, and beside it, once,
 * what the page is about: the totals (with what the NFT would receive now,
 * while it is still anchored) and where its anchor stands: when it was
 * anchored and by which action, and whether it is still anchored or was
 * released and what that retrieved. The deposit ledger follows, one row per
 * deposit, without repeating that one anchor on every row. The page sits
 * under the Anchor Distributions records, by anchor-holder.
 */
function RewardsByTokenPage({ address, tokenId }: { address: string; tokenId: number }) {
  const t = useTranslations('anchoring');
  const format = useFormat();
  const query = useAnchorDistributionsByUserByTokenDetails(address, tokenId);
  const actionsQuery = useCSTAnchorActionsByUser(address);
  const token = useCSTInfo(tokenId);
  const dashboard = useDashboardInfo();
  const cycleCell = useCycleCell();
  const deposits = useMemo(() => depositsFromDetails(query.data), [query.data]);
  const anchorState = useMemo(
    () => (actionsQuery.data ? tokenAnchorState(actionsQuery.data, tokenId) : null),
    [actionsQuery.data, tokenId],
  );

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
  const stillAnchored = anchorState?.anchor != null && anchorState.release === null;
  const perNft = distributionPerAnchoredNft(
    dashboard.data?.StakingAmountEth,
    dashboard.data?.MainStats?.StakeStatisticsCST?.TotalTokensStaked,
  );
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
      caption: stillAnchored ? t('distributionsByToken.figures.unretrievedCaption') : undefined,
    },
  ];
  // What the next deposit would bring it: only an NFT that is still anchored shares in it.
  if (stillAnchored) {
    figures.push({
      id: 'perNft',
      label: t('flow.cosmicSignature.perNft.label'),
      info: t('flow.cosmicSignature.perNft.definition'),
      value: dashboard.isLoading ? (
        pending
      ) : perNft.status === 'available' ? (
        <Amount value={perNft.perNftEth} unit="ETH" context="card" />
      ) : null,
      caption: t('flow.cosmicSignature.perNft.caption'),
    });
  }

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
        cell: (row) => cycleCell(row.RoundNum),
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
    [cycleCell, t],
  );

  const tokenName = token.data?.TokenName?.trim() || null;
  const tokenTitle = tokenName ?? t('art.signatureTitle', { id: formatId(tokenId) });
  const anchorAction = anchorState?.anchor ?? null;

  return (
    <PageShell variant="data">
      {/* A public record: it sits under the Anchor Distributions records, by anchor-holder. */}
      <PageHeader
        section="records"
        breadcrumbs={[
          { label: t('overview.title'), href: '/anchoring' },
          { label: formatAddress(address), href: `/user/${address}`, mono: true },
        ]}
        // A long title balances its lines instead of leaving one word on the last.
        title={
          <span className="block text-balance">
            {t('distributionsByToken.title', { id: formatId(tokenId) })}
          </span>
        }
        subtitle={t('distributionsByToken.subtitle')}
      />

      <section
        aria-label={tokenTitle}
        className="mb-10 grid gap-x-10 gap-y-8 border-b border-rule-faint pb-10 sm:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]"
      >
        <figure className="min-w-0">
          {/* A pointer shortcut; the wall label's title names the same page. */}
          <Link href={`/detail/${tokenId}`} tabIndex={-1} aria-hidden className="block">
            <TokenPlate
              collection="cosmicSignature"
              tokenId={tokenId}
              alt=""
              sizes="(min-width: 1024px) 16rem, (min-width: 640px) 12rem, 100vw"
              priority
            />
          </Link>
          <WallLabel
            as="figcaption"
            className="mt-3"
            title={
              <Link href={`/detail/${tokenId}`} className="link-quiet">
                {tokenTitle}
              </Link>
            }
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
          />
        </figure>

        <div className="min-w-0 space-y-8">
          {/* A wrapper keeps the column's rhythm: the strip's own negative margin would cancel it. */}
          <div>
            <PageHeaderFigures figures={figures} className="mt-0 sm:mt-0" />
          </div>

          <SpecList density="dense">
            <SpecRow density="dense" label={t('distributionsByToken.holder')}>
              <AddressChip address={address} variant="plain" />
            </SpecRow>
            <AnchorStateRows
              loading={actionsQuery.isLoading}
              failed={actionsQuery.isError && !actionsQuery.data}
              state={anchorState}
            />
          </SpecList>
        </div>
      </section>

      <DataTable
        data={deposits}
        columns={columns}
        ariaLabel={t('distributionsByToken.label')}
        getRowKey={(row) => row.DepositId}
        loading={query.isLoading}
        error={query.isError ? t('distributionsByToken.error') : undefined}
        onRetry={() => void query.refetch()}
        emptyTitle={t('distributionsByToken.empty.title')}
        emptyDescription={t('distributionsByToken.empty.description')}
        emptyAction={
          anchorAction ? (
            <Link
              href={anchorActionHref('cosmicSignature', anchorAction.ActionId)}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              {t('distributionsByToken.empty.viewAction', { id: anchorAction.ActionId })}
              <ArrowRight aria-hidden />
            </Link>
          ) : (
            <Link href="/anchoring" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              {t('distributionsByToken.empty.action')}
            </Link>
          )
        }
      />
    </PageShell>
  );
}

/**
 * Where the NFT's anchor stands, as spec rows: its status, when it was
 * anchored (the transaction's proof) and by which action, then, once it was
 * released, when and what the release retrieved. Unread, it says so.
 */
function AnchorStateRows({
  loading,
  failed,
  state,
}: {
  loading: boolean;
  failed: boolean;
  state: TokenAnchorState | null;
}) {
  const t = useTranslations('anchoring');
  const label = t('distributionsByToken.anchor.status');
  if (loading) {
    return (
      <SpecRow density="dense" label={label}>
        <Skeleton className="h-5 w-28" />
      </SpecRow>
    );
  }
  if (failed || state === null) {
    return (
      <SpecRow density="dense" label={label}>
        <UnknownValue label={t('flow.unavailable')} />
      </SpecRow>
    );
  }
  const { anchor, release } = state;
  if (!anchor) {
    return (
      <SpecRow density="dense" label={label}>
        <span className="text-muted-foreground">
          {t('distributionsByToken.anchor.notAnchored')}
        </span>
      </SpecRow>
    );
  }
  return (
    <>
      <SpecRow density="dense" label={label}>
        {release ? (
          <Badge tone="neutral">{t('status.released')}</Badge>
        ) : (
          <Badge tone="positive" dot>
            {t('anchorActionDetail.timeline.stillAnchored')}
          </Badge>
        )}
      </SpecRow>
      <SpecRow density="dense" label={t('distributionsByToken.details.anchoredDatetime')}>
        <ProvenDate action={anchor} />
      </SpecRow>
      <SpecRow density="dense" label={t('distributionsByToken.details.action')}>
        <Link href={anchorActionHref('cosmicSignature', anchor.ActionId)} className="link">
          {t('anchorActionDetail.breadcrumbs.action', { id: anchor.ActionId })}
        </Link>
      </SpecRow>
      {release ? (
        <>
          <SpecRow density="dense" label={t('distributionsByToken.details.releasedDatetime')}>
            <ProvenDate action={release} />
          </SpecRow>
          {typeof release.RewardAmountEth === 'number' ? (
            <SpecRow density="dense" label={t('distributionsByToken.details.distribution')}>
              <Amount value={release.RewardAmountEth} unit="ETH" context="card" />
            </SpecRow>
          ) : null}
        </>
      ) : null}
    </>
  );
}

export default RewardsByTokenPage;

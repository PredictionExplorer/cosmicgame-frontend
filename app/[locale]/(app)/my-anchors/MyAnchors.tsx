'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { distributionPerAnchoredNft } from '@/utils/anchoringStats';
import { IDLE_TX_STAGE, isTxBusy, type TxStage } from '@/lib/txStage';
import type { TxResult } from '@/hooks/useTxFlow';
import { useFormat } from '@/hooks/useFormat';
import { useActiveWeb3React } from '@/hooks/web3';
import { useAnchorActions } from '@/hooks/useAnchorActions';
import {
  useAnchorDistributionsByUser,
  useCSTAnchorActionsByUser,
  useCSTTokensByUser,
  useDashboardInfo,
  useRWLKAnchorActionsByUser,
  useRWLKAnchorImprintsByUser,
} from '@/hooks/useApiQuery';
import { useAnchoredToken } from '@/contexts/AnchoredTokenContext';
import { PageHeader, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { Amount } from '@/components/ui/amount';
import { PageShell } from '@/components/ui/page-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';
import { CSTAnchoringPanel, CST_GRIDS } from '@/components/anchoring/CSTAnchoringPanel';
import { RWLKAnchoringPanel, RWLK_GRIDS } from '@/components/anchoring/RWLKAnchoringPanel';

/**
 * The connected wallet's anchoring desk: its anchored and anchorable NFTs of
 * both collections, chosen by their artwork, with the figures that matter to
 * an anchor-holder in the header.
 */
const MyAnchors = () => {
  const t = useTranslations('myPages');
  const tWallet = useTranslations('wallet');
  const { account } = useActiveWeb3React();
  const { anchor, release, handleError, rwalkContract, txStage } = useAnchorActions();

  const dashboard = useDashboardInfo();
  const cstActions = useCSTAnchorActionsByUser(account);
  const cstTokens = useCSTTokensByUser(account);
  const distributions = useAnchorDistributionsByUser(account);
  const rwlkActions = useRWLKAnchorActionsByUser(account);
  const rwlkImprints = useRWLKAnchorImprintsByUser(account);
  const {
    cstokens: anchoredCst,
    rwlktokens: anchoredRwlk,
    isLoading: anchoredLoading,
  } = useAnchoredToken();

  const loading =
    cstActions.isLoading ||
    cstTokens.isLoading ||
    distributions.isLoading ||
    rwlkActions.isLoading ||
    rwlkImprints.isLoading ||
    anchoredLoading;

  // An NFT that was released can never be anchored again, so it is not offered.
  const availableCst = useMemo(
    () => (cstTokens.data ?? []).filter((token) => !token.WasUnstaked),
    [cstTokens.data],
  );

  // One wallet flow at a time: the grid that started it shows its progress.
  const [txOwner, setTxOwner] = useState<string | null>(null);
  const stageFor = useCallback(
    (gridId: string): TxStage => (gridId === txOwner ? txStage : IDLE_TX_STAGE),
    [txOwner, txStage],
  );
  const walletBusy = isTxBusy(txStage);
  const runFor =
    (gridId: string, action: (ids: number[]) => Promise<TxResult>) => (ids: number[]) => {
      setTxOwner(gridId);
      return action(ids);
    };

  // Random Walk NFTs in the wallet that have never been anchored, read from the contract.
  // Kept per account, so switching wallets never shows the previous wallet's NFTs.
  const [rwlkOwned, setRwlkOwned] = useState<{
    account: string;
    ids: readonly number[];
  } | null>(null);
  const rwlkAvailable = account && rwlkOwned?.account === account ? rwlkOwned.ids : null;
  const rwlkActionList = rwlkActions.data;
  useEffect(() => {
    if (!account || !rwalkContract) return;
    let cancelled = false;
    const read = async () => {
      try {
        const owned = (await rwalkContract.read.walletOfOwner?.([account])) as
          | readonly bigint[]
          | undefined;
        const everAnchored = new Set([
          ...anchoredRwlk.map((row) => row.StakedTokenId),
          ...(rwlkActionList ?? []).map((action) => action.TokenId),
        ]);
        const ids = (owned ?? [])
          .map(Number)
          .filter((id) => !everAnchored.has(id))
          .sort((a, b) => a - b);
        if (!cancelled) setRwlkOwned({ account, ids });
      } catch (err) {
        if (!cancelled) setRwlkOwned({ account, ids: [] });
        handleError(err);
      }
    };
    void read();
    return () => {
      cancelled = true;
    };
  }, [account, rwalkContract, anchoredRwlk, rwlkActionList, handleError]);

  const unretrievedEth = useMemo(() => {
    if (!distributions.data) return null;
    return distributions.data.reduce((sum, row) => sum + (row.RewardToCollectEth ?? 0), 0);
  }, [distributions.data]);

  const perNft = distributionPerAnchoredNft(
    dashboard.data?.StakingAmountEth,
    dashboard.data?.MainStats?.StakeStatisticsCST?.TotalTokensStaked,
  );

  // How many NFTs each collection has anchored is on its tab, so the header
  // keeps only the figures no tab shows.
  const pending = <Skeleton className="h-7 w-20" />;
  const figures: PageHeaderFigure[] | undefined = account
    ? [
        {
          id: 'unretrieved',
          label: t('anchors.stats.unretrieved.label'),
          value: distributions.isLoading ? (
            pending
          ) : unretrievedEth === null ? null : (
            <Amount value={unretrievedEth} unit="ETH" context="card" />
          ),
          info: t('anchors.stats.unretrieved.tooltip'),
          caption: t('anchors.stats.unretrieved.caption'),
        },
        {
          id: 'distributionPerNft',
          label: t('anchors.stats.distributionPerNft.label'),
          value: dashboard.isLoading ? (
            pending
          ) : perNft.status === 'available' ? (
            <Amount value={perNft.perNftEth} unit="ETH" context="card" />
          ) : null,
          info: t('anchors.stats.distributionPerNft.tooltip'),
          caption:
            perNft.status === 'noneAnchored'
              ? t('anchors.stats.distributionPerNft.noneAnchored')
              : undefined,
        },
      ]
    : undefined;

  return (
    <PageShell variant="data" backdrop="subtle">
      <PageHeader
        section="account"
        title={t('anchors.title')}
        subtitle={t('anchors.subtitle')}
        figures={figures}
      />

      {!account ? (
        <WalletRequiredState
          title={tWallet('required.anchors.title')}
          description={tWallet('required.anchors.description')}
          publicLink={{ href: '/anchoring', label: tWallet('required.anchors.publicLink') }}
        />
      ) : (
        <Tabs defaultValue="cosmicSignature">
          <TabsList aria-label={t('anchors.tabs.label')} className="max-sm:flex max-sm:w-full">
            <TabsTrigger value="cosmicSignature" className="max-sm:flex-1">
              {t('anchors.tabs.cosmicSignature')}
              {anchoredLoading ? null : <AnchoredCount count={anchoredCst.length} />}
            </TabsTrigger>
            <TabsTrigger value="randomWalk" className="max-sm:flex-1">
              {t('anchors.tabs.randomWalk')}
              {anchoredLoading ? null : <AnchoredCount count={anchoredRwlk.length} />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cosmicSignature" className="mt-10 sm:mt-12">
            <CSTAnchoringPanel
              account={account}
              anchoredTokens={anchoredCst}
              availableTokens={availableCst}
              anchorDistributions={distributions.data ?? null}
              actions={cstActions.data ?? []}
              onAnchor={runFor(CST_GRIDS.available, (ids) => anchor(ids, false))}
              onRelease={runFor(CST_GRIDS.anchored, (ids) => release(ids, false))}
              stageFor={stageFor}
              walletBusy={walletBusy}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="randomWalk" className="mt-10 sm:mt-12">
            <RWLKAnchoringPanel
              anchoredTokens={anchoredRwlk}
              availableTokenIds={rwlkAvailable}
              imprints={rwlkImprints.data ?? []}
              actions={rwlkActions.data ?? []}
              onAnchor={runFor(RWLK_GRIDS.available, (ids) => anchor(ids, true))}
              onRelease={runFor(RWLK_GRIDS.anchored, (ids) => release(ids, true))}
              stageFor={stageFor}
              walletBusy={walletBusy}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      )}
    </PageShell>
  );
};

/**
 * A tab's count of anchored NFTs: the bare number on screen, and what it
 * counts for a screen reader ("Cosmic Signature 16 anchored").
 */
function AnchoredCount({ count }: { count: number }) {
  const t = useTranslations('myPages');
  const format = useFormat();
  return (
    <>
      <span aria-hidden className="tabular-nums text-subtle">
        {format.count(count)}
      </span>
      <span className="sr-only">{` ${t('anchors.tabs.anchoredCount', { count })}`}</span>
    </>
  );
}

export default MyAnchors;

'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

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
import {
  PageHeader,
  PageHeaderFigures,
  type PageHeaderFigure,
} from '@/components/layout/PageHeader';
import { Amount } from '@/components/ui/amount';
import { PageShell } from '@/components/ui/page-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';
import { CSTAnchoringPanel, CST_GRIDS } from '@/components/anchoring/CSTAnchoringPanel';
import { RWLKAnchoringPanel, RWLK_GRIDS } from '@/components/anchoring/RWLKAnchoringPanel';
import { sectionRead } from '@/components/anchoring/sectionRead';
import { useRandomWalkAnchorable } from '@/components/anchoring/useRandomWalkAnchorable';

interface MyAnchorsProps {
  /** "How anchoring works", rendered on the server: shown to a visitor who is not connected. */
  steps?: ReactNode;
}

/**
 * The connected wallet's anchoring desk: its anchored and anchorable NFTs of
 * both collections, chosen by their artwork, with the figures that matter to
 * an anchor-holder in the header. Every section shows its own read: a list
 * that could not be read says so with a retry, never "nothing anchored" or
 * "nothing to anchor". Not connected, the page leads with what an anchored
 * NFT would receive right now beside the one way to connect, then how
 * anchoring works.
 */
const MyAnchors = ({ steps }: MyAnchorsProps) => {
  const t = useTranslations('myPages');
  const tAnchoring = useTranslations('anchoring');
  const tWallet = useTranslations('wallet');
  const { account } = useActiveWeb3React();
  const { anchor, release, txStage } = useAnchorActions();

  const dashboard = useDashboardInfo();
  const cstActions = useCSTAnchorActionsByUser(account);
  const cstTokens = useCSTTokensByUser(account);
  const distributions = useAnchorDistributionsByUser(account);
  const rwlkActions = useRWLKAnchorActionsByUser(account);
  const rwlkImprints = useRWLKAnchorImprintsByUser(account);
  // Read from the chain: the contract takes each Random Walk NFT once, whoever anchored it.
  const rwlkAnchorable = useRandomWalkAnchorable(account);
  const {
    cstokens: anchoredCst,
    rwlktokens: anchoredRwlk,
    isLoading: anchoredLoading,
    cstFailed,
    rwlkFailed,
    fetchData: refetchAnchored,
  } = useAnchoredToken();
  const anchoredRead = (failed: boolean) => ({
    loading: anchoredLoading,
    failed,
    onRetry: () => void refetchAnchored(),
  });

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

  const unretrievedEth = useMemo(() => {
    if (!distributions.data) return null;
    return distributions.data.reduce((sum, row) => sum + (row.RewardToCollectEth ?? 0), 0);
  }, [distributions.data]);

  const perNft = distributionPerAnchoredNft(
    dashboard.data?.StakingAmountEth,
    dashboard.data?.MainStats?.StakeStatisticsCST?.TotalTokensStaked,
  );
  const pending = <Skeleton className="h-7 w-20" />;
  const perNftValue = dashboard.isLoading ? (
    pending
  ) : perNft.status === 'available' ? (
    <Amount value={perNft.perNftEth} unit="ETH" context="card" />
  ) : null;

  // How many NFTs each collection has anchored is on its tab, so the header
  // keeps only the figures no tab shows.
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
          value: perNftValue,
          info: t('anchors.stats.distributionPerNft.tooltip'),
          caption:
            perNft.status === 'noneAnchored'
              ? t('anchors.stats.distributionPerNft.noneAnchored')
              : undefined,
        },
      ]
    : undefined;

  if (!account) {
    return (
      <PageShell variant="data" backdrop="subtle">
        <PageHeader section="account" title={t('anchors.title')} subtitle={t('anchors.subtitle')} />
        {/* The reason to anchor sits beside the one way to start: on a phone the live figures
            come first, then the connect panel. */}
        <div className="grid items-center gap-x-12 gap-y-8 lg:grid-cols-12">
          <WalletRequiredState
            variant="panel"
            className="rounded-surface bg-surface lg:col-span-7"
            title={tWallet('required.anchors.title')}
            description={tWallet('required.anchors.description')}
            publicLink={{ href: '/anchoring', label: tWallet('required.anchors.publicLink') }}
          />
          <PageHeaderFigures
            // From lg the two figures stack beside the panel, each label over its value.
            className="mt-0 max-lg:order-first sm:mt-0 lg:col-span-5 lg:grid-flow-row lg:grid-cols-1 lg:grid-rows-none lg:divide-x-0 lg:[&>div]:px-0 lg:[&>div]:pb-8 lg:[&>div:last-child]:pb-0"
            figures={[
              {
                id: 'pool',
                label: tAnchoring('flow.cosmicSignature.pool.label'),
                info: tAnchoring('flow.cosmicSignature.pool.definition'),
                value: dashboard.isLoading ? (
                  pending
                ) : typeof dashboard.data?.StakingAmountEth === 'number' ? (
                  <Amount value={dashboard.data.StakingAmountEth} unit="ETH" context="card" />
                ) : null,
                caption: tAnchoring('flow.cosmicSignature.pool.caption', {
                  percentage: protocolFacts.anchorDistributionPercentage,
                }),
              },
              {
                id: 'perNft',
                label: tAnchoring('flow.cosmicSignature.perNft.label'),
                info: tAnchoring('flow.cosmicSignature.perNft.definition'),
                value: perNftValue,
                caption:
                  perNft.status === 'noneAnchored'
                    ? tAnchoring('flow.cosmicSignature.perNft.noneAnchored')
                    : tAnchoring('flow.cosmicSignature.perNft.caption'),
              },
            ]}
          />
        </div>
        <section
          aria-labelledby="my-anchors-how"
          className="mt-[var(--block-gap)] grid gap-x-12 gap-y-6 border-t border-rule-faint pt-[var(--block-gap)] lg:grid-cols-12"
        >
          <SectionHeader
            className="lg:col-span-5"
            headingId="my-anchors-how"
            title={tAnchoring('overview.howItWorks.title')}
            description={tAnchoring('overview.howItWorks.description')}
          />
          <div className="lg:col-span-7">{steps}</div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="subtle">
      <PageHeader
        section="account"
        title={t('anchors.title')}
        subtitle={t('anchors.subtitle')}
        figures={figures}
      />

      <Tabs defaultValue="cosmicSignature">
        <TabsList aria-label={t('anchors.tabs.label')} className="max-sm:flex max-sm:w-full">
          <TabsTrigger value="cosmicSignature" className="max-sm:flex-1">
            {t('anchors.tabs.cosmicSignature')}
            {anchoredLoading || cstFailed ? null : <AnchoredCount count={anchoredCst.length} />}
          </TabsTrigger>
          <TabsTrigger value="randomWalk" className="max-sm:flex-1">
            {t('anchors.tabs.randomWalk')}
            {anchoredLoading || rwlkFailed ? null : <AnchoredCount count={anchoredRwlk.length} />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cosmicSignature" className="mt-10 sm:mt-12">
          <CSTAnchoringPanel
            account={account}
            anchoredTokens={anchoredCst}
            availableTokens={cstTokens.data ?? []}
            anchorDistributions={distributions.data ?? null}
            distributionsLoading={distributions.isLoading}
            distributionsError={distributions.isError && !distributions.data}
            onRetryDistributions={() => void distributions.refetch()}
            actions={cstActions.data ?? []}
            anchoredRead={anchoredRead(cstFailed)}
            availableRead={sectionRead(cstTokens)}
            historyRead={sectionRead(cstActions)}
            onAnchor={runFor(CST_GRIDS.available, (ids) => anchor(ids, false))}
            onRelease={runFor(CST_GRIDS.anchored, (ids) => release(ids, false))}
            stageFor={stageFor}
            walletBusy={walletBusy}
          />
        </TabsContent>

        <TabsContent value="randomWalk" className="mt-10 sm:mt-12">
          <RWLKAnchoringPanel
            anchoredTokens={anchoredRwlk}
            availableTokenIds={rwlkAnchorable.data ?? null}
            imprints={rwlkImprints.data ?? []}
            actions={rwlkActions.data ?? []}
            anchoredRead={anchoredRead(rwlkFailed)}
            availableRead={sectionRead(rwlkAnchorable)}
            imprintsRead={sectionRead(rwlkImprints)}
            historyRead={sectionRead(rwlkActions)}
            onAnchor={runFor(RWLK_GRIDS.available, (ids) => anchor(ids, true))}
            onRelease={runFor(RWLK_GRIDS.anchored, (ids) => release(ids, true))}
            stageFor={stageFor}
            walletBusy={walletBusy}
          />
        </TabsContent>
      </Tabs>
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

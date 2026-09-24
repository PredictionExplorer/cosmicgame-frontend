'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePublicClient } from 'wagmi';

import { randomWalkNftAbi } from '@/contracts/generated';
import { protocolFacts } from '@/content/protocol-facts';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Amount } from '@/components/ui/amount';
import { ArtTag, WallLabel } from '@/components/ui/art-frame';
import { Button, buttonVariants } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { SkeletonText } from '@/components/ui/skeleton';
import { TxStatus } from '@/components/ui/tx-status';
import { UnknownValue } from '@/components/ui/unknown-value';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import { FundingNotice } from '@/components/wallet/FundingNotice';
import { RandomWalkPlate } from '@/components/nft/RandomWalkPlate';
import { useDashboardInfo, useUsedRWLKNFTs } from '@/hooks/useApiQuery';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { useActiveWeb3React } from '@/hooks/web3';
import { formatId } from '@/utils/format/ids';
import { toFiniteNumber } from '@/utils/finiteNumber';
import {
  IMPRINT_COST_BUFFER_PERCENT,
  ethGestureBaseCost,
  formatEthQuote,
  imprintSendValueWei,
} from '@/utils/gestureQuote';
import { NBSP, formatAmount } from '@/utils/format';

import { imprintedTokenId, useImprintCost, useOwnedRandomWalks } from './randomWalkImprint';

/** The contract's own names for its imprint cost read and its imprint write. */
const IMPRINT_COST_READ = 'getMintPrice'; // lexicon-allow-abi
const IMPRINT_WRITE = 'mint'; // lexicon-allow-abi

/** The home gesture form, opened with a Random Walk NFT selected. */
export const gestureWithRandomWalkHref = (tokenId: number) =>
  `/?randomwalk=1&tokenId=${tokenId}#make-gesture`;

/**
 * Imprint a Random Walk NFT: the page's one commit action, behind the wallet
 * and network guard, run through the shared transaction flow. The panel
 * shows the value the imprint sends (the contract cost plus a small buffer),
 * then the new token itself with the way to use it; below, the reader's own
 * Random Walk NFTs, marked used or unused.
 */
const Imprint = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('imprint');
  const tToasts = useTranslations('toasts');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { account } = useActiveWeb3React();
  const { randomWalkNft } = useContractAddresses();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const tx = useTxFlow();
  const stageLabel = useTxStageLabel();
  const { costWei, isError: costFailed } = useImprintCost();
  const owned = useOwnedRandomWalks(account);
  const { data: usedData } = useUsedRWLKNFTs();
  const { data: dashboard } = useDashboardInfo(undefined, { poll: false });
  const [imprinted, setImprinted] = useState<number | null>(null);

  const sendValue = costWei === null ? null : imprintSendValueWei(costWei);
  const usedIds = new Set((usedData ?? []).map((entry) => Number(entry.RWalkTokenId)));
  const ethGestureCost = toFiniteNumber(dashboard?.CurBidPriceEth);
  const discount = protocolFacts.randomWalkDiscountPercentage;

  const imprint = async () => {
    if (!randomWalkNft || !publicClient) return;
    const contract = { address: randomWalkNft as `0x${string}`, abi: randomWalkNftAbi };
    let value = sendValue ?? 0n;
    let tokenId: number | null = null;
    await tx.run({
      prepare: async () => {
        // The cost rises with every imprint: send what the contract asks for now.
        const cost = (await publicClient.readContract({
          ...contract,
          functionName: IMPRINT_COST_READ,
        })) as bigint;
        value = imprintSendValueWei(cost);
      },
      write: (ctx) =>
        ctx.writeContract<typeof randomWalkNftAbi, typeof IMPRINT_WRITE, readonly []>({
          address: contract.address,
          abi: randomWalkNftAbi,
          functionName: IMPRINT_WRITE,
          value,
        }),
      onConfirmed: async (receipt, ctx) => {
        tokenId = imprintedTokenId(receipt, ctx.account, contract.address);
        setImprinted(tokenId);
        await owned.refresh();
      },
      successMessage: () =>
        tokenId === null
          ? tToasts('imprint.confirmed')
          : t('page.success.title', { id: formatId(tokenId) }),
      failureMessage: tToasts('imprint.failed'),
      errorContext: 'imprint RWLK NFT',
    });
  };

  const costFigure =
    sendValue === null ? (
      <UnknownValue label={tCommon(costFailed ? 'status.unavailable' : 'status.loading')} />
    ) : (
      <Amount value={sendValue} unit="ETH" context="exact" />
    );

  const panel =
    imprinted !== null ? (
      <div data-testid="imprint-success">
        <p className="type-label text-subtle">{t('page.success.eyebrow')}</p>
        <h2 className="mt-2 type-heading-3 text-foreground">
          {t('page.success.title', { id: formatId(imprinted) })}
        </h2>
        <RandomWalkPlate
          tokenId={imprinted}
          alt={t('page.tokenAlt', { id: formatId(imprinted) })}
          className="mt-5 max-w-72"
        />
        <p className="mt-5 type-body-sm text-muted-foreground">
          {t('page.success.description', { percent: discount })}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={gestureWithRandomWalkHref(imprinted)}
            className={buttonVariants({ variant: 'default' })}
          >
            {t('page.success.use')}
            <ArrowRight aria-hidden />
          </Link>
          <Button
            variant="quiet"
            onClick={() => {
              setImprinted(null);
              tx.reset();
            }}
          >
            {t('page.success.again')}
          </Button>
        </div>
      </div>
    ) : (
      <>
        <p className="type-label text-subtle">{t('page.currentCost')}</p>
        <p className="mt-2 type-figure-lg text-foreground" data-testid="imprint-send-value">
          {costFigure}
        </p>
        {costWei !== null ? (
          <p className="mt-2 type-caption text-subtle" data-testid="imprint-cost-breakdown">
            {t('page.costBreakdown', {
              base: formatAmount(costWei, {
                unit: 'ETH',
                locale,
                context: 'exact',
                withUnit: false,
              }),
              percent: IMPRINT_COST_BUFFER_PERCENT,
            })}
          </p>
        ) : null}
        <FundingNotice requiredWei={sendValue} purpose="imprint" className="mt-6" />
        <div className="mt-6">
          <ChainGuard requireConnection buttonClassName="w-full" className="w-full">
            <Button
              variant="commit"
              size="xl"
              className="w-full"
              onClick={() => void imprint()}
              loading={tx.isBusy}
              disabled={sendValue === null || !randomWalkNft}
            >
              {stageLabel(tx.stage) ?? t('page.submit')}
            </Button>
          </ChainGuard>
          {account ? null : <p className="mt-3 type-caption text-subtle">{t('page.connect')}</p>}
          <TxStatus stage={tx.stage} className="mt-4 empty:mt-0" />
        </div>
      </>
    );

  return (
    <PageShell variant="data">
      {seoSummary ?? (
        <PageHeader section="participate" title={t('page.title')} subtitle={t('page.subtitle')} />
      )}

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-16">
        <section
          aria-label={t('page.panelAria')}
          className="rounded-surface bg-surface p-6 sm:p-8 lg:order-2 lg:col-span-5 lg:self-start"
        >
          {panel}
        </section>

        <section aria-labelledby="imprint-why" className="min-w-0 lg:order-1 lg:col-span-7">
          <SectionHeader headingId="imprint-why" title={t('page.why.title')} />
          <p className="type-prose text-muted-foreground">{t('page.description')}</p>
          {/* What the imprint is for, priced now: the header already shows the full cost. */}
          <div className="mt-8 border-l-2 border-primary pl-5" data-testid="imprint-gesture-cost">
            <p className="type-label text-subtle">{t('page.compare.label')}</p>
            <p className="mt-1 type-figure-md text-foreground">
              {ethGestureCost === null ? (
                <UnknownValue label={tCommon('status.unavailable')} />
              ) : (
                // A Gesture Cost reads as the header's and the gesture form's quote
                // (five significant digits); the imprint amounts above match the wallet.
                <data
                  value={ethGestureBaseCost(ethGestureCost, 'RandomWalk')}
                  className="whitespace-nowrap tabular-nums"
                >
                  {formatEthQuote(ethGestureBaseCost(ethGestureCost, 'RandomWalk'), locale)}
                  {NBSP}
                  <span className="text-muted-foreground">ETH</span>
                </data>
              )}
            </p>
            <p className="mt-1 type-caption text-subtle">
              {t('page.compare.caption', { percent: discount })}
            </p>
          </div>
        </section>
      </div>

      {account ? (
        <section aria-labelledby="imprint-owned" className="mt-[calc(var(--block-gap)*1.5)]">
          <SectionHeader headingId="imprint-owned" title={t('page.myNfts')} />
          {owned.isError ? (
            <ErrorState
              variant="inline"
              headingLevel={3}
              title={t('page.owned.error')}
              onRetry={owned.retry}
            />
          ) : owned.tokens === null ? (
            <SkeletonText lines={2} />
          ) : owned.tokens.length === 0 ? (
            <p className="type-body-sm text-muted-foreground">{t('page.owned.empty')}</p>
          ) : (
            <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {owned.tokens.map((tokenId) => {
                const used = usedIds.has(tokenId);
                return (
                  <li key={tokenId} data-token={tokenId}>
                    <RandomWalkPlate
                      tokenId={tokenId}
                      alt={t('page.tokenAlt', { id: formatId(tokenId) })}
                    />
                    {/* The section heading names the collection: the label is the number. */}
                    <WallLabel
                      className="mt-3"
                      title={<span className="font-mono tabular-nums">{formatId(tokenId)}</span>}
                      tags={
                        <ArtTag tone={used ? 'neutral' : 'positive'}>
                          {used ? t('page.owned.used') : t('page.owned.unused')}
                        </ArtTag>
                      }
                    />
                    {used ? null : (
                      <Link
                        href={gestureWithRandomWalkHref(tokenId)}
                        className="link mt-2 inline-flex min-h-6 items-center gap-1 type-body-sm"
                      >
                        {t('page.owned.use')}
                        <ArrowRight aria-hidden className="size-3.5" />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}
    </PageShell>
  );
};

export default Imprint;

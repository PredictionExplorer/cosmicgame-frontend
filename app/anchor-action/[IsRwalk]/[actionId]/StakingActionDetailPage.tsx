'use client';

import Link from 'next/link';

import { getExplorerUrl, getAssetsUrl, getRWLKImageUrl, convertTimestampToDateTime } from '@/utils';

import {
  DefinitionList,
  DetailRow,
  SectionCard,
  detailLinkClass,
  detailPanelClass,
} from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper, StyledCard } from '@/components/styled';
import type { StakingAction } from '@/services/api/types';
import NFTImage from '@/components/nft/NFTImage';
import { useStakingRWLKActionsInfo, useStakingCSTActionsInfo } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';

function StakingActionDetailPage({ IsRwalk, actionId }: { IsRwalk: number; actionId: number }) {
  const isRwalk = Boolean(IsRwalk);

  const rwlkQuery = useStakingRWLKActionsInfo(isRwalk ? actionId : null);
  const cstQuery = useStakingCSTActionsInfo(!isRwalk ? actionId : null);
  const activeQuery = isRwalk ? rwlkQuery : cstQuery;
  const { data: actionInfo = null, isLoading: loading } = activeQuery;
  const error = activeQuery.error?.message ?? null;

  const headingToken = isRwalk ? 'RandomWalk' : 'Cosmic Signature';
  const subtitleText = `Anchor Action for ${headingToken} Token`;

  return (
    <MainWrapper className="max-sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Anchor action"
          subtitle={subtitleText}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'My Anchors', href: '/my-anchors' },
            { label: `Action #${actionId}` },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">Loading...</p>
          </div>
        ) : error ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-destructive font-medium">{error}</p>
          </div>
        ) : actionInfo?.Stake ? (
          <StakingActionBody
            isRwalk={isRwalk}
            actionId={actionId}
            stake={actionInfo.Stake}
            unstake={actionInfo.Unstake}
          />
        ) : (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="font-medium text-foreground">No data found for this anchor action.</p>
          </div>
        )}
      </div>
    </MainWrapper>
  );
}

function StakingActionBody({
  isRwalk,
  actionId,
  stake,
  unstake,
}: {
  isRwalk: boolean;
  actionId: number;
  stake: StakingAction;
  unstake: StakingAction | null;
}) {
  const { TokenId, Seed, StakerAddr } = stake;

  const tokenImageURL = isRwalk
    ? getRWLKImageUrl(TokenId.toString().padStart(6, '0'))
    : getAssetsUrl(`cosmicsignature/0x${Seed}.png`);

  const tokenDetailHref = isRwalk
    ? `https://randomwalknft.com/detail/${TokenId}`
    : `/detail/${TokenId}`;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <SectionCard
        sectionId="staking-action-token"
        title="Token"
        description={
          isRwalk
            ? 'Random Walk NFT used in this action.'
            : 'Cosmic Signature token used in this action.'
        }
      >
        <div className="px-4 pb-4 pt-2 sm:px-5">
          <div className="mx-auto max-w-[400px]">
            <StyledCard>
              <Link href={tokenDetailHref} className="block">
                <NFTImage src={tokenImageURL} />
              </Link>
            </StyledCard>
          </div>
        </div>
        <DefinitionList>
          <DetailRow label="Action ID">
            <span className="font-mono tabular-nums">{actionId}</span>
          </DetailRow>
          <DetailRow label="Anchor-holder address">
            <Link
              href={`/user/${StakerAddr}`}
              className={cn(detailLinkClass, 'font-mono text-[13px] break-all')}
            >
              {StakerAddr}
            </Link>
          </DetailRow>
          <DetailRow label="Token ID">
            <Link href={tokenDetailHref} className={detailLinkClass}>
              {TokenId}
            </Link>
          </DetailRow>
        </DefinitionList>
      </SectionCard>

      <div className="space-y-8">
        <SectionCard
          sectionId="staking-action-stake"
          title="Anchor"
          description="When tokens were anchored to the protocol."
        >
          <DefinitionList>
            <DetailRow label="Anchored datetime">
              <a
                href={getExplorerUrl('tx', stake.TxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className={detailLinkClass}
              >
                {convertTimestampToDateTime(stake.TimeStamp)}
              </a>
            </DetailRow>
            <DetailRow label="Number of anchored tokens">
              <span className="font-mono tabular-nums">{stake.NumStakedNFTs}</span>
            </DetailRow>
          </DefinitionList>
        </SectionCard>

        {unstake && unstake.EvtLogId && unstake.EvtLogId !== 0 ? (
          <SectionCard
            sectionId="staking-action-unstake"
            title="Release"
            description="When the anchor was released."
          >
            <DefinitionList>
              <DetailRow label="Released datetime">
                <a
                  href={getExplorerUrl('tx', unstake.TxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={detailLinkClass}
                >
                  {convertTimestampToDateTime(unstake.TimeStamp)}
                </a>
              </DetailRow>
              <DetailRow label="Number of anchored tokens">
                <span className="font-mono tabular-nums">{unstake.NumStakedNFTs}</span>
              </DetailRow>
            </DefinitionList>
          </SectionCard>
        ) : null}
      </div>
    </div>
  );
}

export default StakingActionDetailPage;

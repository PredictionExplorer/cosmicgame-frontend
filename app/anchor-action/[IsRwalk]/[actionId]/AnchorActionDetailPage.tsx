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
import { PageShell } from '@/components/ui/page-shell';
import { StyledCard } from '@/components/styled';
import type { AnchorAction } from '@/services/api/types';
import NFTImage from '@/components/nft/NFTImage';
import { useRWLKAnchorActionInfo, useCSTAnchorActionInfo } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';

function AnchorActionDetailPage({ IsRwalk, actionId }: { IsRwalk: number; actionId: number }) {
  const isRwalk = Boolean(IsRwalk);

  const rwlkQuery = useRWLKAnchorActionInfo(isRwalk ? actionId : null);
  const cstQuery = useCSTAnchorActionInfo(!isRwalk ? actionId : null);
  const activeQuery = isRwalk ? rwlkQuery : cstQuery;
  const { data: actionInfo = null, isLoading: loading } = activeQuery;
  const error = activeQuery.error?.message ?? null;

  const headingToken = isRwalk ? 'RandomWalk' : 'Cosmic Signature';
  const subtitleText = `Anchor Action for ${headingToken} Token`;

  return (
    <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
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
          <AnchorActionBody
            isRwalk={isRwalk}
            actionId={actionId}
            anchor={actionInfo.Stake}
            release={actionInfo.Unstake}
          />
        ) : (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="font-medium text-foreground">No data found for this anchor action.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function AnchorActionBody({
  isRwalk,
  actionId,
  anchor,
  release,
}: {
  isRwalk: boolean;
  actionId: number;
  anchor: AnchorAction;
  release: AnchorAction | null;
}) {
  const { TokenId, Seed, StakerAddr } = anchor;

  const tokenImageURL = isRwalk
    ? getRWLKImageUrl(TokenId.toString().padStart(6, '0'))
    : getAssetsUrl(`cosmicsignature/0x${Seed}.png`);

  const tokenDetailHref = isRwalk
    ? `https://randomwalknft.com/detail/${TokenId}`
    : `/detail/${TokenId}`;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <SectionCard
        sectionId="anchor-action-token"
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
          sectionId="anchoring-action-anchor"
          title="Anchor"
          description="When tokens were anchored to the protocol."
        >
          <DefinitionList>
            <DetailRow label="Anchored datetime">
              <a
                href={getExplorerUrl('tx', anchor.TxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className={detailLinkClass}
              >
                {convertTimestampToDateTime(anchor.TimeStamp)}
              </a>
            </DetailRow>
            <DetailRow label="Number of anchored tokens">
              <span className="font-mono tabular-nums">{anchor.NumStakedNFTs}</span>
            </DetailRow>
          </DefinitionList>
        </SectionCard>

        {release && release.EvtLogId && release.EvtLogId !== 0 ? (
          <SectionCard
            sectionId="anchoring-action-release"
            title="Release"
            description="When the anchor was released."
          >
            <DefinitionList>
              <DetailRow label="Released datetime">
                <a
                  href={getExplorerUrl('tx', release.TxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={detailLinkClass}
                >
                  {convertTimestampToDateTime(release.TimeStamp)}
                </a>
              </DetailRow>
              <DetailRow label="Number of anchored tokens">
                <span className="font-mono tabular-nums">{release.NumStakedNFTs}</span>
              </DetailRow>
            </DefinitionList>
          </SectionCard>
        ) : null}
      </div>
    </div>
  );
}

export default AnchorActionDetailPage;

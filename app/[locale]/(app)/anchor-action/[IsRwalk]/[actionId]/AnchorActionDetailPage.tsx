'use client';

import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl, getAssetsUrl, getRWLKImageUrl, convertTimestampToDateTime } from '@/utils';

import { Link } from '@/i18n/navigation';
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
  const t = useTranslations('anchoring');
  const isRwalk = Boolean(IsRwalk);

  const rwlkQuery = useRWLKAnchorActionInfo(isRwalk ? actionId : null);
  const cstQuery = useCSTAnchorActionInfo(!isRwalk ? actionId : null);
  const activeQuery = isRwalk ? rwlkQuery : cstQuery;
  const { data: actionInfo = null, isLoading: loading } = activeQuery;
  const hasError = Boolean(activeQuery.error);

  const headingToken = isRwalk
    ? t('anchorActionDetail.token.labels.randomWalk')
    : t('anchorActionDetail.token.labels.cosmicSignature');
  const subtitleText = t('anchorActionDetail.subtitle', { token: headingToken });

  return (
    <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title={t('anchorActionDetail.title')}
          subtitle={subtitleText}
          breadcrumbs={[
            { label: t('anchorActionDetail.breadcrumbs.home'), href: '/' },
            { label: t('anchorActionDetail.breadcrumbs.myAnchors'), href: '/my-anchors' },
            { label: t('anchorActionDetail.breadcrumbs.action', { id: actionId }) },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : hasError ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-destructive font-medium">{t('anchorActionDetail.error')}</p>
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
            <p className="font-medium text-foreground">{t('anchorActionDetail.empty')}</p>
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
  const t = useTranslations('anchoring');
  const locale = useLocale();
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
        title={t('anchorActionDetail.token.title')}
        description={
          isRwalk
            ? t('anchorActionDetail.token.randomWalkDescription')
            : t('anchorActionDetail.token.cosmicSignatureDescription')
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
          <DetailRow label={t('anchorActionDetail.token.actionId')}>
            <span className="font-mono tabular-nums">{actionId}</span>
          </DetailRow>
          <DetailRow label={t('anchorActionDetail.token.holderAddress')}>
            <Link
              href={`/user/${StakerAddr}`}
              className={cn(detailLinkClass, 'font-mono text-[13px] break-all')}
            >
              {StakerAddr}
            </Link>
          </DetailRow>
          <DetailRow label={t('anchorActionDetail.token.tokenId')}>
            <Link href={tokenDetailHref} className={detailLinkClass}>
              {TokenId}
            </Link>
          </DetailRow>
        </DefinitionList>
      </SectionCard>

      <div className="space-y-8">
        <SectionCard
          sectionId="anchoring-action-anchor"
          title={t('anchorActionDetail.anchor.title')}
          description={t('anchorActionDetail.anchor.description')}
        >
          <DefinitionList>
            <DetailRow label={t('anchorActionDetail.anchor.datetime')}>
              <a
                href={getExplorerUrl('tx', anchor.TxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className={detailLinkClass}
              >
                {convertTimestampToDateTime(anchor.TimeStamp, false, locale)}
              </a>
            </DetailRow>
            <DetailRow label={t('anchorActionDetail.anchor.tokenCount')}>
              <span className="font-mono tabular-nums">{anchor.NumStakedNFTs}</span>
            </DetailRow>
          </DefinitionList>
        </SectionCard>

        {release && release.EvtLogId && release.EvtLogId !== 0 ? (
          <SectionCard
            sectionId="anchoring-action-release"
            title={t('anchorActionDetail.release.title')}
            description={t('anchorActionDetail.release.description')}
          >
            <DefinitionList>
              <DetailRow label={t('anchorActionDetail.release.datetime')}>
                <a
                  href={getExplorerUrl('tx', release.TxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={detailLinkClass}
                >
                  {convertTimestampToDateTime(release.TimeStamp, false, locale)}
                </a>
              </DetailRow>
              <DetailRow label={t('anchorActionDetail.release.tokenCount')}>
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

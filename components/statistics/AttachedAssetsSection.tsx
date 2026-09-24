'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { AttachedAssetsIcon } from '@/lib/conceptIcons';
import { useDonationsERC20ByRound, useDonationsNFTList } from '@/hooks/useApiQuery';
import type { AttachedNFT as AttachedNFTRecord, DonatedERC20Token } from '@/services/api/types';
import AttachedNFTCard from '@/components/attachments/AttachedNFT';
import AttachedERC20Table from '@/components/attachments/AttachedERC20Table';
import { TablePagination } from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonNFTCard, SkeletonTable } from '@/components/ui/skeleton';
import { SegmentedControl } from '@/components/ui/segmented-control';

import { StatsSection } from './StatsSection';

const ITEMS_PER_PAGE = 12;

type NftScope = 'all' | 'current';

function nftKey(nft: AttachedNFTRecord, index: number): string {
  if (nft.RecordId != null) return `record-${nft.RecordId}`;
  const tokenId = nft.NFTTokenId ?? nft.TokenId;
  return `${nft.TokenAddr ?? 'token'}-${tokenId ?? index}`;
}

export interface AttachedAssetsSectionProps {
  /** Current Performance Cycle number (used for the current-cycle scope). */
  currentRoundNum: number;
}

/**
 * Assets attached to gestures: an ERC-721 grid that can be scoped to all
 * cycles or the current one, and the current cycle's attached ERC-20 tokens,
 * one underline tab each.
 */
export function AttachedAssetsSection({ currentRoundNum }: AttachedAssetsSectionProps) {
  const t = useTranslations('statistics');
  const nftQuery = useDonationsNFTList();
  const erc20Query = useDonationsERC20ByRound(currentRoundNum);

  const [nftScope, setNftScope] = useState<NftScope>('all');
  const [page, setPage] = useState(1);

  const allNfts = useMemo(() => (nftQuery.data ?? []) as AttachedNFTRecord[], [nftQuery.data]);
  const visibleNfts = useMemo(
    () =>
      nftScope === 'current' ? allNfts.filter((nft) => nft.RoundNum === currentRoundNum) : allNfts,
    [allNfts, nftScope, currentRoundNum],
  );

  // Clamp instead of state-sync so scope switches and data refreshes can
  // never leave the pager past the final page.
  const totalPages = Math.max(1, Math.ceil(visibleNfts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedNfts = visibleNfts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const erc20Tokens = (erc20Query.data ?? []) as DonatedERC20Token[];

  const setScope = (scope: NftScope) => {
    setNftScope(scope);
    setPage(1);
  };

  return (
    <StatsSection
      title={t('tokens.sections.attachedAssets')}
      tooltip={t('sectionTooltips.attachedAssets')}
    >
      <Tabs defaultValue="nfts">
        <TabsList variant="underline" scroll className="min-w-full">
          <TabsTrigger value="nfts">{t('attachedAssets.nftTab')}</TabsTrigger>
          <TabsTrigger value="erc20">{t('attachedAssets.erc20Tab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="nfts" className="mt-6 space-y-6">
          <SegmentedControl
            label={t('attachedAssets.scopeAria')}
            hideLabel
            value={nftScope}
            onValueChange={setScope}
            options={[
              { value: 'all', label: t('attachedAssets.scopeAll') },
              { value: 'current', label: t('attachedAssets.scopeCurrent') },
            ]}
          />
          {nftQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonNFTCard key={i} announce={i === 0} />
              ))}
            </div>
          ) : nftQuery.isError ? (
            <ErrorState
              headingLevel={3}
              title={t('attachedAssets.nftLoadError')}
              message={t('attachedAssets.serviceError')}
              onRetry={() => nftQuery.refetch()}
            />
          ) : visibleNfts.length === 0 ? (
            <EmptyState
              headingLevel={3}
              icon={<AttachedAssetsIcon className="size-6" />}
              title={
                nftScope === 'current'
                  ? t('attachedAssets.emptyCurrentTitle')
                  : t('attachedAssets.emptyAllTitle')
              }
              description={
                nftScope === 'current'
                  ? t('attachedAssets.emptyCurrentDescription')
                  : t('attachedAssets.emptyAllDescription')
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {pagedNfts.map((nft, index) => (
                  <AttachedNFTCard key={nftKey(nft, index)} nft={nft} />
                ))}
              </div>
              <TablePagination
                page={safePage}
                pageSize={ITEMS_PER_PAGE}
                total={visibleNfts.length}
                onPageChange={setPage}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="erc20" className="mt-6 space-y-4">
          <p className="max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
            {t('attachedAssets.erc20Description')}
          </p>
          {erc20Query.isLoading ? (
            <SkeletonTable rows={4} columns={4} />
          ) : erc20Query.isError ? (
            <ErrorState
              headingLevel={3}
              title={t('attachedAssets.erc20LoadError')}
              message={t('attachedAssets.serviceError')}
              onRetry={() => erc20Query.refetch()}
            />
          ) : (
            <AttachedERC20Table list={erc20Tokens} handleClaim={null} />
          )}
        </TabsContent>
      </Tabs>
    </StatsSection>
  );
}

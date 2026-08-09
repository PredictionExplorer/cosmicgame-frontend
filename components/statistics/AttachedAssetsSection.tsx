'use client';

import { useMemo, useState } from 'react';
import { Gift, ImageOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_HEIGHT_CLASS } from '@/lib/touch-target';
import { useDonationsERC20ByRound, useDonationsNFTList } from '@/hooks/useApiQuery';
import type { AttachedNFT as AttachedNFTRecord, DonatedERC20Token } from '@/services/api/types';
import AttachedNFTCard from '@/components/attachments/AttachedNFT';
import AttachedERC20Table from '@/components/attachments/AttachedERC20Table';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonNFTCard, SkeletonTableRow } from '@/components/ui/skeleton';
import { StatsSection } from '@/components/statistics/StatsSection';

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
 * Unified view of assets attached to gestures: an ERC-721 grid that can be
 * scoped to all cycles or just the current one, plus the current cycle's
 * attached ERC-20 tokens. Replaces the two overlapping sections that used to
 * render back-to-back on the statistics page.
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

  const scopeToggle = (
    <div
      role="group"
      aria-label={t('attachedAssets.scopeAria')}
      className="mb-4 inline-flex items-center gap-1 rounded-lg bg-white/[0.04] p-1"
    >
      {(
        [
          { value: 'all', label: t('attachedAssets.scopeAll') },
          { value: 'current', label: t('attachedAssets.scopeCurrent') },
        ] as const
      ).map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={nftScope === option.value}
          onClick={() => setScope(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            TOUCH_TARGET_HEIGHT_CLASS,
            nftScope === option.value
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <StatsSection
      title={t('tokens.sections.attachedAssets')}
      tooltip={t('sectionTooltips.attachedAssets')}
      icon={<Gift className="h-3.5 w-3.5" />}
      defaultOpen
    >
      <Tabs defaultValue="nfts">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="nfts" className="flex-1 sm:flex-none">
            {t('attachedAssets.nftTab')}
          </TabsTrigger>
          <TabsTrigger value="erc20" className="flex-1 sm:flex-none">
            {t('attachedAssets.erc20Tab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nfts" className="pt-4">
          {scopeToggle}
          {nftQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonNFTCard key={i} />
              ))}
            </div>
          ) : nftQuery.isError ? (
            <ErrorState
              title={t('attachedAssets.nftLoadError')}
              message={t('attachedAssets.serviceError')}
              onRetry={() => nftQuery.refetch()}
              className="py-10"
            />
          ) : visibleNfts.length === 0 ? (
            <EmptyState
              icon={<ImageOff className="h-8 w-8 text-muted-foreground/50" />}
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
              className="py-10"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {pagedNfts.map((nft, index) => (
                  <AttachedNFTCard key={nftKey(nft, index)} nft={nft} />
                ))}
              </div>
              <CustomPagination
                page={safePage}
                setPage={setPage}
                totalLength={visibleNfts.length}
                perPage={ITEMS_PER_PAGE}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="erc20" className="pt-4">
          <p className="mb-4 text-xs text-muted-foreground">
            {t('attachedAssets.erc20Description')}
          </p>
          {erc20Query.isLoading ? (
            <div>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonTableRow key={i} />
              ))}
            </div>
          ) : erc20Query.isError ? (
            <ErrorState
              title={t('attachedAssets.erc20LoadError')}
              message={t('attachedAssets.serviceError')}
              onRetry={() => erc20Query.refetch()}
              className="py-10"
            />
          ) : (
            <AttachedERC20Table list={erc20Tokens} handleClaim={null} />
          )}
        </TabsContent>
      </Tabs>
    </StatsSection>
  );
}

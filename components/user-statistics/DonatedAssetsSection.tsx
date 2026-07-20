import { Gift, Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import AttachedNFTTable from '@/components/attachments/AttachedNFTTable';
import AttachedERC20Table from '@/components/attachments/AttachedERC20Table';
import type { NFTRecord } from '@/components/attachments/AttachedNFTTable';
import type { DonatedERC20Token } from '@/components/attachments/AttachedERC20Table';

/** Props for the donated assets section. */
export interface DonatedAssetsSectionProps {
  unclaimedNFTs: NFTRecord[];
  claimedNFTs: NFTRecord[];
  donatedERC20: DonatedERC20Token[];
  loadingNFTs: boolean;
  loadingERC20: boolean;
  canClaim: boolean;
  isClaiming: boolean;
  claimingDonatedNFTs: number[];
  onClaimNFT?: (tokenID: number) => void;
  onClaimAllNFTs: () => void;
  onClaimERC20?: ((roundNum: number, tokenAddr: string, amount: string) => void) | null | undefined;
  onClaimAllERC20: () => void;
}

function TableSkeleton() {
  return (
    <div className="space-y-3" data-testid="table-skeleton">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

/** Donated NFTs and ERC20 tokens sections with claim buttons, empty states, and loading skeletons. */
export function DonatedAssetsSection({
  unclaimedNFTs,
  claimedNFTs,
  donatedERC20,
  loadingNFTs,
  loadingERC20,
  canClaim,
  isClaiming,
  claimingDonatedNFTs,
  onClaimNFT,
  onClaimAllNFTs,
  onClaimERC20,
  onClaimAllERC20,
}: DonatedAssetsSectionProps) {
  const t = useTranslations('myPages');
  const allNFTs = [...unclaimedNFTs, ...claimedNFTs];
  const unclaimedERC20Count = donatedERC20.filter((x) => !x.Claimed).length;

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {t('statistics.donatedAssets.nfts.title')}
            </p>
            <InfoTooltip content={t('statistics.donatedAssets.nfts.tooltip')} />
            {unclaimedNFTs.length > 0 && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                {t('statistics.donatedAssets.nfts.unclaimed', {
                  count: unclaimedNFTs.length,
                })}
              </Badge>
            )}
          </div>
          {unclaimedNFTs.length > 0 && canClaim && (
            <Button onClick={onClaimAllNFTs} disabled={isClaiming} size="sm">
              {t('statistics.donatedAssets.nfts.claimAll')}
            </Button>
          )}
        </div>
        {loadingNFTs ? (
          <TableSkeleton />
        ) : allNFTs.length === 0 ? (
          <EmptyState
            icon={<Gift className="h-8 w-8 text-muted-foreground/50" />}
            title={t('statistics.donatedAssets.nfts.emptyTitle')}
            description={t('statistics.donatedAssets.nfts.emptyDescription')}
          />
        ) : (
          <AttachedNFTTable
            list={allNFTs}
            handleClaim={canClaim ? onClaimNFT : undefined}
            claimingTokens={claimingDonatedNFTs}
          />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {t('statistics.donatedAssets.erc20.title')}
            </p>
            <InfoTooltip content={t('statistics.donatedAssets.erc20.tooltip')} />
            {unclaimedERC20Count > 0 && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                {t('statistics.donatedAssets.erc20.unclaimed', {
                  count: unclaimedERC20Count,
                })}
              </Badge>
            )}
          </div>
          {unclaimedERC20Count > 0 && canClaim && (
            <Button onClick={onClaimAllERC20} size="sm">
              {t('statistics.donatedAssets.erc20.claimAll')}
            </Button>
          )}
        </div>
        {loadingERC20 ? (
          <TableSkeleton />
        ) : donatedERC20.length === 0 ? (
          <EmptyState
            icon={<Coins className="h-8 w-8 text-muted-foreground/50" />}
            title={t('statistics.donatedAssets.erc20.emptyTitle')}
            description={t('statistics.donatedAssets.erc20.emptyDescription')}
          />
        ) : (
          <AttachedERC20Table
            list={donatedERC20}
            handleClaim={canClaim ? (onClaimERC20 ?? null) : null}
          />
        )}
      </div>
    </>
  );
}

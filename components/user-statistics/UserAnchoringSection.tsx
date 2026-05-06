import Image from 'next/image';
import { Lock, Unlock, Coins, Gift, Layers } from 'lucide-react';

import { formatEthValue } from '@/utils';

import type { AnchorAction, AnchorDistributionImprint } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import AnchorActionsTable from '@/components/anchoring/AnchorActionsTable';
import { AnchorDistributionsTable } from '@/components/anchoring/AnchorDistributionsTable';
import { CSTAnchorDistributionsByDepositTable } from '@/components/anchoring/CSTAnchorDistributionsByDepositTable';
import { RetrievedCSTAnchorDistributionsTable } from '@/components/anchoring/RetrievedCSTAnchorDistributionsTable';
import { UnretrievedCSTAnchorDistributionsTable } from '@/components/anchoring/UnretrievedCSTAnchorDistributionsTable';
import { RwalkAnchorDistributionImprintsTable } from '@/components/anchoring/RwalkAnchorDistributionImprintsTable';
import type { CSTAnchorDistributionByDeposit } from '@/components/anchoring/CSTAnchorDistributionsByDepositTable';

import type { UserProfileInfo } from './UserStatsSection';

interface AnchorDistributionRow {
  TokenId: number;
  RewardCollectedEth?: number;
  RewardToCollectEth?: number;
  [key: string]: unknown;
}

/** Props for the user anchoring section. */
export interface UserAnchoringSectionProps {
  address: string;
  userInfo: UserProfileInfo;
  cstAnchorActions: AnchorAction[];
  rwlkAnchorActions: AnchorAction[];
  cstAnchorDistributions: AnchorDistributionRow[];
  cstAnchorDistributionsByDeposit: CSTAnchorDistributionByDeposit[];
  retrievedCstAnchorDistributions: import('@/services/api/types').CSTAnchorDistribution[];
  rwlkImprints: AnchorDistributionImprint[];
}

/** Staking statistics section with CST and RWLK tabs, stat cards, and detailed tables. */
export function UserAnchoringSection({
  address,
  userInfo,
  cstAnchorActions,
  rwlkAnchorActions,
  cstAnchorDistributions,
  cstAnchorDistributionsByDeposit,
  retrievedCstAnchorDistributions,
  rwlkImprints,
}: UserAnchoringSectionProps) {
  const totalAnchorActions = cstAnchorActions.filter((a) => a.ActionType !== 1).length;
  const totalReleaseActions = cstAnchorActions.filter((a) => a.ActionType === 1).length;
  const totalRewardEth = cstAnchorDistributions.reduce(
    (sum, r) => sum + (r.RewardCollectedEth ?? 0) + (r.RewardToCollectEth ?? 0),
    0,
  );
  const unclaimedRewardEth = cstAnchorDistributions.reduce(
    (sum, r) => sum + (r.RewardToCollectEth ?? 0),
    0,
  );

  const rwlkStats = userInfo?.StakingStatisticsRWalk;
  const hasCSTActivity = cstAnchorActions.length > 0 || cstAnchorDistributions.length > 0;
  const hasRWLKActivity =
    (rwlkStats?.TotalNumStakeActions ?? 0) > 0 || rwlkAnchorActions.length > 0;

  return (
    <div data-testid="user-anchoring-section">
      <Tabs defaultValue="cst" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-auto bg-transparent border-b border-border rounded-none p-0">
          <TabsTrigger
            value="cst"
            className="flex-1 h-auto py-3 rounded-none data-[state=active]:bg-white/5 data-[state=active]:shadow-none"
          >
            <div className="flex items-center">
              <Image
                src="/images/CosmicSignatureNFT.png"
                width={94}
                height={60}
                alt="cosmic signature nft"
                className="h-auto w-[94px] shrink-0"
              />
              <span className="text-lg whitespace-nowrap normal-case ml-4">
                Cosmic Signature Anchoring
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="rwlk"
            className="flex-1 h-auto py-3 rounded-none data-[state=active]:bg-white/5 data-[state=active]:shadow-none"
          >
            <div className="flex items-center">
              <Image
                src="/images/rwalk.jpg"
                width={94}
                height={60}
                alt="RandomWalk nft"
                className="h-auto w-[94px] shrink-0"
              />
              <span className="text-lg whitespace-nowrap normal-case ml-4">
                Random Walk Anchoring
              </span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cst" className="pt-6">
          {!hasCSTActivity ? (
            <EmptyState
              icon={<Layers className="h-8 w-8 text-muted-foreground/50" />}
              title="No anchoring activity yet"
              description="Anchor your Cosmic Signature NFTs to receive ETH Anchor Distributions each cycle."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
                <StatCard
                  label="Anchor Actions"
                  value={totalAnchorActions.toLocaleString()}
                  icon={<Lock className="h-3.5 w-3.5" />}
                  tooltip="Number of times you have anchored Cosmic Signature NFTs."
                />
                <StatCard
                  label="Release Actions"
                  value={totalReleaseActions.toLocaleString()}
                  icon={<Unlock className="h-3.5 w-3.5" />}
                  tooltip="Number of times you have released anchored Cosmic Signature NFTs."
                />
                <StatCard
                  label="NFTs with Distributions"
                  value={cstAnchorDistributions.length.toLocaleString()}
                  icon={<Layers className="h-3.5 w-3.5" />}
                  tooltip="Number of anchored Cosmic Signature NFTs that have accumulated Anchor Distributions."
                />
                <StatCard
                  label="Total Distributions"
                  value={formatEthValue(totalRewardEth)}
                  icon={<Coins className="h-3.5 w-3.5" />}
                  tooltip="Total ETH Anchor Distributions received from anchoring (retrieved + unretrieved)."
                  featured
                />
                <StatCard
                  label="Unretrieved Distributions"
                  value={formatEthValue(unclaimedRewardEth)}
                  icon={<Gift className="h-3.5 w-3.5" />}
                  tooltip="Anchor Distributions allocated but not yet retrieved to your wallet."
                  featured={unclaimedRewardEth > 0}
                  gradient={unclaimedRewardEth > 0}
                />
              </div>

              <div className="space-y-8">
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Anchor / Release Actions
                  </h6>
                  <AnchorActionsTable list={cstAnchorActions} IsRwalk={false} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Anchor Distributions by Token
                  </h6>
                  <AnchorDistributionsTable list={cstAnchorDistributions} address={address} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Anchor Distributions by Deposit
                  </h6>
                  <CSTAnchorDistributionsByDepositTable list={cstAnchorDistributionsByDeposit} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Retrieved Anchor Distributions
                  </h6>
                  <RetrievedCSTAnchorDistributionsTable list={retrievedCstAnchorDistributions} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Unretrieved Anchor Distributions
                  </h6>
                  <UnretrievedCSTAnchorDistributionsTable user={address} />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="rwlk" className="pt-6">
          {!hasRWLKActivity ? (
            <EmptyState
              icon={<Layers className="h-8 w-8 text-muted-foreground/50" />}
              title="No RandomWalk anchoring yet"
              description="Anchor your RandomWalk NFTs to take part in Anchored-NFT Stellar Selection."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <StatCard
                  label="Anchor Actions"
                  value={(rwlkStats?.TotalNumStakeActions ?? 0).toLocaleString()}
                  icon={<Lock className="h-3.5 w-3.5" />}
                  tooltip="Number of times you have anchored RandomWalk NFTs."
                />
                <StatCard
                  label="Release Actions"
                  value={(rwlkStats?.TotalNumUnstakeActions ?? 0).toLocaleString()}
                  icon={<Unlock className="h-3.5 w-3.5" />}
                  tooltip="Number of times you have released anchored RandomWalk NFTs."
                />
                <StatCard
                  label="NFTs Anchored"
                  value={(rwlkStats?.TotalTokensStaked ?? 0).toLocaleString()}
                  icon={<Layers className="h-3.5 w-3.5" />}
                  tooltip="Total RandomWalk NFTs currently anchored."
                  featured
                />
                <StatCard
                  label="NFTs Imprinted"
                  value={(rwlkStats?.TotalTokensMinted ?? 0).toLocaleString()}
                  icon={<Gift className="h-3.5 w-3.5" />}
                  tooltip="Cosmic Signature NFTs received through Anchored-NFT Stellar Selection."
                />
              </div>

              <div className="space-y-8">
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Anchor / Release Actions
                  </h6>
                  <AnchorActionsTable list={rwlkAnchorActions} IsRwalk={true} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Anchored-NFT Stellar Selection
                  </h6>
                  <RwalkAnchorDistributionImprintsTable list={rwlkImprints} />
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

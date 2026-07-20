import { Lock, Unlock, Coins, Gift, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

/** Anchoring statistics section with Cosmic Signature NFT and RWLK tabs, stat cards, and tables. */
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
  const t = useTranslations('myPages');
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
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </span>
              <span className="text-lg whitespace-nowrap normal-case ml-4">
                {t('statistics.anchoring.tabs.cosmicSignature')}
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="rwlk"
            className="flex-1 h-auto py-3 rounded-none data-[state=active]:bg-white/5 data-[state=active]:shadow-none"
          >
            <div className="flex items-center">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgb(var(--nebula-violet-rgb)/0.28)] bg-[rgb(var(--nebula-violet-rgb)/0.12)] text-[rgb(var(--nebula-violet-rgb))]">
                <Layers className="h-5 w-5" />
              </span>
              <span className="text-lg whitespace-nowrap normal-case ml-4">
                {t('statistics.anchoring.tabs.randomWalk')}
              </span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cst" className="pt-6">
          {!hasCSTActivity ? (
            <EmptyState
              icon={<Layers className="h-8 w-8 text-muted-foreground/50" />}
              title={t('statistics.anchoring.empty.cosmicSignatureTitle')}
              description={t('statistics.anchoring.empty.cosmicSignatureDescription')}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
                <StatCard
                  label={t('statistics.anchoring.stats.anchorActions.label')}
                  value={totalAnchorActions.toLocaleString()}
                  icon={<Lock className="h-3.5 w-3.5" />}
                  tooltip={t('statistics.anchoring.stats.anchorActions.cosmicSignatureTooltip')}
                />
                <StatCard
                  label={t('statistics.anchoring.stats.releaseActions.label')}
                  value={totalReleaseActions.toLocaleString()}
                  icon={<Unlock className="h-3.5 w-3.5" />}
                  tooltip={t('statistics.anchoring.stats.releaseActions.cosmicSignatureTooltip')}
                />
                <StatCard
                  label={t('statistics.anchoring.stats.nftsWithDistributions.label')}
                  value={cstAnchorDistributions.length.toLocaleString()}
                  icon={<Layers className="h-3.5 w-3.5" />}
                  tooltip={t('statistics.anchoring.stats.nftsWithDistributions.tooltip')}
                />
                <StatCard
                  label={t('statistics.anchoring.stats.totalDistributions.label')}
                  value={formatEthValue(totalRewardEth)}
                  icon={<Coins className="h-3.5 w-3.5" />}
                  tooltip={t('statistics.anchoring.stats.totalDistributions.tooltip')}
                  featured
                />
                <StatCard
                  label={t('statistics.anchoring.stats.unretrievedDistributions.label')}
                  value={formatEthValue(unclaimedRewardEth)}
                  icon={<Gift className="h-3.5 w-3.5" />}
                  tooltip={t('statistics.anchoring.stats.unretrievedDistributions.tooltip')}
                  featured={unclaimedRewardEth > 0}
                  gradient={unclaimedRewardEth > 0}
                />
              </div>

              <div className="space-y-8">
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    {t('statistics.anchoring.sections.actions')}
                  </h6>
                  <AnchorActionsTable list={cstAnchorActions} IsRwalk={false} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    {t('statistics.anchoring.sections.distributionsByToken')}
                  </h6>
                  <AnchorDistributionsTable list={cstAnchorDistributions} address={address} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    {t('statistics.anchoring.sections.distributionsByDeposit')}
                  </h6>
                  <CSTAnchorDistributionsByDepositTable list={cstAnchorDistributionsByDeposit} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    {t('statistics.anchoring.sections.retrievedDistributions')}
                  </h6>
                  <RetrievedCSTAnchorDistributionsTable list={retrievedCstAnchorDistributions} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    {t('statistics.anchoring.sections.unretrievedDistributions')}
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
              title={t('statistics.anchoring.empty.randomWalkTitle')}
              description={t('statistics.anchoring.empty.randomWalkDescription')}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <StatCard
                  label={t('statistics.anchoring.stats.anchorActions.label')}
                  value={(rwlkStats?.TotalNumStakeActions ?? 0).toLocaleString()}
                  icon={<Lock className="h-3.5 w-3.5" />}
                  tooltip={t('statistics.anchoring.stats.anchorActions.randomWalkTooltip')}
                />
                <StatCard
                  label={t('statistics.anchoring.stats.releaseActions.label')}
                  value={(rwlkStats?.TotalNumUnstakeActions ?? 0).toLocaleString()}
                  icon={<Unlock className="h-3.5 w-3.5" />}
                  tooltip={t('statistics.anchoring.stats.releaseActions.randomWalkTooltip')}
                />
                <StatCard
                  label={t('statistics.anchoring.stats.nftsAnchored.label')}
                  value={(rwlkStats?.TotalTokensStaked ?? 0).toLocaleString()}
                  icon={<Layers className="h-3.5 w-3.5" />}
                  tooltip={t('statistics.anchoring.stats.nftsAnchored.tooltip')}
                  featured
                />
                <StatCard
                  label={t('statistics.anchoring.stats.nftsImprinted.label')}
                  value={(rwlkStats?.TotalTokensMinted ?? 0).toLocaleString()}
                  icon={<Gift className="h-3.5 w-3.5" />}
                  tooltip={t('statistics.anchoring.stats.nftsImprinted.tooltip')}
                />
              </div>

              <div className="space-y-8">
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    {t('statistics.anchoring.sections.actions')}
                  </h6>
                  <AnchorActionsTable list={rwlkAnchorActions} IsRwalk={true} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    {t('statistics.anchoring.sections.anchoredNftSelection')}
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

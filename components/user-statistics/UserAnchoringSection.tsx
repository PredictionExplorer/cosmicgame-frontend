'use client';

import { useId, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { AnchoringIcon } from '@/lib/conceptIcons';
import { useFormat } from '@/hooks/useFormat';
import type { AnchorAction, AnchorDistributionImprint } from '@/services/api';
import type { CSTAnchorDistribution } from '@/services/api/types';
import { PageHeaderFigures } from '@/components/layout/PageHeader';
import { Amount } from '@/components/ui/amount';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import AnchorActionsTable from '@/components/anchoring/AnchorActionsTable';
import { AnchorDistributionsTable } from '@/components/anchoring/AnchorDistributionsTable';
import { CSTAnchorDistributionsByDepositTable } from '@/components/anchoring/CSTAnchorDistributionsByDepositTable';
import { RetrievedCSTAnchorDistributionsTable } from '@/components/anchoring/RetrievedCSTAnchorDistributionsTable';
import { UnretrievedCSTAnchorDistributionsTable } from '@/components/anchoring/UnretrievedCSTAnchorDistributionsTable';
import { RwalkAnchorDistributionImprintsTable } from '@/components/anchoring/RwalkAnchorDistributionImprintsTable';
import type { CSTAnchorDistributionByDeposit } from '@/components/anchoring/CSTAnchorDistributionsByDepositTable';

import type { UserProfileInfo } from './types';

export interface AnchorDistributionRow {
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
  retrievedCstAnchorDistributions: CSTAnchorDistribution[];
  rwlkImprints: AnchorDistributionImprint[];
}

/** One titled ledger inside a tab: an H3 over its table. */
function Ledger({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="min-w-0">
      <h3 id={id} className="mb-4 type-heading-3 text-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * A participant's anchoring, one underline tab per NFT kind: a figure strip
 * (anchor and release actions, NFTs, distributions), then the ledgers. Copy
 * names "this address", so the section reads right on anyone's profile.
 */
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
  const format = useFormat();
  const s = (key: string) => t(`statistics.anchoring.${key}`);

  const anchorCount = cstAnchorActions.filter((a) => a.ActionType !== 1).length;
  const releaseCount = cstAnchorActions.filter((a) => a.ActionType === 1).length;
  const totalDistributionEth = cstAnchorDistributions.reduce(
    (sum, r) => sum + (r.RewardCollectedEth ?? 0) + (r.RewardToCollectEth ?? 0),
    0,
  );
  const unretrievedEth = cstAnchorDistributions.reduce(
    (sum, r) => sum + (r.RewardToCollectEth ?? 0),
    0,
  );

  const rwlkStats = userInfo.StakingStatisticsRWalk;
  const hasCstActivity = cstAnchorActions.length > 0 || cstAnchorDistributions.length > 0;
  const hasRwlkActivity =
    (rwlkStats?.TotalNumStakeActions ?? 0) > 0 || rwlkAnchorActions.length > 0;

  return (
    <div data-testid="user-anchoring-section">
      <Tabs defaultValue="cst" className="w-full">
        <TabsList variant="underline" scroll className="min-w-full" aria-label={s('tabs.label')}>
          <TabsTrigger value="cst">{s('tabs.cosmicSignature')}</TabsTrigger>
          <TabsTrigger value="rwlk">{s('tabs.randomWalk')}</TabsTrigger>
        </TabsList>

        <TabsContent value="cst" className="mt-8">
          {!hasCstActivity ? (
            <EmptyState
              headingLevel={3}
              icon={<AnchoringIcon className="size-6" />}
              title={s('empty.cosmicSignatureTitle')}
              description={s('empty.cosmicSignatureDescription')}
            />
          ) : (
            <div className="space-y-12">
              <PageHeaderFigures
                className="mt-0 sm:mt-0"
                figures={[
                  {
                    id: 'anchors',
                    label: s('stats.anchorActions'),
                    value: format.count(anchorCount),
                  },
                  {
                    id: 'releases',
                    label: s('stats.releaseActions'),
                    value: format.count(releaseCount),
                  },
                  {
                    id: 'distributions',
                    label: s('stats.totalDistributions'),
                    value: <Amount value={totalDistributionEth} unit="ETH" />,
                    caption: t('statistics.anchoring.stats.acrossNfts', {
                      count: cstAnchorDistributions.length,
                    }),
                  },
                  {
                    id: 'unretrieved',
                    label: s('stats.unretrievedDistributions'),
                    value: <Amount value={unretrievedEth} unit="ETH" />,
                  },
                ]}
              />
              <Ledger title={s('sections.actions')}>
                <AnchorActionsTable list={cstAnchorActions} IsRwalk={false} />
              </Ledger>
              <Ledger title={s('sections.distributionsByToken')}>
                <AnchorDistributionsTable list={cstAnchorDistributions} address={address} />
              </Ledger>
              <Ledger title={s('sections.distributionsByDeposit')}>
                <CSTAnchorDistributionsByDepositTable list={cstAnchorDistributionsByDeposit} />
              </Ledger>
              <Ledger title={s('sections.retrievedDistributions')}>
                <RetrievedCSTAnchorDistributionsTable list={retrievedCstAnchorDistributions} />
              </Ledger>
              <Ledger title={s('sections.unretrievedDistributions')}>
                <UnretrievedCSTAnchorDistributionsTable user={address} />
              </Ledger>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rwlk" className="mt-8">
          {!hasRwlkActivity ? (
            <EmptyState
              headingLevel={3}
              icon={<AnchoringIcon className="size-6" />}
              title={s('empty.randomWalkTitle')}
              description={s('empty.randomWalkDescription')}
            />
          ) : (
            <div className="space-y-12">
              <PageHeaderFigures
                className="mt-0 sm:mt-0"
                figures={[
                  {
                    id: 'anchors',
                    label: s('stats.anchorActions'),
                    value: format.count(rwlkStats?.TotalNumStakeActions ?? 0),
                  },
                  {
                    id: 'releases',
                    label: s('stats.releaseActions'),
                    value: format.count(rwlkStats?.TotalNumUnstakeActions ?? 0),
                  },
                  {
                    id: 'anchored',
                    label: s('stats.nftsAnchored'),
                    value: format.count(rwlkStats?.TotalTokensStaked ?? 0),
                  },
                  {
                    id: 'imprinted',
                    label: s('stats.nftsImprinted'),
                    value: format.count(rwlkStats?.TotalTokensMinted ?? 0),
                  },
                ]}
              />
              <Ledger title={s('sections.actions')}>
                <AnchorActionsTable list={rwlkAnchorActions} IsRwalk={true} />
              </Ledger>
              <Ledger title={s('sections.anchoredNftSelection')}>
                <RwalkAnchorDistributionImprintsTable list={rwlkImprints} />
              </Ledger>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

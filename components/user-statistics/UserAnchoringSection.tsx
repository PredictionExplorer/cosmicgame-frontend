'use client';

import { useId, useMemo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { AnchoringIcon } from '@/lib/conceptIcons';
import { useFormat } from '@/hooks/useFormat';
import type { AnchorAction, AnchorDistributionImprint } from '@/services/api';
import { Amount } from '@/components/ui/amount';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { FigureStrip } from '@/components/statistics/FigureStrip';
import AnchorActionsTable from '@/components/anchoring/AnchorActionsTable';
import { RwalkAnchorDistributionImprintsTable } from '@/components/anchoring/RwalkAnchorDistributionImprintsTable';

import { AnchorDistributionsLedger } from './AnchorDistributionsLedger';
import { anchoredNftDistributions } from './anchorLedger';
import type { UserProfileInfo } from './types';

export interface AnchorDistributionRow {
  TokenId: number;
  RewardCollectedEth?: number;
  RewardToCollectEth?: number;
  [key: string]: unknown;
}

/** Rows of the anchor and release history before it pages. */
const HISTORY_PAGE_SIZE = 10;

/** Props for the user anchoring section. */
export interface UserAnchoringSectionProps {
  address: string;
  /** The profile record, or null for an address without one (its Random Walk totals read as none). */
  userInfo: UserProfileInfo | null;
  /** The connected wallet's own profile: the ledger offers "Release all and retrieve". */
  canRelease: boolean;
  cstAnchorActions: AnchorAction[];
  rwlkAnchorActions: AnchorAction[];
  /** Anchor Distributions per anchored Cosmic Signature NFT. */
  cstAnchorDistributions: AnchorDistributionRow[];
  /** The same distributions per deposit, each naming the anchors it paid. */
  cstAnchorDistributionsByDeposit: readonly unknown[];
  /** Seeds of the Signatures the page already read (held and anchored), for the plates. */
  seeds: ReadonlyMap<number, string>;
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
 * A participant's anchoring, one underline tab per NFT kind. The Cosmic
 * Signature tab is a figure strip (anchor and release actions, Anchor
 * Distributions, what is left to retrieve), one ledger with a row per
 * anchored NFT that opens onto the deposits it shared in, and the anchor and
 * release history below it: each figure once, never the same amount again
 * per deposit. Copy names "this address", so the section reads right on
 * anyone's profile.
 */
export function UserAnchoringSection({
  address,
  userInfo,
  canRelease,
  cstAnchorActions,
  rwlkAnchorActions,
  cstAnchorDistributions,
  cstAnchorDistributionsByDeposit,
  seeds,
  rwlkImprints,
}: UserAnchoringSectionProps) {
  const t = useTranslations('myPages');
  const format = useFormat();
  const s = (key: string) => t(`statistics.anchoring.${key}`);

  const ledger = useMemo(
    () =>
      anchoredNftDistributions(
        cstAnchorDistributions,
        cstAnchorDistributionsByDeposit,
        cstAnchorActions,
      ),
    [cstAnchorDistributions, cstAnchorDistributionsByDeposit, cstAnchorActions],
  );
  const anchorCount = cstAnchorActions.filter((a) => a.ActionType !== 1).length;
  const releaseCount = cstAnchorActions.filter((a) => a.ActionType === 1).length;
  const retrievedEth = ledger.reduce((sum, row) => sum + row.retrievedEth, 0);
  const unretrievedEth = ledger.reduce((sum, row) => sum + row.toRetrieveEth, 0);

  const rwlkStats = userInfo?.StakingStatisticsRWalk;
  const hasCstActivity = cstAnchorActions.length > 0 || ledger.length > 0;
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
              <FigureStrip
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
                    value: <Amount value={retrievedEth + unretrievedEth} unit="ETH" />,
                    caption: t('statistics.anchoring.stats.acrossNfts', { count: ledger.length }),
                  },
                  {
                    id: 'unretrieved',
                    label: s('stats.unretrievedDistributions'),
                    value: <Amount value={unretrievedEth} unit="ETH" />,
                  },
                ]}
              />
              <Ledger title={s('sections.distributionsByToken')}>
                <AnchorDistributionsLedger
                  address={address}
                  rows={ledger}
                  deposits={cstAnchorDistributionsByDeposit}
                  seeds={seeds}
                  canRelease={canRelease}
                />
              </Ledger>
              <Ledger title={s('sections.actions')}>
                <AnchorActionsTable
                  list={cstAnchorActions}
                  IsRwalk={false}
                  headingLevel={4}
                  pageSize={HISTORY_PAGE_SIZE}
                />
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
              <FigureStrip
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
                <AnchorActionsTable
                  list={rwlkAnchorActions}
                  IsRwalk={true}
                  headingLevel={4}
                  pageSize={HISTORY_PAGE_SIZE}
                />
              </Ledger>
              <Ledger title={s('sections.anchoredNftSelection')}>
                <RwalkAnchorDistributionImprintsTable list={rwlkImprints} headingLevel={4} />
              </Ledger>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

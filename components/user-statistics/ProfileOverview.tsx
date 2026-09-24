'use client';

import { useTranslations } from 'next-intl';

import { useFormat } from '@/hooks/useFormat';
import { Amount } from '@/components/ui/amount';
import { DateTime } from '@/components/ui/date-time';
import { UnknownValue } from '@/components/ui/unknown-value';
import { StatisticsGroup } from '@/components/statistics/StatisticsGroup';
import { StatisticsItem } from '@/components/statistics/StatisticsItem';
import { DefinitionsDisclosure } from '@/components/statistics/DefinitionsDisclosure';
import { SectionShell } from '@/components/statistics/SectionShell';

import type { GestureSummary } from './profileSummary';
import type { UserProfileInfo } from './types';

export interface ProfileOverviewProps {
  address: string;
  userInfo: UserProfileInfo;
  gestures: GestureSummary;
  /** Unix seconds of the most recent gesture. */
  latestGestureTs: number | null;
  /** Cosmic Signature and RandomWalk NFTs anchored now. */
  anchoredNow: number;
  /** Anchor and release actions for both kinds. */
  anchorActions: number;
  /** ETH Anchor Distributions, retrieved and not. */
  anchorDistributionsEth: number;
}

/**
 * "At a glance": the figures behind a participant's history that the header
 * does not already show, in four spec sheets (gestures, Stellar Selection,
 * Cosmic Signature NFTs, anchoring) with one Definitions disclosure. Every
 * figure appears once on the page.
 */
export function ProfileOverview({
  address,
  userInfo,
  gestures,
  latestGestureTs,
  anchoredNow,
  anchorActions,
  anchorDistributionsEth,
}: ProfileOverviewProps) {
  const t = useTranslations('myPages');
  const tCommon = useTranslations('common');
  const format = useFormat();
  const o = (key: string) => t(`statistics.overview.${key}`);
  const stellarEthTotal =
    (userInfo.SumRaffleEthWinnings ?? 0) + (userInfo.SumRaffleEthWithdrawal ?? 0);

  return (
    <SectionShell title={o('title')}>
      <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
        <StatisticsGroup title={o('gestures.title')}>
          <StatisticsItem
            title={o('gestures.largest')}
            value={<Amount value={userInfo.MaxBidAmount ?? 0} unit="ETH" />}
          />
          <StatisticsItem
            title={o('gestures.firstCycle')}
            value={
              gestures.firstCycle === null ? (
                <UnknownValue label={tCommon('status.unavailable')} />
              ) : (
                // "Cycle 0", as the profile's badges and pool name a cycle.
                t('shared.cycleNumber', { cycle: gestures.firstCycle })
              )
            }
          />
          <StatisticsItem
            title={o('gestures.latest')}
            value={
              latestGestureTs ? (
                <DateTime timestamp={latestGestureTs} />
              ) : (
                <UnknownValue label={tCommon('status.unavailable')} />
              )
            }
          />
        </StatisticsGroup>

        <StatisticsGroup title={o('stellarSelection.title')}>
          <StatisticsItem
            title={o('stellarSelection.ethSelections')}
            value={format.count(userInfo.NumRaffleEthWinnings ?? 0)}
          />
          <StatisticsItem
            title={o('stellarSelection.ethAllocated')}
            value={<Amount value={stellarEthTotal} unit="ETH" />}
            href={`/user/stellar-selection-eth/${address}`}
          />
          <StatisticsItem
            title={o('stellarSelection.ethRetrieved')}
            value={<Amount value={userInfo.SumRaffleEthWithdrawal ?? 0} unit="ETH" />}
          />
          <StatisticsItem
            title={o('stellarSelection.nfts')}
            value={format.count(userInfo.RaffleNFTsCount ?? 0)}
            href={`/user/stellar-selection-nft/${address}`}
          />
        </StatisticsGroup>

        <StatisticsGroup title={o('nfts.title')}>
          <StatisticsItem
            title={o('nfts.received')}
            value={format.count(userInfo.TotalCSTokensWon ?? 0)}
          />
          <StatisticsItem
            title={o('nfts.toRetrieve')}
            value={format.count(userInfo.UnclaimedNFTs ?? 0)}
          />
          <StatisticsItem
            title={o('nfts.transfers')}
            value={format.count(userInfo.CosmicSignatureNumTransfers ?? 0)}
            href={`/cosmic-signature-transfer/${address}`}
          />
        </StatisticsGroup>

        <StatisticsGroup title={o('anchoring.title')}>
          <StatisticsItem title={o('anchoring.anchoredNow')} value={format.count(anchoredNow)} />
          <StatisticsItem title={o('anchoring.actions')} value={format.count(anchorActions)} />
          <StatisticsItem
            title={o('anchoring.distributions')}
            value={<Amount value={anchorDistributionsEth} unit="ETH" />}
          />
        </StatisticsGroup>
      </div>

      <DefinitionsDisclosure
        className="mt-8"
        label={o('definitions.label')}
        items={[
          { term: o('gestures.largest'), definition: o('definitions.largest') },
          { term: o('stellarSelection.ethAllocated'), definition: o('definitions.ethAllocated') },
          { term: o('stellarSelection.nfts'), definition: o('definitions.selectionNfts') },
          { term: o('nfts.received'), definition: o('definitions.nftsReceived') },
          { term: o('nfts.toRetrieve'), definition: o('definitions.toRetrieve') },
          { term: o('anchoring.distributions'), definition: o('definitions.distributions') },
        ]}
      />
    </SectionShell>
  );
}

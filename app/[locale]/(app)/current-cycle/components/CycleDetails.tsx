'use client';

import { useTranslations } from 'next-intl';

import type { EnduranceChampion } from '@/utils';

import { SectionHeader } from '@/components/ui/section-header';
import type { DonatedERC20Token } from '@/components/attachments/AttachedERC20Table';
import EthDonationTable, { type EthDonation } from '@/components/tables/EthDonationTable';
import GestureHistory from '@/components/tables/GestureHistoryTable';
import type { AttachedNFT, DashboardInfo, GestureInfo } from '@/services/api/types';

import { AttachedTokensSection } from './AttachedTokensSection';
import { CycleAllocations } from './CycleAllocations';
import { CycleParticipants } from './CycleParticipants';
import { CycleRules } from './CycleRules';

export interface CycleDetailsProps {
  data: DashboardInfo;
  gestures: GestureInfo[];
  gesturesLoading: boolean;
  gesturesError: boolean;
  onRetryGestures: () => void;
  championList: EnduranceChampion[] | null;
  ethDonations: EthDonation[];
  attachedNfts: AttachedNFT[];
  attachedErc20: DonatedERC20Token[];
}

/**
 * Everything under the clock, one section per question: where the reserve
 * goes, where each participant stands, every gesture so far, direct ETH
 * contributions and attached assets (only when there are some), and the
 * rules the cycle runs on. Each section is an H2 on the page's one content
 * edge, with no box around it.
 */
export function CycleDetails({
  data,
  gestures,
  gesturesLoading,
  gesturesError,
  onRetryGestures,
  championList,
  ethDonations,
  attachedNfts,
  attachedErc20,
}: CycleDetailsProps) {
  const t = useTranslations('currentCycle');

  return (
    <div className="space-y-[calc(var(--block-gap)*1.5)]">
      <CycleAllocations data={data} headingId="cycle-allocations-heading" />

      <CycleParticipants
        data={data}
        gestures={gestures}
        championList={championList}
        loading={gesturesLoading}
        error={gesturesError}
        onRetry={onRetryGestures}
        headingId="cycle-participants-heading"
      />

      <section
        aria-labelledby="cycle-gestures-heading"
        id="gesture-history"
        className="scroll-mt-24"
      >
        <SectionHeader
          headingId="cycle-gestures-heading"
          title={t('sections.gestureHistory.title')}
          description={t('sections.gestureHistory.tooltip')}
        />
        <GestureHistory
          gestureHistory={gestures}
          showRound={false}
          loading={gesturesLoading}
          error={gesturesError ? t('error.message') : undefined}
          onRetry={onRetryGestures}
          headingLevel={3}
        />
      </section>

      {ethDonations.length > 0 ? (
        <section aria-labelledby="cycle-contributions-heading">
          <SectionHeader
            headingId="cycle-contributions-heading"
            title={t('sections.ethContributions.title')}
            description={t('sections.ethContributions.tooltip')}
          />
          <EthDonationTable list={ethDonations} showType={false} headingLevel={3} />
        </section>
      ) : null}

      <AttachedTokensSection
        nfts={attachedNfts}
        erc20Tokens={attachedErc20}
        headingId="cycle-attached-heading"
      />

      <CycleRules data={data} headingId="cycle-rules-heading" />
    </div>
  );
}

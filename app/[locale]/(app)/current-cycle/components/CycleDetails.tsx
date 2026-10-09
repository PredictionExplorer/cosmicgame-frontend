'use client';

import { useLocale, useTranslations } from 'next-intl';

import type { EnduranceChampion } from '@/utils';

import { SectionHeader } from '@/components/ui/section-header';
import type { DonatedERC20Token } from '@/components/attachments/AttachedERC20Table';
import EthDonationTable, { type EthDonation } from '@/components/tables/EthDonationTable';
import GestureHistory from '@/components/tables/GestureHistoryTable';
import type { AttachedNFT, DashboardInfo, GestureInfo } from '@/services/api/types';
import { toFiniteNumber } from '@/utils/finiteNumber';

import { AttachedTokensSection } from './AttachedTokensSection';
import { CycleAllocations } from './CycleAllocations';
import { CycleParticipants } from './CycleParticipants';
import { CycleRules } from './CycleRules';
import { CYCLE_SECTION_SCROLL_MARGIN } from './CycleSectionNav';
import { TitleWithCount } from './TitleWithCount';

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
 * goes and the assets attached to the Signature Allocation (only when there
 * are some), where each participant stands, every gesture so far, direct ETH
 * contributions (only when there are some), and the rules the cycle runs
 * on. Each section is an H2 on the page's one content edge, with no box
 * around it; the ledgers' H2s carry their row counts.
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
  const locale = useLocale();
  const gestureCount = toFiniteNumber(data.CurNumBids);

  return (
    <div className="space-y-[calc(var(--block-gap)*1.5)]">
      <CycleAllocations data={data} headingId="cycle-allocations-heading" />

      {/* Attached assets travel with the Signature Allocation, so they follow the split. */}
      <AttachedTokensSection
        nfts={attachedNfts}
        erc20Tokens={attachedErc20}
        headingId="cycle-attached-heading"
      />

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
        className={CYCLE_SECTION_SCROLL_MARGIN}
      >
        <SectionHeader
          headingId="cycle-gestures-heading"
          title={
            <TitleWithCount
              title={t('sections.gestureHistory.title')}
              count={gestureCount}
              locale={locale}
            />
          }
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

      <CycleRules data={data} headingId="cycle-rules-heading" />
    </div>
  );
}

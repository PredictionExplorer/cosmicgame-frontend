'use client';

import { type SyntheticEvent, type ComponentProps, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';
import { type EnduranceChampion } from '@/utils';

import { formatAmount, formatCount } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';
import Allocation from '@/components/common/Allocation';
import GestureHistory from '@/components/tables/GestureHistoryTable';
import StellarSelectionHolderTable from '@/components/tables/StellarSelectionHolderTable';
import ETHSpentTable from '@/components/tables/ETHSpentTable';
import EnduranceChampionsTable from '@/components/tables/EnduranceChampionsTable';
import EthDonationTable from '@/components/tables/EthDonationTable';
import { FundDistribution } from '@/components/tokens/FundDistribution';
import { DonatedTokensSection } from '@/components/home/DonatedTokensSection';
import { Amount } from '@/components/ui/amount';
import { Duration } from '@/components/ui/duration';
import { SectionHeader } from '@/components/ui/section-header';
import { UnknownValue } from '@/components/ui/unknown-value';
import { useNow } from '@/hooks/useNow';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import type { DashboardInfo, GestureInfo, AttachedNFT } from '@/services/api/types';

interface RoundInfoSectionProps {
  data: DashboardInfo | null;
  curGestureList: GestureInfo[];
  championList: EnduranceChampion[] | null;
  ethDonations: import('@/components/tables/EthDonationTable').EthDonation[];
  donatedNFTs: AttachedNFT[];
  donatedERC20Tokens: import('@/components/attachments/AttachedERC20Table').DonatedERC20Token[];
  donatedTokensTab: number;
  onTabChange: (_event: SyntheticEvent, newValue: number) => void;
  curPage: number;
  setCurPage: (page: number) => void;
  perPage: number;
}

// Transform-only (no opacity ramp): the first sections render in the initial
// viewport on /current-cycle, so an opacity-0 server render would delay the
// page's LCP until hydration.
const sectionFade = {
  hidden: { y: 16 },
  visible: (i: number) => ({
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
};

/** Displays full cycle details: allocation breakdown, fund distribution, leaderboards, gesture history, contributions, and rules. */
export function RoundInfoSection({
  data,
  curGestureList,
  championList,
  ethDonations,
  donatedNFTs,
  donatedERC20Tokens,
  donatedTokensTab,
  onTabChange,
  curPage,
  setCurPage,
  perPage,
}: RoundInfoSectionProps) {
  const t = useTranslations('currentCycle');
  const locale = useLocale();

  const uniqueParticipants = useMemo(() => {
    const addrs = new Set(curGestureList.map((b) => b.BidderAddr));
    return addrs.size;
  }, [curGestureList]);

  const tCommon = useTranslations('common');
  const nowMs = useNow(1000);
  const elapsedSeconds =
    data?.TsRoundStart && nowMs > 0 && Math.floor(nowMs / 1000) > data.TsRoundStart
      ? Math.floor(nowMs / 1000) - data.TsRoundStart
      : null;
  const contractBalance = toFiniteNumber(data?.CosmicGameBalanceEth);

  // The ledgers sit straight under their section titles, like the Stellar
  // Selection and top-spender tables: the section is their one frame, so no
  // second box or palette-blind hsl() stripe wraps them.
  return (
    <div className="space-y-16">
      {/* 1. Allocation Breakdown */}
      <motion.div
        id="allocation-breakdown"
        custom={0}
        variants={sectionFade}
        initial="hidden"
        animate="visible"
        className="scroll-mt-24"
      >
        {data && <Allocation data={data} />}
      </motion.div>

      {/* 2. Fund Distribution */}
      <motion.section
        aria-labelledby="cycle-allocation-tracks"
        custom={1}
        variants={sectionFade}
        initial="hidden"
        animate="visible"
      >
        <SectionHeader
          headingId="cycle-allocation-tracks"
          title={t('sections.allocationTracks.title')}
          info={t('sections.allocationTracks.tooltip')}
        />
        <FundDistribution data={data ?? undefined} />
      </motion.section>

      {/* 3. Stellar Selection Entries */}
      <motion.section
        aria-labelledby="cycle-stellar-selection"
        custom={2}
        variants={sectionFade}
        initial="hidden"
        animate="visible"
      >
        <SectionHeader
          headingId="cycle-stellar-selection"
          title={t('sections.stellarSelectionEntries.title')}
          info={t('sections.stellarSelectionEntries.tooltip')}
        />
        <StellarSelectionHolderTable
          list={curGestureList}
          numRaffleEthWinner={data?.NumRaffleEthWinnersBidding}
          numRaffleNFTWinner={data?.NumRaffleNFTWinnersBidding}
        />
      </motion.section>

      {/* 4. Top ETH Spenders */}
      <motion.section
        aria-labelledby="cycle-top-eth-spenders"
        custom={3}
        variants={sectionFade}
        initial="hidden"
        animate="visible"
      >
        <SectionHeader
          headingId="cycle-top-eth-spenders"
          title={t('sections.topEthSpenders.title')}
          info={t('sections.topEthSpenders.tooltip')}
        />
        <ETHSpentTable list={curGestureList as ComponentProps<typeof ETHSpentTable>['list']} />
      </motion.section>

      {/* 5. Endurance Champions */}
      <motion.section
        aria-labelledby="cycle-endurance-champions"
        custom={4}
        variants={sectionFade}
        initial="hidden"
        animate="visible"
      >
        <SectionHeader
          headingId="cycle-endurance-champions"
          title={t('sections.enduranceChampions.title')}
          info={t('sections.enduranceChampions.tooltip')}
        />
        <EnduranceChampionsTable
          championList={championList}
          lastBidderAddress={data?.LastBidderAddr ?? null}
        />
      </motion.section>

      {/* 6. Gesture History */}
      <motion.section
        aria-labelledby="cycle-gesture-history"
        custom={5}
        variants={sectionFade}
        initial="hidden"
        animate="visible"
      >
        <SectionHeader
          headingId="cycle-gesture-history"
          title={t('sections.gestureHistory.title', { n: data?.CurRoundNum ?? '' })}
          info={t('sections.gestureHistory.tooltip')}
        />
        <GestureHistory gestureHistory={curGestureList} showRound={false} />
      </motion.section>

      {/* 7. ETH Contributions (conditional) */}
      {ethDonations.length > 0 && (
        <motion.section
          aria-labelledby="cycle-eth-contributions"
          custom={6}
          variants={sectionFade}
          initial="hidden"
          animate="visible"
        >
          <SectionHeader
            headingId="cycle-eth-contributions"
            title={t('sections.ethContributions.title')}
            info={t('sections.ethContributions.tooltip')}
          />
          <EthDonationTable list={ethDonations} showType={false} />
        </motion.section>
      )}

      {/* 8. Attached Tokens */}
      <motion.div custom={7} variants={sectionFade} initial="hidden" animate="visible">
        <DonatedTokensSection
          donatedNFTs={donatedNFTs}
          donatedERC20Tokens={donatedERC20Tokens}
          donatedTokensTab={donatedTokensTab}
          onTabChange={onTabChange}
          curPage={curPage}
          setCurPage={setCurPage}
          perPage={perPage}
        />
      </motion.div>

      {/* 9. Cycle Rules (collapsible) */}
      <motion.section
        aria-labelledby="cycle-rules"
        custom={8}
        variants={sectionFade}
        initial="hidden"
        animate="visible"
      >
        <SectionHeader
          headingId="cycle-rules"
          title={t('sections.cycleRules.title')}
          info={t('sections.cycleRules.tooltip')}
        />
        <div className="rounded-surface border border-rule-faint bg-surface/60">
          <Accordion type="single" collapsible>
            <AccordionItem value="rules" className="border-b-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <span className="flex items-center gap-2">
                  <BookOpen className="size-4 text-subtle" aria-hidden />
                  <span className="type-title text-foreground">{t('rules.howItWorks')}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <div className="type-body-sm max-w-[var(--measure-prose)] space-y-3 text-muted-foreground">
                  <p>
                    {t.rich('rules.participation', {
                      em: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
                    })}
                  </p>
                  <p>
                    {t('rules.calibration', {
                      decreasePercent:
                        protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture,
                      increasePercent:
                        protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture,
                    })}
                  </p>
                  <p>
                    {t('rules.stellarSelection', {
                      ethEntries: data?.NumRaffleEthWinnersBidding ?? '',
                      rafflePercent: data?.RafflePercentage ?? '',
                      nftEntries: data?.NumRaffleNFTWinnersBidding ?? '',
                      anchorHolders: data?.NumRaffleNFTWinnersStakingRWalk ?? '',
                    })}
                  </p>
                  <p>
                    {t('rules.publicGoods', {
                      percent: data?.CharityPercentage ?? 0,
                      amount: formatAmount(
                        (toFiniteNumber(data?.CosmicGameBalanceEth) ?? 0) *
                          ((data?.CharityPercentage ?? 0) / 100),
                        { unit: 'ETH', locale, withUnit: false },
                      ),
                    })}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </motion.section>

      {/* 10. Cycle summary: three figures on one frame, divided by hairlines. */}
      <motion.div custom={9} variants={sectionFade} initial="hidden" animate="visible">
        <dl
          data-testid="round-summary-footer"
          className="grid gap-5 rounded-surface border border-rule-faint bg-surface/60 p-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-rule-faint sm:p-6"
        >
          <div className="min-w-0 sm:pe-6">
            <dt className="type-label text-subtle">{t('footer.contractBalance')}</dt>
            <dd className="type-figure-md mt-1 text-foreground">
              {contractBalance == null ? (
                <UnknownValue label={tCommon('status.unavailable')} />
              ) : (
                <Amount value={contractBalance} unit="ETH" context="card" />
              )}
            </dd>
          </div>
          <div className="min-w-0 sm:px-6">
            <dt className="type-label text-subtle">{t('footer.cycleDuration')}</dt>
            <dd className="type-figure-md mt-1 text-foreground">
              {elapsedSeconds != null ? (
                <Duration seconds={elapsedSeconds} />
              ) : (
                <span className="type-body-md text-muted-foreground">{t('status.notStarted')}</span>
              )}
            </dd>
          </div>
          <div className="min-w-0 sm:ps-6">
            <dt className="type-label text-subtle">{t('footer.uniqueParticipants')}</dt>
            <dd className="type-figure-md mt-1 text-foreground">
              {formatCount(uniqueParticipants, locale)}
            </dd>
          </div>
        </dl>
      </motion.div>
    </div>
  );
}

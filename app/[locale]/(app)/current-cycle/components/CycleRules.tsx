import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { Link } from '@/i18n/navigation';
import { SectionHeader } from '@/components/ui/section-header';
import type { DashboardInfo } from '@/services/api/types';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatAmount, formatCount, UNAVAILABLE_VALUE } from '@/utils/format';

import { CYCLE_SECTION_SCROLL_MARGIN } from './CycleSectionNav';

/**
 * The rules this cycle runs on, read from the live parameters: Participation
 * CST, the CST Calibration Window, Stellar Selection and Public Goods. Four
 * short notes in the open, with the full explanation one link away. Counts
 * and shares are formatted for the reader's locale.
 */
export function CycleRules({ data, headingId }: { data: DashboardInfo; headingId: string }) {
  const t = useTranslations('currentCycle');
  const locale = useLocale();
  const count = (value: unknown) => {
    const n = toFiniteNumber(value);
    return n === null ? UNAVAILABLE_VALUE : formatCount(n, locale);
  };
  const balance = toFiniteNumber(data.CosmicGameBalanceEth);
  const charity = toFiniteNumber(data.CharityPercentage);
  const publicGoodsEth = balance !== null && charity !== null ? (balance * charity) / 100 : null;

  const rules = [
    t.rich('rules.participation', {
      em: (chunks) => <strong className="font-medium text-foreground">{chunks}</strong>,
    }),
    t('rules.calibration', {
      decreasePercent: protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture,
      increasePercent: protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture,
    }),
    t('rules.stellarSelection', {
      ethEntries: count(data.NumRaffleEthWinnersBidding),
      rafflePercent: count(data.RafflePercentage),
      nftEntries: count(data.NumRaffleNFTWinnersBidding),
      anchorHolders: count(data.NumRaffleNFTWinnersStakingRWalk),
    }),
    t('rules.publicGoods', {
      percent: count(data.CharityPercentage),
      amount: formatAmount(publicGoodsEth, { unit: 'ETH', locale, withUnit: false }),
    }),
  ];

  return (
    <section aria-labelledby={headingId} id="rules" className={CYCLE_SECTION_SCROLL_MARGIN}>
      <SectionHeader
        headingId={headingId}
        title={t('sections.cycleRules.title')}
        actions={
          <Link href="/how-it-works" className="link type-body-sm">
            {t('rules.learnMore')}
          </Link>
        }
      />
      <ul className="grid gap-x-10 border-t border-rule md:grid-cols-2">
        {rules.map((rule, index) => (
          <li
            key={index}
            className="border-b border-rule-faint py-4 type-body-sm text-muted-foreground"
          >
            {rule}
          </li>
        ))}
      </ul>
    </section>
  );
}

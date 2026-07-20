'use client';

import { useTranslations } from 'next-intl';

import { SectionDivider } from '@/components/ui/section-divider';
import { RoiLeaderboardSection } from '@/components/statistics/RoiLeaderboardSection';
import { ClaimsByRoundSection } from '@/components/statistics/ClaimsByRoundSection';

/** Participant performance leaderboard and allocation claims by cycle. */
const PerformancePanel = () => {
  const t = useTranslations('statistics');

  return (
    <div data-testid="performance-panel">
      <SectionDivider title={t('performance.leaderboardTitle')} className="mb-6" />
      <RoiLeaderboardSection />
      <div className="mt-12">
        <SectionDivider title={t('performance.claimsTitle')} className="mb-6" />
        <ClaimsByRoundSection />
      </div>
    </div>
  );
};

export default PerformancePanel;

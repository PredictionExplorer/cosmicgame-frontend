'use client';

import { useTranslations } from 'next-intl';

import { SectionShell } from '@/components/statistics/SectionShell';
import { ParticipantOutcomesSection } from '@/components/statistics/ParticipantOutcomesSection';
import { ClaimsByRoundSection } from '@/components/statistics/ClaimsByRoundSection';

/**
 * Participant outcomes: what each participant spent beside what came back
 * to them, then how every cycle's retrievable assets were retrieved.
 */
const PerformancePanel = () => {
  const t = useTranslations('statistics');

  return (
    <div data-testid="performance-panel" className="space-y-12 sm:space-y-16">
      <SectionShell title={t('performance.leaderboardTitle')}>
        <ParticipantOutcomesSection />
      </SectionShell>
      <SectionShell title={t('performance.claimsTitle')}>
        <ClaimsByRoundSection />
      </SectionShell>
    </div>
  );
};

export default PerformancePanel;

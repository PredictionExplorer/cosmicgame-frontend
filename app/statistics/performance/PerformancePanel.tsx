'use client';

import { SectionDivider } from '@/components/ui/section-divider';
import { RoiLeaderboardSection } from '@/components/statistics/RoiLeaderboardSection';
import { ClaimsByRoundSection } from '@/components/statistics/ClaimsByRoundSection';

/** Participant performance leaderboard and allocation claims by cycle. */
const PerformancePanel = () => {
  return (
    <div data-testid="performance-panel">
      <SectionDivider title="Participant Performance" className="mb-6" />
      <RoiLeaderboardSection />
      <div className="mt-12">
        <SectionDivider title="Allocation Claims by Cycle" className="mb-6" />
        <ClaimsByRoundSection />
      </div>
    </div>
  );
};

export default PerformancePanel;

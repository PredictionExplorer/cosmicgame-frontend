'use client';

// lexicon-allow-start: internal analytics identifiers mirror backend wire names
import { BarChart3, Flame, Users } from 'lucide-react';

import { SectionDivider } from '@/components/ui/section-divider';
import { CollapsibleSection } from '@/components/statistics/CollapsibleSection';
import { BidFrequencyChart } from '@/components/statistics/BidFrequencyChart';
import { LastBidSpikeChart } from '@/components/statistics/LastBidSpikeChart';
import { BidderActivePeriodsTimeline } from '@/components/statistics/BidderActivePeriodsTimeline';

/** Bidding analytics charts for the statistics page. */
export function BiddingActivitySection() {
  return (
    <div className="mt-10">
      <SectionDivider title="Gesture Activity" className="mb-6" />

      <div className="space-y-4">
        <CollapsibleSection
          title="Gesture Frequency Over Time"
          description="Indexed gesture counts grouped over time to show protocol activity patterns."
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          defaultOpen
        >
          <BidFrequencyChart />
        </CollapsibleSection>

        <CollapsibleSection
          title="Gesture Spikes"
          description="Periods where gesture activity changed quickly compared with surrounding activity."
          icon={<Flame className="h-3.5 w-3.5" />}
          defaultOpen
        >
          <LastBidSpikeChart />
        </CollapsibleSection>

        <CollapsibleSection
          title="Top 20 Participant Active Periods"
          description="The longest indexed active participation windows for the most active wallets."
          icon={<Users className="h-3.5 w-3.5" />}
          defaultOpen
        >
          <BidderActivePeriodsTimeline />
        </CollapsibleSection>
      </div>
    </div>
  );
}
// lexicon-allow-end

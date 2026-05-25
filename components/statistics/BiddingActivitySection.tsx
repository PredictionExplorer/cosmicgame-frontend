'use client';

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
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          defaultOpen
        >
          <BidFrequencyChart />
        </CollapsibleSection>

        <CollapsibleSection
          title="Gesture Spikes"
          icon={<Flame className="h-3.5 w-3.5" />}
          defaultOpen
        >
          <LastBidSpikeChart />
        </CollapsibleSection>

        <CollapsibleSection
          title="Top 20 Participant Active Periods"
          icon={<Users className="h-3.5 w-3.5" />}
          defaultOpen
        >
          <BidderActivePeriodsTimeline />
        </CollapsibleSection>
      </div>
    </div>
  );
}

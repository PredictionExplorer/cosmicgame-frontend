import type { HowItWorksContent } from '@/content/how-it-works';

import type { AllocationTrackId } from '@/config/allocationTracks';
import { PageShell } from '@/components/ui/page-shell';

import { CallToAction } from './components/CallToAction';
import { CycleTimeline } from './components/CycleTimeline';
import { GestureCosts } from './components/GestureCosts';
import { HeroSection } from './components/HeroSection';
import { ProTips } from './components/ProTips';
import { RewardBreakdown } from './components/RewardBreakdown';
import { StepByStep } from './components/StepByStep';

/**
 * How it works: the mechanism drawn once (the cycle timeline, its key and
 * its payoff), then what a gesture leads to and what it costs, how to start,
 * what is good to know, and one closing call to action. Server-rendered and
 * static: every rule is in the visible copy, so nothing on the page hydrates
 * to explain itself.
 */
export default function HowToPlayPage({
  content,
  trackLabels,
  locale,
  unavailableLabel,
}: {
  content: HowItWorksContent;
  /** Each allocation track's name, for the drawing's key. */
  trackLabels: Readonly<Record<AllocationTrackId, string>>;
  locale: string;
  /** "Artwork unavailable", for the payoff plate when the image cannot load. */
  unavailableLabel: string;
}) {
  return (
    <PageShell variant="marketing" backdrop="signature">
      <HeroSection hero={content.hero} />
      <div className="mt-12 flex flex-col gap-20 sm:mt-16 sm:gap-24">
        <CycleTimeline
          gameCycle={content.gameCycle}
          payoff={content.payoff}
          trackLabels={trackLabels}
          locale={locale}
          unavailableLabel={unavailableLabel}
        />
        <div className="flex flex-col gap-14 sm:gap-16">
          <RewardBreakdown rewardBreakdown={content.rewardBreakdown} />
          <GestureCosts costs={content.costs} />
        </div>
        <StepByStep stepByStep={content.stepByStep} />
        <ProTips proTips={content.proTips} />
        <CallToAction callToAction={content.callToAction} />
      </div>
    </PageShell>
  );
}

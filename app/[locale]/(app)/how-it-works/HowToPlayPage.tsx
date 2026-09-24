import type { HowItWorksContent } from '@/content/how-it-works';

import { PageShell } from '@/components/ui/page-shell';

import { CallToAction } from './components/CallToAction';
import { CycleTimeline } from './components/CycleTimeline';
import { HeroSection } from './components/HeroSection';
import { ProTips } from './components/ProTips';
import { RewardBreakdown } from './components/RewardBreakdown';
import { StepByStep } from './components/StepByStep';

/**
 * How it works: the mechanism drawn once (the cycle timeline and its payoff),
 * then what a gesture leads to, how to start, tips, and one closing call to
 * action. Server-rendered; only the term explanations hydrate.
 */
export default function HowToPlayPage({
  content,
  unavailableLabel,
}: {
  content: HowItWorksContent;
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
          unavailableLabel={unavailableLabel}
        />
        <RewardBreakdown rewardBreakdown={content.rewardBreakdown} />
        <StepByStep stepByStep={content.stepByStep} />
        <ProTips proTips={content.proTips} />
        <CallToAction callToAction={content.callToAction} />
      </div>
    </PageShell>
  );
}

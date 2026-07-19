'use client';

import type { HowItWorksContent } from '@/content/how-it-works';

import { PageShell } from '@/components/ui/page-shell';
import { SectionDivider } from '@/components/ui/section-divider';

import { HeroSection } from './components/HeroSection';
import { GameOverview } from './components/GameOverview';
import { RewardBreakdown } from './components/RewardBreakdown';
import { GameCycle } from './components/GameCycle';
import { StepByStep } from './components/StepByStep';
import { ProTips } from './components/ProTips';
import { FAQCallout } from './components/FAQCallout';
import { CallToAction } from './components/CallToAction';

const HowToPlayPage = ({ content }: { content: HowItWorksContent }) => {
  return (
    <PageShell variant="marketing" backdrop="signature">
      <HeroSection hero={content.hero} />
      <SectionDivider />
      <GameOverview overview={content.overview} />
      <SectionDivider />
      <RewardBreakdown rewardBreakdown={content.rewardBreakdown} />
      <SectionDivider />
      <GameCycle gameCycle={content.gameCycle} />
      <SectionDivider />
      <StepByStep stepByStep={content.stepByStep} />
      <SectionDivider />
      <ProTips proTips={content.proTips} />
      <SectionDivider />
      <FAQCallout faqCallout={content.faqCallout} />
      <SectionDivider />
      <CallToAction callToAction={content.callToAction} />
    </PageShell>
  );
};

export default HowToPlayPage;

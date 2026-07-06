'use client';

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

const HowToPlayPage = () => {
  return (
    <PageShell variant="marketing" backdrop="signature">
      <HeroSection />
      <SectionDivider />
      <GameOverview />
      <SectionDivider />
      <RewardBreakdown />
      <SectionDivider />
      <GameCycle />
      <SectionDivider />
      <StepByStep />
      <SectionDivider />
      <ProTips />
      <SectionDivider />
      <FAQCallout />
      <SectionDivider />
      <CallToAction />
    </PageShell>
  );
};

export default HowToPlayPage;

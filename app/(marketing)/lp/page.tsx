import type { Metadata } from 'next';

import { Stars } from '@/components/landing/Stars';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { EthFlow } from '@/components/landing/EthFlow';
import { PrizeCategories } from '@/components/landing/PrizeCategories';
import { WhyDifferent } from '@/components/landing/WhyDifferent';
import { GameFeatures } from '@/components/landing/GameFeatures';
import { ArtShowcase } from '@/components/landing/ArtShowcase';
import { PublicGoods } from '@/components/landing/PublicGoods';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'Cosmic Signature | The Strategic On-Chain Game on Arbitrum',
  description:
    'Bid. Endure. Win. Give. The last-bidder-wins strategy game on Arbitrum with 10+ prize categories, zero creator ETH extraction, NFT staking yield, DAO governance, and 7% funding Ethereum development via Protocol Guild every round.',
  openGraph: {
    title: 'Cosmic Signature | Strategic On-Chain Game',
    description:
      'The last-bidder-wins strategy game on Arbitrum. Zero ETH to creators. 10+ winners every round. 7% funds Ethereum core development via Protocol Guild.',
    url: 'https://cosmicsignature.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmic Signature | Strategic On-Chain Game',
    description:
      'Bid. Endure. Win. Give. Zero ETH to creators. 10+ winners per round. 7% to Protocol Guild.',
  },
};

export default function LandingPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        fontFamily: "Inter, 'Inter', sans-serif",
        background: '#0D0521',
        color: '#F0EDFF',
      }}
    >
      <Stars />
      <LandingNav />
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <EthFlow />
      <PrizeCategories />
      <WhyDifferent />
      <GameFeatures />
      <ArtShowcase />
      <PublicGoods />
      <CTASection />
      <LandingFooter />
    </div>
  );
}

import { AllocationTracks } from '@/components/landing-v2/AllocationTracks';
import { Anchoring } from '@/components/landing-v2/Anchoring';
import { CosmicCouncil } from '@/components/landing-v2/CosmicCouncil';
import { Hero } from '@/components/landing-v2/Hero';
import { LandingFAQ } from '@/components/landing-v2/LandingFAQ';
import { LandingFooter } from '@/components/landing-v2/LandingFooter';
import { PublicGoods } from '@/components/landing-v2/PublicGoods';
import { TheArt } from '@/components/landing-v2/TheArt';
import { TheCycle } from '@/components/landing-v2/TheCycle';
import { Verifiability } from '@/components/landing-v2/Verifiability';

export default function LandingPage() {
  return (
    <main className="relative">
      <Hero />
      <TheCycle />
      <TheArt />
      <AllocationTracks />
      <Anchoring />
      <PublicGoods />
      <CosmicCouncil />
      <Verifiability />
      <LandingFAQ />
      <LandingFooter />
    </main>
  );
}

import { setRequestLocale } from 'next-intl/server';

import { getLandingContent } from '@/content/landing';

import { AllocationTracks } from '@/components/landing-v2/AllocationTracks';
import { Anchoring } from '@/components/landing-v2/Anchoring';
import { CosmicCouncil } from '@/components/landing-v2/CosmicCouncil';
import { Hero } from '@/components/landing-v2/Hero';
import { LandingFAQ } from '@/components/landing-v2/LandingFAQ';
import { PublicGoods } from '@/components/landing-v2/PublicGoods';
import { TheArt } from '@/components/landing-v2/TheArt';
import { TheCycle } from '@/components/landing-v2/TheCycle';
import { Verifiability } from '@/components/landing-v2/Verifiability';
import styles from '@/components/landing-v2/Landing.module.css';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * The landing home. The shared landing header and footer (landing-shell)
 * sit outside this <main>, so both are top-level banner and contentinfo
 * landmarks and the skip link lands on the hero.
 */
export default async function LandingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getLandingContent(locale);

  return (
    <main id="main" tabIndex={-1} className={`relative ${styles.page}`}>
      <Hero hero={content.hero} />
      <TheCycle cycle={content.cycle} />
      <TheArt art={content.art} />
      <AllocationTracks tracks={content.tracks} />
      <Anchoring anchoring={content.anchoring} />
      <PublicGoods publicGoods={content.publicGoods} />
      <CosmicCouncil council={content.council} />
      <Verifiability verifiability={content.verifiability} />
      <LandingFAQ faq={content.faq} />
      <p className={styles.disclaimer}>{content.hero.biologyDisclaimer}</p>
    </main>
  );
}

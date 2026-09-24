import { setRequestLocale } from 'next-intl/server';

import { getLandingContent } from '@/content/landing';

import { AllocationTracks } from '@/components/landing-v2/AllocationTracks';
import { Anchoring } from '@/components/landing-v2/Anchoring';
import { ClosingBand } from '@/components/landing-v2/ClosingBand';
import { CosmicCouncil } from '@/components/landing-v2/CosmicCouncil';
import { Hero } from '@/components/landing-v2/Hero';
import { LandingFAQ } from '@/components/landing-v2/LandingFAQ';
import { PublicGoods } from '@/components/landing-v2/PublicGoods';
import { LandingPair } from '@/components/landing-v2/SectionHeading';
import { TheArt } from '@/components/landing-v2/TheArt';
import { TheCycle } from '@/components/landing-v2/TheCycle';
import { Verifiability } from '@/components/landing-v2/Verifiability';
import styles from '@/components/landing-v2/Landing.module.css';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * The landing home. The story shows the art before the mechanics: the hero
 * and its clock, The Art, how a cycle works, where the reserve goes, Public
 * Goods, Anchoring, the Council beside Verifiability, the FAQ, and a closing
 * band back into the app. The shared landing header and footer (landing
 * shell) sit outside this <main>, so both are top-level landmarks and the
 * skip link lands on the hero.
 */
export default async function LandingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getLandingContent(locale);
  const unavailableLabel = content.hero.art.formingLabel;

  return (
    <main id="main" tabIndex={-1} className={styles.page}>
      <Hero hero={content.hero} />
      <TheArt art={content.art} unavailableLabel={unavailableLabel} />
      <TheCycle cycle={content.cycle} />
      <AllocationTracks tracks={content.tracks} />
      <PublicGoods publicGoods={content.publicGoods} />
      <Anchoring
        anchoring={content.anchoring}
        showcase={content.art.showcase}
        unavailableLabel={unavailableLabel}
      />
      <LandingPair>
        <CosmicCouncil council={content.council} />
        <Verifiability verifiability={content.verifiability} />
      </LandingPair>
      <LandingFAQ faq={content.faq} />
      <ClosingBand
        closing={content.closing}
        showcase={content.art.showcase}
        unavailableLabel={unavailableLabel}
      />
    </main>
  );
}

import type { HowItWorksContent } from '@/content/how-it-works';

import { Link } from '@/i18n/navigation';
import { AccentTitle } from '@/components/layout/AccentTitle';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';

/**
 * The How it works header: the reading PageHeader (the Help hub), the H1 from
 * one accented string per locale, the lede and the two entry CTAs.
 */
export function HeroSection({ hero }: { hero: HowItWorksContent['hero'] }) {
  return (
    <PageHeader
      variant="reading"
      section="learn"
      sectionHub
      titleId="hero-heading"
      title={<AccentTitle text={hero.heading} />}
      subtitle={hero.paragraph}
    >
      <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center">
        <Button asChild size="lg">
          <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
        </Button>
      </div>
    </PageHeader>
  );
}

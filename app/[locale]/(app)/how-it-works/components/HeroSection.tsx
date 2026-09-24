import { ArrowRight } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { buttonVariants } from '@/components/ui/button';

/**
 * The How it works header: the reading PageHeader (the Help hub), a plain
 * H1, the lede, and two ways in: make a gesture, or watch the live cycle.
 */
export function HeroSection({ hero }: { hero: HowItWorksContent['hero'] }) {
  return (
    <PageHeader
      variant="reading"
      section="learn"
      sectionHub
      titleId="hero-heading"
      title={hero.heading}
      subtitle={hero.paragraph}
    >
      <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center">
        <Link
          href={hero.primaryCta.href}
          className={buttonVariants({ variant: 'commit', size: 'lg' })}
        >
          {hero.primaryCta.label}
        </Link>
        <Link
          href={hero.secondaryCta.href}
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          {hero.secondaryCta.label}
          <ArrowRight aria-hidden />
        </Link>
      </div>
    </PageHeader>
  );
}

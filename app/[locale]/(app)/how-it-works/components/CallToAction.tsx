import { ArrowRight } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { Link } from '@/i18n/navigation';
import { SiteLink } from '@/components/layout/SiteLink';
import { buttonVariants } from '@/components/ui/button';

/**
 * The page's one closing section: make the first gesture, or read the FAQ;
 * the community channels sit beneath as quiet links that open a new tab.
 */
export function CallToAction({
  callToAction,
}: {
  callToAction: HowItWorksContent['callToAction'];
}) {
  return (
    <section aria-labelledby="cta-heading" className="border-t border-rule pt-10">
      <div className="max-w-[var(--measure-lede)]">
        <h2 id="cta-heading" className="type-section text-foreground">
          {callToAction.heading}
        </h2>
        <p className="mt-3 type-body-md text-muted-foreground">{callToAction.body}</p>
      </div>
      <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Link
          href={callToAction.primaryCta.href}
          className={buttonVariants({ variant: 'commit', size: 'lg' })}
        >
          {callToAction.primaryCta.label}
          <ArrowRight aria-hidden />
        </Link>
        <Link
          href={callToAction.faqCta.href}
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          {callToAction.faqCta.label}
          <ArrowRight aria-hidden />
        </Link>
      </div>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 type-body-sm text-muted-foreground">
        {[callToAction.discordCta, callToAction.twitterCta].map((cta) => (
          <li key={cta.href}>
            <SiteLink
              href={cta.href}
              kind="external"
              className="link-quiet inline-flex min-h-11 items-center gap-1.5 hover:text-foreground"
            >
              {cta.label}
            </SiteLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

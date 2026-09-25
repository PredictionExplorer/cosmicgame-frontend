import { ArrowRight } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { Link } from '@/i18n/navigation';
import { SectionHeader } from '@/components/ui/section-header';
import { Steps } from '@/components/ui/steps';

/**
 * Getting started: three steps as a vertical stepper (a numbered node on a
 * rail beside each short checklist), with the section's header and the way
 * to get ETH on Arbitrum in the left column from `lg`. Every instruction is
 * in the open; nothing hides behind the step titles.
 */
export function StepByStep({ stepByStep }: { stepByStep: HowItWorksContent['stepByStep'] }) {
  return (
    <section
      aria-labelledby="steps-heading"
      className="lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12"
    >
      <SectionHeader
        headingId="steps-heading"
        title={stepByStep.heading}
        description={stepByStep.subhead}
        className="lg:col-span-4"
      />
      <Steps
        layout="timeline"
        className="lg:col-span-8 lg:row-span-2 lg:pt-1"
        stepLabel={(n) => stepByStep.stepLabel.replace('{n}', String(n))}
        items={stepByStep.steps.map((step) => ({
          id: step.title,
          title: step.title,
          body: (
            <ul className="flex max-w-[var(--measure-lede)] flex-col gap-2.5">
              {step.highlights.map((highlight) => (
                <li key={highlight} className="flex items-baseline gap-2.5">
                  <span
                    aria-hidden
                    className="size-1 shrink-0 translate-y-[-0.2em] rounded-pill bg-subtle"
                  />
                  <span className="min-w-0">{highlight}</span>
                </li>
              ))}
            </ul>
          ),
        }))}
      />
      <p
        data-testid="funding-help"
        className="mt-8 border-t border-rule pt-4 type-body-sm text-muted-foreground lg:col-span-4 lg:row-start-2 lg:mt-0 lg:self-start"
      >
        {stepByStep.funding.text}{' '}
        <Link
          href={stepByStep.funding.link.href}
          className="link inline-flex min-h-6 items-center gap-1.5 whitespace-nowrap"
        >
          {stepByStep.funding.link.label}
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </p>
    </section>
  );
}

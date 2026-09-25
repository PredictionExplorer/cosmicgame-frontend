import { ArrowRight } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { Link } from '@/i18n/navigation';
import { SectionHeader } from '@/components/ui/section-header';

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
      <ol className="lg:col-span-8 lg:row-span-2 lg:pt-1">
        {stepByStep.steps.map((step, index) => (
          <li
            key={step.title}
            className="group/step relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-5 pb-10 last:pb-0"
          >
            {/* The rail joining this step's node to the next one. */}
            <span
              aria-hidden
              className="absolute bottom-0 left-4 top-10 w-px -translate-x-1/2 bg-rule group-last/step:hidden"
            />
            {/* The stage diagram's numeral, one size up for the rail it sits on. */}
            <span
              aria-hidden
              className="flex size-8 items-center justify-center rounded-pill border border-rule bg-surface-raised type-caption font-medium tabular-nums text-foreground"
            >
              {index + 1}
            </span>
            <div className="min-w-0 pt-1">
              <p className="sr-only">{stepByStep.stepLabel.replace('{n}', String(index + 1))}</p>
              <h3 className="type-heading-3 text-foreground">{step.title}</h3>
              <ul className="mt-3 flex max-w-[var(--measure-lede)] flex-col gap-2.5">
                {step.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-baseline gap-2.5 type-body-md text-muted-foreground"
                  >
                    <span
                      aria-hidden
                      className="size-1 shrink-0 translate-y-[-0.2em] rounded-pill bg-subtle"
                    />
                    <span className="min-w-0">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
      <p
        data-testid="funding-help"
        className="mt-8 border-t border-rule pt-4 type-body-md text-muted-foreground lg:col-span-4 lg:row-start-2 lg:mt-0 lg:self-start"
      >
        {stepByStep.funding.text}{' '}
        {/* Inline, so a long label (Korean, Ukrainian) wraps with the sentence at 320px
            instead of running past the column; the arrow follows its last word. */}
        <Link href={stepByStep.funding.link.href} className="link">
          {stepByStep.funding.link.label}
          <ArrowRight aria-hidden className="ms-1.5 inline-block size-3.5 align-middle" />
        </Link>
      </p>
    </section>
  );
}

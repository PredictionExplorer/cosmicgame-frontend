import type { HowItWorksContent } from '@/content/how-it-works';

import { ExplainedTerm } from '@/components/ui/explain-popover';
import { SectionHeader } from '@/components/ui/section-header';

/**
 * Getting started: three numbered steps side by side on wide screens, each a
 * short checklist at a reading measure.
 */
export function StepByStep({ stepByStep }: { stepByStep: HowItWorksContent['stepByStep'] }) {
  return (
    <section aria-labelledby="steps-heading">
      <SectionHeader
        headingId="steps-heading"
        title={stepByStep.heading}
        description={stepByStep.subhead}
      />
      <ol className="mt-8 grid gap-x-10 gap-y-10 lg:grid-cols-3">
        {stepByStep.steps.map((step, index) => (
          <li key={step.title} className="border-t border-rule pt-5">
            <p className="type-eyebrow text-subtle">
              {stepByStep.stepLabel.replace('{n}', String(index + 1))}
            </p>
            <h3 className="mt-2 type-heading-3 text-foreground">
              <ExplainedTerm definition={step.tooltip}>{step.title}</ExplainedTerm>
            </h3>
            <ul className="mt-4 flex max-w-[var(--measure-lede)] flex-col gap-2.5">
              {step.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-baseline gap-2.5 type-body-sm text-muted-foreground"
                >
                  <span
                    aria-hidden
                    className="size-1 shrink-0 translate-y-[-0.2em] rounded-pill bg-subtle"
                  />
                  <span className="min-w-0">{highlight}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

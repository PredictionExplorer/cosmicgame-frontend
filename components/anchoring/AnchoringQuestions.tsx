import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/ui/section-header';

const QUESTIONS = [
  'whatIsAnchoring',
  'cosmicSignature',
  'randomWalk',
  'calculation',
  'anchorOnce',
] as const;

interface AnchoringQuestionsProps {
  className?: string;
}

/**
 * The questions a newcomer asks about anchoring, as native disclosures: the
 * answers are in the server HTML, open without JavaScript and keep the
 * browser's own keyboard behaviour. Hairlines between items, no box.
 */
export function AnchoringQuestions({ className }: AnchoringQuestionsProps) {
  const t = useTranslations('anchoring');

  return (
    <section
      aria-labelledby="anchoring-questions-heading"
      className={cn('grid gap-x-12 lg:grid-cols-12', className)}
    >
      <SectionHeader
        className="lg:col-span-4"
        headingId="anchoring-questions-heading"
        title={t('questions.title')}
        description={t('questions.description')}
      />
      <div className="divide-y divide-rule-faint border-y border-rule-faint lg:col-span-8">
        {QUESTIONS.map((id) => (
          <details key={id} className="group">
            <summary
              className={cn(
                'flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3',
                'type-body-md font-medium text-foreground transition-colors hover:text-primary',
                '[&::-webkit-details-marker]:hidden',
              )}
            >
              {t(`questions.items.${id}.question`)}
              <ChevronDown
                aria-hidden
                className="size-4 shrink-0 text-subtle transition-transform duration-[var(--duration-fast)] group-open:rotate-180"
              />
            </summary>
            <p className="pb-5 pe-8 type-body-sm leading-relaxed text-muted-foreground">
              {t(`questions.items.${id}.answer`)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

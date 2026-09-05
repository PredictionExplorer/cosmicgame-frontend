import { useId } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

const STEPS = ['enter', 'extend', 'finalize'] as const;

export interface ParticipationGuideProps {
  className?: string;
}

export function ParticipationGuide({ className }: ParticipationGuideProps) {
  const t = useTranslations('home.orientation');
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn('min-w-0 px-5 py-5 sm:px-7 sm:py-6', className)}
    >
      <h2 id={headingId} className="mb-4 text-sm font-semibold text-foreground">
        {t('title')}
      </h2>
      <ol role="list" className="grid gap-5 md:grid-cols-3 md:gap-7">
        {STEPS.map((step, index) => (
          <li key={step} className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs font-medium tabular-nums text-muted-foreground"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-medium leading-6 text-foreground">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(`steps.${step}.body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

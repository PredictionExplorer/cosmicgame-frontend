import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Atom,
  ChevronDown,
  ChevronRight,
  Fingerprint,
  Hash,
  Image as ImageIcon,
  Palette,
  type LucideIcon,
} from 'lucide-react';

import { SiteLink } from '@/components/layout/SiteLink';
import { SectionHeader } from '@/components/ui/section-header';

/** The render pipeline's steps, in order; copy lives in `code.pipeline.steps.<id>`. */
export const RENDER_PIPELINE_STEPS = [
  { id: 'seed', icon: Fingerprint },
  { id: 'stream', icon: Hash },
  { id: 'simulation', icon: Atom },
  { id: 'renderer', icon: Palette },
  { id: 'image', icon: ImageIcon },
] as const satisfies ReadonlyArray<{ id: string; icon: LucideIcon }>;

/**
 * How the viewer's program turns a seed into an image, as a chain: five
 * numbered nodes joined by a hairline, left to right from `lg` and top to
 * bottom below it, with no boxes around the steps. The last step leads to
 * the gallery, where the images are.
 */
export function RenderPipeline() {
  const t = useTranslations('code');
  const last = RENDER_PIPELINE_STEPS.length - 1;

  return (
    <section aria-labelledby="render-pipeline-heading">
      <SectionHeader
        headingId="render-pipeline-heading"
        title={t('pipeline.heading')}
        description={t('pipeline.description')}
      />
      <ol className="grid lg:grid-cols-5 lg:gap-x-8">
        {RENDER_PIPELINE_STEPS.map(({ id, icon: Icon }, index) => (
          <li
            key={id}
            data-step={id}
            className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 pb-8 last:pb-0 lg:block lg:pb-0"
          >
            {index < last ? (
              // The chain: down the node column on phones, across to the next node from lg.
              <span
                aria-hidden
                className="absolute start-5 top-12 bottom-2 w-px bg-rule lg:start-14 lg:end-[-1.5rem] lg:top-5 lg:bottom-auto lg:h-px lg:w-auto"
              >
                <ChevronDown className="absolute -bottom-1.5 -start-1.5 size-3 text-subtle lg:hidden" />
                <ChevronRight className="absolute -end-1 -top-1.5 hidden size-3 text-subtle lg:block" />
              </span>
            ) : null}
            <span
              aria-hidden
              className="relative flex size-10 items-center justify-center rounded-control border border-rule bg-surface text-secondary"
            >
              <Icon className="size-[1.125rem]" />
            </span>
            <div className="min-w-0 pt-0.5 lg:mt-5 lg:pt-0">
              <p aria-hidden className="type-mono text-subtle">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-1 type-title text-foreground">{t(`pipeline.steps.${id}.label`)}</h3>
              <p className="mt-1.5 type-body-sm text-muted-foreground">
                {t(`pipeline.steps.${id}.description`)}
              </p>
              {index === last ? (
                <p className="mt-3 type-body-sm">
                  <SiteLink href="/gallery" kind="internal" className="link">
                    {t('pipeline.galleryLink')}
                    <ArrowRight aria-hidden className="ms-1 inline size-3.5 align-[-0.125em]" />
                  </SiteLink>
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

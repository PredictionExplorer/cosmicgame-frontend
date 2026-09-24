import { useTranslations } from 'next-intl';
import {
  ArrowDown,
  ArrowRight,
  Atom,
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
 * How the viewer's program turns a seed into an image, as a chain of five
 * steps: a row joined by arrows from `lg`, a column joined by downward
 * arrows below it. The last step leads to the gallery, where the images are.
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
      <ol className="grid gap-8 lg:grid-cols-5 lg:gap-7">
        {RENDER_PIPELINE_STEPS.map(({ id, icon: Icon }, index) => (
          <li key={id} data-step={id} className="relative flex">
            <div className="flex w-full flex-col rounded-surface border border-rule bg-surface p-4">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-control border border-rule-faint bg-surface-sunken text-secondary"
                >
                  <Icon className="size-4" />
                </span>
                <span aria-hidden className="type-mono text-subtle">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-3 type-label text-foreground">{t(`pipeline.steps.${id}.label`)}</h3>
              <p className="mt-1.5 type-body-sm text-muted-foreground">
                {t(`pipeline.steps.${id}.description`)}
              </p>
              {index === last ? (
                <p className="mt-auto pt-3">
                  <SiteLink
                    href="/gallery"
                    kind="internal"
                    className="link inline-flex min-h-6 items-center gap-1 type-body-sm"
                  >
                    {t('pipeline.galleryLink')}
                    <ArrowRight aria-hidden className="size-3.5" />
                  </SiteLink>
                </p>
              ) : null}
            </div>
            {index < last ? (
              <span
                aria-hidden
                className="absolute start-1/2 top-full flex h-8 -translate-x-1/2 items-center text-subtle rtl:translate-x-1/2 lg:start-full lg:top-1/2 lg:h-auto lg:w-7 lg:-translate-y-1/2 lg:translate-x-0 lg:justify-center rtl:lg:translate-x-0"
              >
                <ArrowDown className="size-4 lg:hidden" />
                <ArrowRight className="hidden size-4 lg:block rtl:-scale-x-100" />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

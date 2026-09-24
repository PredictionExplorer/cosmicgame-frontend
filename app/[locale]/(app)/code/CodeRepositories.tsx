import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';

import { CODE_REPOSITORIES } from '@/content/code/structure';

import { SiteLink } from '@/components/layout/SiteLink';
import { SectionHeader } from '@/components/ui/section-header';

/** The four project repositories, a crawlable index rendered on the server. */
export function CodeRepositories() {
  const t = useTranslations('code');
  return (
    <section id="repositories" aria-labelledby="repositories-heading">
      <SectionHeader headingId="repositories-heading" title={t('repositories.heading')} />
      <ul className="grid gap-4 md:grid-cols-2">
        {CODE_REPOSITORIES.map(({ id, name, href }) => (
          <li
            key={id}
            data-repository={id}
            className="min-w-0 rounded-surface border border-rule bg-surface p-5"
          >
            <h3 className="type-title">
              <SiteLink
                href={href}
                kind="external"
                externalIcon={false}
                className="link inline-flex min-h-6 items-start gap-1.5"
              >
                {t(`repositories.items.${id}.title`)}
                <ArrowUpRight aria-hidden className="mt-0.5 size-4 shrink-0" />
              </SiteLink>
            </h3>
            <p className="mt-1 type-hash text-subtle">{name}</p>
            <p className="mt-3 type-body-sm text-muted-foreground">
              {t(`repositories.items.${id}.description`)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

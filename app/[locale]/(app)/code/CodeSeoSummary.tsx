import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';

import { CODE_REPOSITORIES } from '@/content/code/structure';

import { PageHeader } from '@/components/layout/PageHeader';

/**
 * The /code page header plus its crawlable repository index, rendered on the
 * server: the header (H1, lede, related sources), then the four repositories
 * and the render pipeline as the first body section. The interactive code
 * viewer follows on the client.
 */
export async function CodeSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'code' });
  return (
    <>
      <PageHeader
        section="trust"
        title={t('seo.heading')}
        titleId="code-heading"
        subtitle={t('seo.description')}
        related={[
          {
            href: 'https://ipfs.io/ipfs/QmWEao2HjCvyHJSbYnWLyZj8HfFardxzuNh7AUk1jgyXTm',
            label: t('seo.links.ipfs'),
          },
          { href: 'https://github.com/PredictionExplorer', label: t('seo.links.github') },
          { href: '/contracts', label: t('seo.links.contracts') },
          { href: '/security', label: t('seo.links.security') },
          { href: '/gallery', label: t('seo.links.gallery') },
        ]}
        relatedLabel={t('seo.relatedAria')}
      />
      <section id="repositories" aria-labelledby="repositories-heading" className="mb-12">
        <h2 id="repositories-heading" className="type-section text-foreground">
          {t('repositories.heading')}
        </h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {CODE_REPOSITORIES.map(({ id, name, href }) => (
            <li key={id} className="min-w-0 rounded-surface border border-rule p-5">
              <h3 className="type-title">
                <a
                  href={href}
                  className="inline-flex items-start gap-1.5 text-primary underline-offset-4 hover:underline"
                >
                  {t(`repositories.items.${id}.title`)}
                  <ArrowUpRight aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                </a>
              </h3>
              <p className="mt-2 type-hash text-muted-foreground">{name}</p>
              <p className="mt-3 type-body-sm text-muted-foreground">
                {t(`repositories.items.${id}.description`)}
              </p>
            </li>
          ))}
        </ul>
        <pre className="mt-5 overflow-x-auto rounded-surface bg-surface-sunken p-4 type-hash text-muted-foreground">
          <code>{t('seo.excerpt')}</code>
        </pre>
      </section>
    </>
  );
}

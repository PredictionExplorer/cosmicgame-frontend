import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';

import { CODE_REPOSITORIES } from '@/content/code/structure';

import { Link } from '@/i18n/navigation';

export async function CodeSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'code' });
  return (
    <section aria-labelledby="code-seo-heading" className="mb-12 border-b border-border pb-10">
      <p className="type-eyebrow text-primary/80">{t('seo.eyebrow')}</p>
      <h1 id="code-seo-heading" className="mt-4 type-display-lg text-foreground">
        {t('seo.heading')}
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">{t('seo.description')}</p>
      <section id="repositories" aria-labelledby="repositories-heading" className="mt-8">
        <h2 id="repositories-heading" className="type-display-sm text-foreground">
          {t('repositories.heading')}
        </h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {CODE_REPOSITORIES.map(({ id, name, href }) => (
            <li key={id} className="min-w-0 rounded-xl border border-border bg-card/50 p-5">
              <h3 className="text-lg font-semibold">
                <a
                  href={href}
                  className="inline-flex items-start gap-2 rounded-sm text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  {t(`repositories.items.${id}.title`)}
                  <ArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0" />
                </a>
              </h3>
              <p className="mt-2 break-all font-mono text-sm text-muted-foreground">{name}</p>
              <p className="mt-3 type-body-sm text-muted-foreground">
                {t(`repositories.items.${id}.description`)}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <pre className="mt-6 overflow-x-auto rounded-xl border border-white/[0.06] bg-black/30 p-4 text-sm text-muted-foreground">
        <code>{t('seo.excerpt')}</code>
      </pre>
      <nav aria-label={t('seo.relatedAria')} className="mt-6">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <a
              href="https://ipfs.io/ipfs/QmWEao2HjCvyHJSbYnWLyZj8HfFardxzuNh7AUk1jgyXTm"
              className="text-primary underline-offset-4 hover:underline"
            >
              {t('seo.links.ipfs')}
            </a>
          </li>
          <li>
            <a
              href="https://github.com/PredictionExplorer"
              className="text-primary underline-offset-4 hover:underline"
            >
              {t('seo.links.github')}
            </a>
          </li>
          <li>
            <Link href="/contracts" className="text-primary underline-offset-4 hover:underline">
              {t('seo.links.contracts')}
            </Link>
          </li>
          <li>
            <Link href="/security" className="text-primary underline-offset-4 hover:underline">
              {t('seo.links.security')}
            </Link>
          </li>
          <li>
            <Link href="/gallery" className="text-primary underline-offset-4 hover:underline">
              {t('seo.links.gallery')}
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}

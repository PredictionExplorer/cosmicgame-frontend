import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

export async function CodeSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'code' });
  return (
    <section
      aria-labelledby="code-seo-heading"
      className="mb-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8"
    >
      <p className="type-eyebrow text-muted-foreground">{t('seo.eyebrow')}</p>
      <h1 id="code-seo-heading" className="mt-4 type-display-md text-foreground">
        {t('seo.heading')}
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">{t('seo.description')}</p>
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

import { getLocale } from 'next-intl/server';

import { getLandingContent } from '@/content/landing';

import { Link } from '@/i18n/navigation';

export default async function LandingNotFound() {
  const locale = await getLocale();
  const { notFound } = getLandingContent(locale);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative flex items-center justify-center px-4 py-12 sm:px-6 lg:py-16"
    >
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/60">
          {notFound.code}
        </p>
        <h1 className="mt-4 type-display-md text-foreground">{notFound.heading}</h1>
        <p className="mt-4 text-white/70">{notFound.description}</p>
        <Link
          href={notFound.cta.href}
          className="mt-8 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          {notFound.cta.label}
        </Link>
      </div>
    </main>
  );
}

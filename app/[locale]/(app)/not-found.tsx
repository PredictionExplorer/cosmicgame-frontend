// Server component on purpose: the 404 page must arrive as crawler-visible
// HTML (branded copy + recovery links), not hydrate client-side.
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/ui/page-shell';

export default async function NotFound() {
  const t = await getTranslations('errors');
  const suggestedLinks = [
    { href: '/', label: t('notFound.links.home') },
    { href: '/gallery', label: t('notFound.links.gallery') },
    { href: '/how-it-works', label: t('notFound.links.howItWorks') },
    { href: '/faq', label: t('notFound.links.faq') },
    { href: '/statistics', label: t('notFound.links.statistics') },
    { href: '/anchoring', label: t('notFound.links.anchoring') },
  ];

  return (
    <PageShell variant="form" backdrop="signature">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <h1 className="text-2xl font-bold text-primary text-center">{t('notFound.title')}</h1>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {t('notFound.description')}
        </p>
        <Button variant="outline" asChild>
          <Link href="/">{t('notFound.returnHome')}</Link>
        </Button>

        <nav aria-label={t('notFound.suggestedPages')} className="mt-6 w-full max-w-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-3 text-center">
            {t('notFound.popularPages')}
          </p>
          <ul className="space-y-2">
            {suggestedLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-foreground hover:bg-white/[0.06] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </PageShell>
  );
}

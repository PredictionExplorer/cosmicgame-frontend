import { useLocale, useTranslations } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { Link } from '@/i18n/navigation';
import { LanguageDirectory } from '@/components/layout/LanguageDirectory';
import { BrandMark } from '@/components/layout/BrandMark';
import { localizeCrossHostHref } from '@/lib/hostRouting';

export function LandingFooter({ footer }: { footer: LandingContent['footer'] }) {
  const locale = useLocale();
  const t = useTranslations('common');

  return (
    <footer
      role="contentinfo"
      className="relative overflow-hidden border-t border-white/10 bg-background pt-12 pb-8 sm:pt-14 sm:pb-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/[0.04] via-transparent to-transparent"
      />
      <div className="site-container relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] lg:gap-16">
          <div className="min-w-0">
            <Link href="/" className="inline-flex min-h-11 max-w-full items-center gap-3">
              <BrandMark className="h-9 w-9 shrink-0 text-primary" />
              <span
                className="text-xl font-semibold text-white [overflow-wrap:anywhere]"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {footer.brandName}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{footer.tagline}</p>
          </div>

          <nav
            aria-label={t('accessibility.footer')}
            className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 sm:gap-x-6"
          >
            {footer.columns.map((col) => (
              <div key={col.heading} className="min-w-0">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/65 [overflow-wrap:anywhere]">
                  {col.heading}
                </h2>
                <ul className="mt-3 space-y-0.5">
                  {col.links.map((link) => {
                    const href = localizeCrossHostHref(link.href, locale);
                    return (
                      <li key={link.label}>
                        <Link
                          href={href}
                          className="inline-flex min-h-11 max-w-full items-center py-1.5 text-sm leading-relaxed text-white/70 transition hover:text-white [overflow-wrap:anywhere]"
                          rel={link.href.startsWith('http') ? 'noopener' : undefined}
                          target={link.href.startsWith('http') ? '_blank' : undefined}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t sm:mt-10 border-white/10 pt-6">
          <LanguageDirectory />
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>{footer.copyright.replace('{year}', String(new Date().getFullYear()))}</p>
          <p className="font-mono uppercase tracking-[0.2em] [overflow-wrap:anywhere]">
            {footer.colophon}
          </p>
        </div>
      </div>
    </footer>
  );
}

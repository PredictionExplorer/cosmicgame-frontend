import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { Link } from '@/i18n/navigation';
import { LanguageDirectory } from '@/components/layout/LanguageDirectory';
import { localizeCrossHostHref } from '@/lib/hostRouting';

export function LandingFooter({ footer }: { footer: LandingContent['footer'] }) {
  const locale = useLocale();
  const t = useTranslations('common');

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0A0418] pt-14 pb-8 sm:pt-20 sm:pb-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-deep-space opacity-70" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] lg:gap-16">
          <div className="min-w-0">
            <Link href="/" className="inline-flex min-h-11 max-w-full items-center gap-3">
              <Image
                src="/images/logo.svg"
                alt={footer.logoAlt}
                width={36}
                height={36}
                className="shrink-0"
              />
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
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/65 [overflow-wrap:anywhere]">
                  {col.heading}
                </h3>
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

        <div className="mt-12 border-t sm:mt-16 border-white/10 pt-6">
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

import Image from 'next/image';
import Link from 'next/link';

import { landingContent } from '@/content/landing';

const { footer } = landingContent;

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0A0418] pt-20 pb-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-deep-space opacity-70" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/images/logo.svg" alt="Cosmic Signature" width={36} height={36} />
              <span
                className="text-xl font-semibold text-white"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                Cosmic Signature
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{footer.tagline}</p>
          </div>

          <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-3">
            {footer.columns.map((col) => (
              <div key={col.heading}>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                  {col.heading}
                </h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 transition hover:text-white"
                        rel={link.href.startsWith('http') ? 'noopener' : undefined}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Cosmic Signature. Public domain.</p>
          <p className="font-mono uppercase tracking-[0.24em]">{footer.colophon}</p>
        </div>
      </div>
    </footer>
  );
}

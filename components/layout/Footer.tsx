'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';

import { FooterWrapper } from '@/components/styled';

const footerLinks: Record<string, { label: string; href: string; external?: boolean }[]> = {
  Protocol: [
    { label: 'Gallery', href: '/gallery' },
    { label: 'Statistics', href: '/statistics' },
    { label: 'Contracts', href: '/contracts' },
    { label: 'Source Code', href: '/code' },
  ],
  Resources: [
    { label: 'How to Play', href: '/how-to-play' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Site Map', href: '/site-map' },
    {
      label: 'Protocol Guild',
      href: 'https://protocol-guild.readthedocs.io',
      external: true,
    },
  ],
  Community: [
    { label: 'Twitter / X', href: 'https://x.com/CosmicSignature', external: true },
    { label: 'Discord', href: 'https://discord.gg/bGnPn96Qwt', external: true },
    { label: 'Landing Site', href: 'https://cosmicsignature.com', external: true },
  ],
};

const Footer = () => (
  <FooterWrapper>
    <div className="relative overflow-hidden border-t border-white/10">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-deep-space opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(84.7%_0.149_213)]/40 to-transparent"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/images/logo2.svg"
              width={180}
              height={36}
              alt="Cosmic Signature"
              loading="eager"
              className="h-8 w-auto max-w-[140px] object-contain"
            />
            <p
              className="mt-4 max-w-[260px] text-sm leading-relaxed text-white/60"
              style={{ fontFamily: 'var(--font-inter, inherit)' }}
            >
              A procedural on-chain art protocol on Arbitrum. Every gesture shapes the cycle&apos;s
              final Signature.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://x.com/CosmicSignature"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                <FontAwesomeIcon icon={faTwitter} width={16} height={16} />
              </a>
              <a
                href="https://discord.gg/bGnPn96Qwt"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                <FontAwesomeIcon icon={faDiscord} width={16} height={16} />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/70 no-underline transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 no-underline transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs sm:flex-row">
          <p className="text-white/50">
            &copy; {new Date().getFullYear()} Cosmic Signature. CC0 1.0 · Public domain.
          </p>
          <div className="flex items-center gap-6">
            <span className="font-mono uppercase tracking-[0.24em] text-white/40">
              CC0 · Verified · Reproducible
            </span>
            <Link href="/terms" className="text-white/60 no-underline transition hover:text-white">
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-white/60 no-underline transition hover:text-white"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  </FooterWrapper>
);

export default Footer;

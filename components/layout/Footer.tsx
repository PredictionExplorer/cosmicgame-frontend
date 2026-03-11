'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';

import { FooterWrapper } from '@/components/styled';

const footerLinks: Record<string, { label: string; href: string; external?: boolean }[]> = {
  Product: [
    { label: 'Gallery', href: '/gallery' },
    { label: 'Statistics', href: '/statistics' },
    { label: 'Contracts', href: '/contracts' },
    { label: 'Mint', href: '/mint' },
  ],
  Resources: [
    { label: 'How to Play', href: '/how-to-play' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Site Map', href: '/site-map' },
  ],
  Community: [
    { label: 'Twitter / X', href: 'https://x.com/CosmicSignatureNFT', external: true },
    { label: 'Discord', href: 'https://discord.gg/bGnPn96Qwt', external: true },
  ],
};

const Footer = () => (
  <FooterWrapper>
    <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    <div className="mx-auto w-full max-w-7xl px-4">
      <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Image src="/images/logo2.svg" width={180} height={36} alt="Cosmic Signature" />
          <p className="mt-4 text-sm text-muted-foreground max-w-[240px]">
            A strategy bidding game where players compete for ETH prizes and unique NFTs.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <a
              href="https://x.com/CosmicSignatureNFT"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <FontAwesomeIcon icon={faTwitter} width={16} height={16} />
            </a>
            <a
              href="https://discord.gg/bGnPn96Qwt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <FontAwesomeIcon icon={faDiscord} width={16} height={16} />
            </a>
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
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
                      className="text-sm text-muted-foreground no-underline hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground no-underline hover:text-white transition-colors"
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

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06] py-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Cosmic Signature. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-xs text-muted-foreground no-underline hover:text-white transition-colors"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-xs text-muted-foreground no-underline hover:text-white transition-colors"
          >
            Privacy
          </a>
        </div>
      </div>
    </div>
  </FooterWrapper>
);

export default Footer;

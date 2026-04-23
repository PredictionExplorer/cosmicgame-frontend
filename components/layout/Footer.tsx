'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';

import { FooterWrapper } from '@/components/styled';
import { getClientBuildInfo, isVercelProductionDeploy } from '@/lib/buildInfo';

const footerLinks: Record<string, { label: string; href: string; external?: boolean }[]> = {
  Product: [
    { label: 'Gallery', href: '/gallery' },
    { label: 'Statistics', href: '/statistics' },
    { label: 'Contracts', href: '/contracts' },
    { label: 'Mint', href: '/mint' },
  ],
  Resources: [
    { label: 'How to Participate', href: '/how-to-play' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Site Map', href: '/site-map' },
  ],
  Community: [
    { label: 'Twitter / X', href: 'https://x.com/CosmicSignature', external: true },
    { label: 'Discord', href: 'https://discord.gg/bGnPn96Qwt', external: true },
  ],
};

const Footer = () => {
  const build = getClientBuildInfo();
  const showBuild =
    build && (!isVercelProductionDeploy() || process.env.NEXT_PUBLIC_SHOW_BUILD_COMMIT === '1');

  return (
  <FooterWrapper>
    <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    <div className="mx-auto w-full max-w-7xl px-4">
      <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Image
            src="/images/logo2.svg"
            width={180}
            height={36}
            alt="Cosmic Signature"
            loading="eager"
            className="h-8 w-auto max-w-[140px] object-contain"
          />
          <p className="mt-4 text-sm text-muted-foreground max-w-[240px]">
            A procedural on-chain art protocol on Arbitrum where participants make gestures and the
            protocol distributes ETH across allocation tracks.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <a
              href="https://x.com/CosmicSignature"
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
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Cosmic Signature. All rights reserved.
          </p>
          {showBuild ? (
            <p
              data-testid="build-commit"
              className="font-mono text-[10px] text-muted-foreground/60"
              title={`${build.fullSha}${build.ref ? ` (${build.ref})` : ''}`}
            >
              {build.shortSha}
              {build.ref ? ` · ${build.ref}` : ''}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/terms"
            className="text-xs text-muted-foreground no-underline hover:text-white transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground no-underline hover:text-white transition-colors"
          >
            Privacy
          </Link>
        </div>
      </div>
    </div>
  </FooterWrapper>
  );
};

export default Footer;

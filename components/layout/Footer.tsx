'use client';

import Image from 'next/image';
import Link from 'next/link';

import { FooterWrapper } from '@/components/styled';
import { getClientBuildInfo, isVercelProductionDeploy } from '@/lib/buildInfo';

const XIcon = (props: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
    style={{ width: 16, height: 16 }}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const DiscordIcon = (props: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
    style={{ width: 16, height: 16 }}
  >
    <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3.2a.074.074 0 0 0-.079.037c-.34.6-.716 1.38-.979 1.994a18.27 18.27 0 0 0-5 0 12.64 12.64 0 0 0-.987-1.994.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-3.76 1.17.07.07 0 0 0-.032.027C2.533 8.045 1.862 11.607 2.202 15.125a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.2 14.2 0 0 0 1.226-1.994.076.076 0 0 0-.041-.105 13.104 13.104 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .079.009c.12.099.245.198.372.292a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.04.106c.36.698.773 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-4.108-.838-7.638-3.548-10.79a.061.061 0 0 0-.031-.028ZM8.02 13.041c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.42 2.157-2.42 1.21 0 2.175 1.096 2.156 2.42 0 1.333-.946 2.419-2.156 2.419Z" />
  </svg>
);

const footerLinks: Record<string, { label: string; href: string; external?: boolean }[]> = {
  Protocol: [
    { label: 'Gallery', href: '/gallery' },
    { label: 'Statistics', href: '/statistics' },
    { label: 'Contracts', href: '/contracts' },
    { label: 'Source Code', href: '/code' },
  ],
  Resources: [
    { label: 'How It Works', href: '/how-it-works' },
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
    { label: 'Discover', href: 'https://cosmicsignature.com', external: true },
  ],
};

const Footer = () => {
  const build = getClientBuildInfo();
  const showBuild =
    build && (!isVercelProductionDeploy() || process.env.NEXT_PUBLIC_SHOW_BUILD_COMMIT === '1');

  return (
    <FooterWrapper>
      <div className="relative overflow-hidden border-t border-white/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-deep-space opacity-70"
        />
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
                A procedural on-chain art protocol on Arbitrum. Every gesture shapes the
                cycle&apos;s final Signature.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <a
                  href="https://x.com/CosmicSignature"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  <XIcon />
                </a>
                <a
                  href="https://discord.gg/bGnPn96Qwt"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  <DiscordIcon />
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
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <p className="text-white/50">
                &copy; {new Date().getFullYear()} Cosmic Signature. CC0 1.0 · Public domain.
              </p>
              {showBuild ? (
                <p
                  data-testid="build-commit"
                  className="font-mono text-[10px] text-white/40"
                  title={`${build.fullSha}${build.ref ? ` (${build.ref})` : ''}`}
                >
                  {build.shortSha}
                  {build.ref ? ` · ${build.ref}` : ''}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-6">
              <span className="font-mono uppercase tracking-[0.24em] text-white/40">
                CC0 · Verified · Reproducible
              </span>
              <Link
                href="/terms"
                className="text-white/60 no-underline transition hover:text-white"
              >
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
};

export default Footer;

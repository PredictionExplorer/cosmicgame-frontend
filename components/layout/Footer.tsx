'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { LanguageDirectory } from '@/components/layout/LanguageDirectory';
import { FooterWrapper } from '@/components/styled';
import { CST_GECKOTERMINAL_POOL_URL } from '@/config/geckoterminal';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import { getClientBuildInfo, isVercelProductionDeploy } from '@/lib/buildInfo';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';

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

/**
 * Footer navigation. Because the header's Explore/Help destinations live in
 * client-only dropdown panels, this footer is the primary server-rendered
 * crawl path for them — every internal route from the header nav must stay
 * reachable here or on /site-map (enforced by app/__tests__/crawl-paths).
 */
type FooterTranslator = (key: string) => string;

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterGroup {
  title: string;
  links: FooterLink[];
}

function getFooterLinks(t: FooterTranslator, locale: AppLocale): FooterGroup[] {
  return [
    {
      title: t('sections.protocol'),
      links: [
        { label: t('links.gallery'), href: '/gallery' },
        { label: t('links.currentCycle'), href: '/current-cycle' },
        { label: t('links.statistics'), href: '/statistics' },
        { label: t('links.contracts'), href: '/contracts' },
        { label: t('links.sourceCode'), href: '/code' },
      ],
    },
    {
      title: t('sections.explore'),
      links: [
        { label: t('links.allocationRecipients'), href: '/allocation' },
        { label: t('links.anchorDistributions'), href: '/anchoring' },
        { label: t('links.outreachReserve'), href: '/marketing' },
        { label: t('links.howItWorks'), href: '/how-it-works' },
        { label: t('links.faq'), href: '/faq' },
      ],
    },
    {
      title: t('sections.ecosystem'),
      links: [
        {
          label: t('links.axiomZero'),
          href: COSMIC_SIGNATURE_MARKETPLACE_URL,
          external: true,
        },
        { label: t('links.chaosZero'), href: CHAOS_ZERO_PREDICTIONS_URL, external: true },
        { label: t('links.uniswap'), href: CST_UNISWAP_SWAP_URL, external: true },
        {
          label: t('links.geckoTerminal'),
          href: CST_GECKOTERMINAL_POOL_URL,
          external: true,
        },
      ],
    },
    {
      title: t('sections.resources'),
      links: [
        {
          label: t('links.about'),
          href: localeHref(LANDING_ORIGIN, '/about', locale),
          external: true,
        },
        {
          label: t('links.learn'),
          href: localeHref(LANDING_ORIGIN, '/learn', locale),
          external: true,
        },
        {
          label: t('links.whitePaper'),
          href: localeHref(LANDING_ORIGIN, '/white-paper', locale),
          external: true,
        },
        { label: t('links.audits'), href: '/audits' },
        { label: t('links.siteMap'), href: '/site-map' },
        {
          label: t('links.protocolGuild'),
          href: 'https://protocol-guild.readthedocs.io',
          external: true,
        },
      ],
    },
    {
      title: t('sections.community'),
      links: [
        { label: t('links.twitter'), href: 'https://x.com/CosmicSignature', external: true },
        { label: t('links.discord'), href: 'https://discord.gg/bGnPn96Qwt', external: true },
        {
          label: t('links.discover'),
          href: localeHref(LANDING_ORIGIN, '/', locale),
          external: true,
        },
      ],
    },
  ];
}

const Footer = () => {
  const t = useTranslations('footer');
  const locale = useLocale() as AppLocale;
  const footerLinks = getFooterLinks(t, locale);
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
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-3 sm:py-14 xl:grid-cols-6">
            <div className="col-span-2 min-w-0 sm:col-span-3 xl:col-span-1">
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
                {t('tagline')}
              </p>
              <div className="mt-5 flex items-center gap-2">
                <a
                  href="https://x.com/CosmicSignature"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('social.twitterLabel')}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  <XIcon />
                </a>
                <a
                  href="https://discord.gg/bGnPn96Qwt"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('social.discordLabel')}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  <DiscordIcon />
                </a>
              </div>
            </div>

            {footerLinks.map(({ title, links }) => (
              <div key={title} className="min-w-0">
                <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/65 [overflow-wrap:anywhere]">
                  {title}
                </h4>
                <ul className="space-y-0.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 max-w-full items-center py-1.5 text-sm leading-relaxed text-white/70 no-underline transition hover:text-white [overflow-wrap:anywhere]"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="inline-flex min-h-11 max-w-full items-center py-1.5 text-sm leading-relaxed text-white/70 no-underline transition hover:text-white [overflow-wrap:anywhere]"
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

          <div className="border-t border-white/10 py-5">
            <LanguageDirectory />
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs lg:flex-row">
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <p className="text-white/50">{t('copyright', { year: new Date().getFullYear() })}</p>
              {showBuild ? (
                <p
                  data-testid="build-commit"
                  className="font-mono text-[10px] text-white/40 [overflow-wrap:anywhere]"
                  title={`${build.fullSha}${build.ref ? ` (${build.ref})` : ''}`}
                >
                  {build.shortSha}
                  {build.ref ? ` · ${build.ref}` : ''}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="font-mono uppercase tracking-[0.24em] text-white/40">
                {t('colophon')}
              </span>
              <Link
                href="/terms"
                className="inline-flex min-h-11 items-center text-white/60 no-underline transition hover:text-white"
              >
                {t('links.terms')}
              </Link>
              <Link
                href="/privacy"
                className="inline-flex min-h-11 items-center text-white/60 no-underline transition hover:text-white"
              >
                {t('links.privacy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </FooterWrapper>
  );
};

export default Footer;

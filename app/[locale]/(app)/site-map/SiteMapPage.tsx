'use client';

import { ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import { cn } from '@/lib/utils';
import { localizeCrossHostHref } from '@/lib/hostRouting';

interface SiteMapLinkDefinition {
  id: string;
  href: string;
}

export const appToolLinks = [
  { id: 'myNfts', href: '/my-tokens' },
  { id: 'myAllocations', href: '/my-allocations' },
  { id: 'myAnchors', href: '/my-anchors' },
] as const satisfies readonly SiteMapLinkDefinition[];

export const systemLinks = [
  { id: 'about', href: 'https://cosmicsignature.com/about' },
  { id: 'learn', href: 'https://cosmicsignature.com/learn' },
  {
    id: 'whatIsCosmicSignature',
    href: 'https://cosmicsignature.com/learn/what-is-cosmic-signature',
  },
  {
    id: 'threeBodyArt',
    href: 'https://cosmicsignature.com/learn/three-body-nft-art',
  },
  { id: 'gallery', href: '/gallery' },
  { id: 'currentCycle', href: '/current-cycle' },
  { id: 'howItWorks', href: '/how-it-works' },
  { id: 'statistics', href: '/statistics' },
  { id: 'contracts', href: '/contracts' },
  { id: 'sourceCode', href: '/code' },
  { id: 'security', href: '/security' },
  { id: 'audits', href: '/audits' },
  { id: 'riskDisclosures', href: '/risk-disclosures' },
  { id: 'faq', href: '/faq' },
  { id: 'terms', href: '/terms' },
  { id: 'privacy', href: '/privacy' },
] as const satisfies readonly SiteMapLinkDefinition[];

/**
 * Public data routes. Together with `systemLinks`, this list keeps the HTML
 * site map in parity with the XML sitemap (`lib/seoRoutes.ts`) — enforced by
 * app/__tests__/crawl-paths.test.tsx.
 */
export const dataLinks = [
  { id: 'allocationRecipients', href: '/allocation' },
  { id: 'anchorDistributions', href: '/anchoring' },
  { id: 'outreachReserve', href: '/marketing' },
  { id: 'imprint', href: '/imprint' },
  { id: 'ethContributions', href: '/eth-contribution' },
  { id: 'attachedNfts', href: '/attached-nfts' },
  { id: 'finalizedAllocations', href: '/allocation-finalized' },
  { id: 'namedNfts', href: '/named-nfts' },
  { id: 'usedRwlkNfts', href: '/used-rwlk-nfts' },
  { id: 'coordinationChanges', href: '/coordination-changes' },
  { id: 'publicGoodsContributions', href: '/public-goods-contributions-cg' },
  { id: 'voluntaryPublicGoods', href: '/public-goods-contributions-voluntary' },
  { id: 'publicGoodsRetrievals', href: '/public-goods-retrievals' },
  { id: 'participationStats', href: '/statistics/participation' },
  { id: 'tokenStats', href: '/statistics/tokens' },
  { id: 'anchoringStats', href: '/statistics/anchoring' },
  { id: 'activityStats', href: '/statistics/activity' },
  { id: 'performanceStats', href: '/statistics/performance' },
] as const satisfies readonly SiteMapLinkDefinition[];

/** External product surfaces that orbit the protocol. */
export const ecosystemLinks = [
  { id: 'axiomZero', href: COSMIC_SIGNATURE_MARKETPLACE_URL },
  { id: 'chaosZero', href: CHAOS_ZERO_PREDICTIONS_URL },
  { id: 'uniswap', href: CST_UNISWAP_SWAP_URL },
] as const satisfies readonly SiteMapLinkDefinition[];

function SitemapLinkList({
  links,
  navLabel,
}: {
  links: readonly SiteMapLinkDefinition[];
  navLabel: string;
}) {
  const t = useTranslations('siteMap');
  const locale = useLocale();
  const rowClassName = cn(
    'group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm',
    'text-foreground/90 transition-colors',
    'hover:bg-white/[0.05] hover:text-primary',
  );

  return (
    <nav aria-label={navLabel} className="mt-5">
      <ul className="flex flex-col gap-0.5">
        {links.map(({ id, href }) => {
          const localizedHref = localizeCrossHostHref(href, locale);
          const label = t(`links.${id}.label`);
          const description = t(`links.${id}.description`);
          const isExternal = /^https?:\/\//.test(href);
          const rowContent = (
            <>
              <span>
                <span className="block">{label}</span>
                {description ? (
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </span>
                ) : null}
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-muted-foreground opacity-40 transition-opacity group-hover:opacity-100 group-hover:text-primary"
                aria-hidden
              />
            </>
          );
          return (
            <li key={id}>
              {isExternal ? (
                <a href={localizedHref} rel="noopener" className={rowClassName}>
                  {rowContent}
                </a>
              ) : (
                <Link href={localizedHref} className={rowClassName}>
                  {rowContent}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const SiteMapPage = () => {
  const t = useTranslations('siteMap');

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        title={t('page.title')}
        subtitle={t('page.subtitle')}
        breadcrumbs={[{ label: t('page.home'), href: '/' }, { label: t('page.title') }]}
        align="left"
        className="mb-10"
      />

      {/* Independent columns keep short link groups from reserving the height
          of a much longer neighboring group. Each group stays intact. */}
      <div className="columns-1 gap-6 md:columns-2">
        <section
          aria-labelledby="sitemap-personal-heading"
          className="mb-6 break-inside-avoid rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2
            id="sitemap-personal-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            {t('sections.personal.title')}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t('sections.personal.description')}
          </p>
          <SitemapLinkList links={appToolLinks} navLabel={t('sections.personal.navLabel')} />
        </section>

        <section
          aria-labelledby="sitemap-system-heading"
          className="mb-6 break-inside-avoid rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2
            id="sitemap-system-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            {t('sections.system.title')}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t('sections.system.description')}
          </p>
          <SitemapLinkList links={systemLinks} navLabel={t('sections.system.navLabel')} />
        </section>

        <section
          aria-labelledby="sitemap-data-heading"
          className="mb-6 break-inside-avoid rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2
            id="sitemap-data-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            {t('sections.data.title')}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t('sections.data.description')}
          </p>
          <SitemapLinkList links={dataLinks} navLabel={t('sections.data.navLabel')} />
        </section>

        <section
          aria-labelledby="sitemap-ecosystem-heading"
          className="mb-6 break-inside-avoid rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2
            id="sitemap-ecosystem-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            {t('sections.ecosystem.title')}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t('sections.ecosystem.description')}
          </p>
          <SitemapLinkList links={ecosystemLinks} navLabel={t('sections.ecosystem.navLabel')} />
        </section>
      </div>
    </PageShell>
  );
};

export default SiteMapPage;

import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';
import { networkConfig } from '@/config/networks';

import { readDashboard } from '../publicDataReads';

/**
 * The /contracts page header, rendered on the server: H1, lede, the network
 * the addresses live on, and the trust resources. The address list itself is
 * the page body's (server-rendered from the seeded dashboard, with verified
 * fallback addresses), so the header does not list the addresses a second
 * time.
 */
export async function ContractsSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'contracts' });
  // Resolves to null on transport failure; the body then shows the verified
  // fallback addresses and the header says so.
  const dashboard = await readDashboard();

  return (
    <PageHeader
      section="trust"
      title={t('seo.heading')}
      titleId="contracts-heading"
      subtitle={t('seo.description')}
      meta={
        <>
          <span className="text-muted-foreground">{networkConfig.chainName}</span>
          <span>{t('network.chain', { chainId: networkConfig.chainId })}</span>
          {!dashboard.data?.ContractAddrs ? <span>{t('seo.partialFallback')}</span> : null}
        </>
      }
      related={[
        { href: '/code', label: t('seo.links.code') },
        { href: '/security', label: t('seo.links.security') },
        { href: '/audits', label: t('seo.links.audits') },
        { href: '/risk-disclosures', label: t('seo.links.risk') },
      ]}
      relatedLabel={t('seo.relatedAria')}
    />
  );
}

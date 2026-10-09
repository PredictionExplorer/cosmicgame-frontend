import { getLocale, getTranslations } from 'next-intl/server';

import { getTrustCenterTabLabels } from '@/content/legal/labels';
import { TrustCenterTabs } from '@/content/legal/TrustCenterTabs';

import { PageHeader } from '@/components/layout/PageHeader';
import { networkConfig } from '@/config/networks';

import { readDashboard } from '../publicDataReads';

/**
 * The /contracts page header, rendered on the server: the Trust Center's
 * reading header (the tab's name as the H1, one reader-facing lede, the
 * network the addresses live on) with its tabs, so the contracts sit beside
 * the security page, the audits and the source code as one Trust Center.
 * The branded name stays in the document title and JSON-LD. The address
 * list itself (`ContractAddressList`) is the verified set, in the server
 * HTML whatever the indexer answers; when the indexer is down the meta line
 * says only that the live figures are missing.
 */
export async function ContractsSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'contracts' });
  // Resolves to null on transport failure; the body then shows the verified
  // fallback addresses and the header says so.
  const [dashboard, tabs] = await Promise.all([readDashboard(), getTrustCenterTabLabels(locale)]);

  return (
    <PageHeader
      variant="reading"
      section="trust"
      title={tabs.contracts}
      titleId="contracts-heading"
      subtitle={t('addresses.description')}
      meta={
        <>
          <span className="text-muted-foreground">{networkConfig.chainName}</span>
          <span>{t('network.chain', { chainId: networkConfig.chainId })}</span>
          {!dashboard.data?.ContractAddrs ? <span>{t('seo.partialFallback')}</span> : null}
        </>
      }
      tabs={<TrustCenterTabs current="contracts" labels={tabs} />}
    />
  );
}

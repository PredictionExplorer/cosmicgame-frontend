'use client';

import { useTranslations } from 'next-intl';

import { useActiveWeb3React } from '@/hooks/web3';
import UserStatisticsView from '@/components/UserStatisticsView';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SITE_EDGE_SHELL_CLASS } from '@/components/statistics/shell';
import { DataTableWidth } from '@/components/ui/data-table';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';
import { ViewAddressForm } from '@/components/user-statistics/ViewAddressForm';

/**
 * The connected wallet's statistics. Without a wallet there is no "own"
 * profile to show, so the page asks to connect (and links the public
 * participation statistics) instead of reporting "no activity yet"; since
 * every profile is public, it also opens any address's page from a field,
 * for a visitor on a phone without a wallet or one looking someone up.
 */
const MyStatistics = () => {
  const { account } = useActiveWeb3React();
  const t = useTranslations('myPages');
  const tWallet = useTranslations('wallet');

  if (!account) {
    return (
      <PageShell variant="data" className={SITE_EDGE_SHELL_CLASS}>
        <PageHeader
          section="account"
          sectionHub
          title={t('statistics.page.ownTitle')}
          subtitle={t('statistics.page.ownSubtitle')}
        />
        <WalletRequiredState
          title={tWallet('required.statistics.title')}
          description={tWallet('required.statistics.description')}
          publicLink={{
            href: '/statistics/participation',
            label: tWallet('required.statistics.publicLink'),
          }}
        >
          <ViewAddressForm className="mt-8 max-w-md border-t border-rule-faint pt-6" />
        </WalletRequiredState>
      </PageShell>
    );
  }

  // Short and wide ledgers stacked on one profile share one right edge.
  return (
    <DataTableWidth value="fill">
      <UserStatisticsView address={account} isOwnProfile={true} />
    </DataTableWidth>
  );
};

export default MyStatistics;

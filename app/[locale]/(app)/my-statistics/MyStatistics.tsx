'use client';

import { useTranslations } from 'next-intl';

import { useActiveWeb3React } from '@/hooks/web3';
import UserStatisticsView from '@/components/UserStatisticsView';
import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';

/**
 * The connected wallet's statistics. Without a wallet there is no "own"
 * profile to show, so the page asks to connect (and links the public
 * participation statistics) instead of reporting "no activity yet".
 */
const MyStatistics = () => {
  const { account } = useActiveWeb3React();
  const t = useTranslations('myPages');
  const tWallet = useTranslations('wallet');

  if (!account) {
    return (
      <MainWrapper aria-label={t('statistics.page.ariaOwn')}>
        <PageHeader
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
        />
      </MainWrapper>
    );
  }

  return <UserStatisticsView address={account} isOwnProfile={true} />;
};

export default MyStatistics;

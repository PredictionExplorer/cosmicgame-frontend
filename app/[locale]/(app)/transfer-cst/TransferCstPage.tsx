'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { UniswapTradeButton } from '@/components/common/UniswapTradeButton';
import { CstTransferForm } from '@/components/tokens/CstTransferForm';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';
import { PageShell } from '@/components/ui/page-shell';
import { useActiveWeb3React } from '@/hooks/web3';

export default function TransferCstPage() {
  const t = useTranslations('myPages');
  const tWallet = useTranslations('wallet');
  const { account, active } = useActiveWeb3React();

  return (
    <PageShell variant="data" backdrop="signature">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title={t('transferCst.page.title')}
          subtitle={t('transferCst.page.subtitle')}
          breadcrumbs={[
            { label: t('shared.home'), href: '/' },
            { label: t('transferCst.page.title') },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
          actions={<UniswapTradeButton variant="secondary" />}
        />

        {!active || !account ? (
          <WalletRequiredState
            title={tWallet('required.transferCst.title')}
            description={tWallet('required.transferCst.description')}
          />
        ) : (
          <CstTransferForm
            sourceAddress={account}
            sourceLabel={t('transferCst.page.sourceLabel')}
            description={t('transferCst.page.description')}
            historyHref={`/cosmic-token-transfer/${account}`}
          />
        )}
      </div>
    </PageShell>
  );
}

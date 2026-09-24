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
          section="account"
          title={t('transferCst.page.title')}
          subtitle={t('transferCst.page.subtitle')}
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

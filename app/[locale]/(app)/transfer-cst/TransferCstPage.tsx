'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getAddress } from 'viem';

import { Link } from '@/i18n/navigation';
import { REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import { PageHeader } from '@/components/layout/PageHeader';
import { UniswapTradeButton } from '@/components/common/UniswapTradeButton';
import { CstTransferForm } from '@/components/tokens/CstTransferForm';
import { AddressChip } from '@/components/ui/address-chip';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';
import { useActiveWeb3React } from '@/hooks/web3';

const TITLE_ID = 'transfer-cst-title';

/** The side column: the wallet the CST leaves, its history, and what to check first. */
function TransferGuide({ source }: { source: string }) {
  const t = useTranslations('myPages.transferCst.guide');
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="type-label text-subtle">{t('from')}</h2>
        <AddressChip address={source} className="max-w-full self-start" />
        <Link
          href={`/cosmic-token-transfer/${source}`}
          className="link-quiet inline-flex min-h-6 items-center gap-1.5 self-start type-body-sm text-foreground"
        >
          {t('history')}
          <ArrowRight aria-hidden className="size-3.5 text-subtle" />
        </Link>
      </div>
      <div className="border-s-2 border-primary ps-4">
        <h2 className="type-label text-foreground">{t('title')}</h2>
        <ul className="mt-2 flex list-none flex-col gap-2 ps-0 type-body-sm text-muted-foreground">
          <li>{t('final')}</li>
          <li>{t('network', { network: REQUIRED_CHAIN_NAME })}</li>
          <li>{t('paste')}</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Transfer CST: the connected wallet's CST sent to another address, with the
 * recipient checked, the amount capped by the balance and a review before the
 * wallet opens. Without a wallet the page says what connecting unlocks.
 */
export default function TransferCstPage() {
  const t = useTranslations('myPages');
  const tWallet = useTranslations('wallet');
  const { account, active } = useActiveWeb3React();
  const source = active && account ? getAddress(account) : null;

  const header = (
    <PageHeader
      section="account"
      title={t('transferCst.page.title')}
      titleId={TITLE_ID}
      subtitle={t('transferCst.page.subtitle', { network: REQUIRED_CHAIN_NAME })}
      actions={<UniswapTradeButton variant="secondary" />}
    />
  );

  if (!source) {
    return (
      <LedgerPage header={header}>
        <WalletRequiredState
          title={tWallet('required.transferCst.title')}
          description={tWallet('required.transferCst.description')}
        />
      </LedgerPage>
    );
  }

  return (
    <LedgerPage header={header} aside={<TransferGuide source={source} />}>
      <section aria-labelledby={TITLE_ID} className="rounded-surface bg-surface p-5 sm:p-8">
        <CstTransferForm source={source} />
      </section>
    </LedgerPage>
  );
}

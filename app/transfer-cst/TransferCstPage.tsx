'use client';

import { SendHorizontal } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { UniswapTradeButton } from '@/components/common/UniswapTradeButton';
import { CstTransferForm } from '@/components/tokens/CstTransferForm';
import { EmptyState } from '@/components/ui/empty-state';
import { PageShell } from '@/components/ui/page-shell';
import { useActiveWeb3React } from '@/hooks/web3';

export default function TransferCstPage() {
  const { account, active } = useActiveWeb3React();

  return (
    <PageShell variant="data" backdrop="signature">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Transfer CST"
          subtitle="Send your Cosmic Signature CST tokens to another address."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Transfer CST' }]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
          actions={<UniswapTradeButton variant="secondary" />}
        />

        {!active || !account ? (
          <EmptyState
            icon={<SendHorizontal className="h-8 w-8 text-muted-foreground/50" />}
            title="Wallet not connected"
            description="Connect your wallet to transfer CST from your own balance."
          />
        ) : (
          <CstTransferForm
            sourceAddress={account}
            sourceLabel="Connected wallet"
            description="Transfer CST from your connected wallet. The transaction is signed by your wallet and sent directly to the CST token contract."
            historyHref={`/cosmic-token-transfer/${account}`}
          />
        )}
      </div>
    </PageShell>
  );
}

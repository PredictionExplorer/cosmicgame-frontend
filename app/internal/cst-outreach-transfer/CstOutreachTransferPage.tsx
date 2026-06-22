'use client';

import { ShieldAlert, SendHorizontal } from 'lucide-react';

import { shortenHex } from '@/utils';

import { PageHeader } from '@/components/layout/PageHeader';
import { CstTransferForm } from '@/components/tokens/CstTransferForm';
import { EmptyState } from '@/components/ui/empty-state';
import { PageShell } from '@/components/ui/page-shell';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useActiveWeb3React } from '@/hooks/web3';

export default function CstOutreachTransferPage() {
  const { account, active } = useActiveWeb3React();
  const contractAddrs = useContractAddresses();
  const marketingWallet = contractAddrs.marketing;
  const isMarketingSigner =
    Boolean(account && marketingWallet) && account!.toLowerCase() === marketingWallet.toLowerCase();

  return (
    <PageShell variant="data" backdrop="signature">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="CST Outreach Transfer"
          subtitle="URL-only transfer tool for the configured outreach reserve wallet signer."
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {!active || !account ? (
          <EmptyState
            icon={<SendHorizontal className="h-8 w-8 text-muted-foreground/50" />}
            title="Wallet not connected"
            description="Connect the configured marketing wallet or multisig to transfer CST from the outreach reserve."
          />
        ) : !marketingWallet ? (
          <EmptyState
            icon={<ShieldAlert className="h-8 w-8 text-muted-foreground/50" />}
            title="Marketing wallet unavailable"
            description="The dashboard has not provided a marketing wallet address yet."
          />
        ) : !isMarketingSigner ? (
          <EmptyState
            icon={<ShieldAlert className="h-8 w-8 text-muted-foreground/50" />}
            title="Access restricted"
            description={`Connect the configured marketing wallet or multisig (${shortenHex(
              marketingWallet,
              6,
            )}) to use this URL-only transfer tool.`}
          />
        ) : (
          <CstTransferForm
            sourceAddress={marketingWallet}
            sourceLabel="Outreach reserve wallet"
            description="Transfer CST from the configured outreach reserve wallet. This action requires the marketing wallet or multisig to sign the standard CST transfer transaction."
            historyHref={`/cosmic-token-transfer/${marketingWallet}`}
          />
        )}
      </div>
    </PageShell>
  );
}

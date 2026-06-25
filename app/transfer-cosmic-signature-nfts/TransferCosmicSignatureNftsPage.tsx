'use client';

import { SendHorizontal } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { CosmicSignatureNftTransferForm } from '@/components/nft/CosmicSignatureNftTransferForm';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { Spinner } from '@/components/ui/spinner';
import { useCSTTokensByUser } from '@/hooks/useApiQuery';
import { useActiveWeb3React } from '@/hooks/web3';

export default function TransferCosmicSignatureNftsPage() {
  const { account, active } = useActiveWeb3React();
  const {
    data: tokensRaw,
    isLoading,
    isError,
  } = useCSTTokensByUser(active && account ? account : undefined);
  const tokens = tokensRaw ?? [];

  return (
    <PageShell variant="data" backdrop="signature">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Transfer Cosmic Signature NFTs"
          subtitle="Send one or more Cosmic Signature NFTs from your connected wallet to another address."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Transfer Cosmic Signature NFTs' }]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {!active || !account ? (
          <EmptyState
            icon={<SendHorizontal className="h-8 w-8 text-muted-foreground/50" />}
            title="Wallet not connected"
            description="Connect your wallet to transfer Cosmic Signature NFTs from your own wallet."
          />
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load NFTs"
            message="Unable to load your Cosmic Signature NFTs. Please try again."
          />
        ) : (
          <CosmicSignatureNftTransferForm
            sourceAddress={account}
            tokens={tokens}
            historyHref={`/cosmic-signature-transfer/${account}`}
          />
        )}
      </div>
    </PageShell>
  );
}

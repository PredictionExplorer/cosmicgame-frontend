'use client';

import { SendHorizontal } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { NftMarketplaceButton } from '@/components/common/NftMarketplaceButton';
import { CosmicSignatureNftTransferForm } from '@/components/nft/CosmicSignatureNftTransferForm';
import { CSTTable } from '@/components/tokens/CSTTable';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { Spinner } from '@/components/ui/spinner';
import { useCSTTokensByUser } from '@/hooks/useApiQuery';
import { useActiveWeb3React } from '@/hooks/web3';

function MyWallet() {
  const { account, active } = useActiveWeb3React();
  const {
    data: tokensRaw,
    isLoading: loading,
    isError: hasError,
  } = useCSTTokensByUser(active && account ? account : undefined);
  const tokens = tokensRaw ?? [];
  const error = hasError ? 'Failed to load Cosmic Signature NFTs.' : null;

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        title="My NFTs"
        subtitle="Cosmic Signature NFTs in your connected wallet"
        actions={<NftMarketplaceButton variant="secondary" label="Buy or sell NFTs" />}
      />

      {!active || !account ? (
        <EmptyState
          icon={<SendHorizontal className="h-8 w-8 text-muted-foreground/50" />}
          title="Wallet not connected"
          description="Please connect your wallet to view and manage your NFTs."
        />
      ) : loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load tokens" message={error} />
      ) : (
        <div className="mt-12 space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">Cosmic Signature NFTs I Own</h2>
            <CSTTable list={tokens} />
          </section>

          <Accordion
            type="single"
            collapsible
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5"
          >
            <AccordionItem value="transfer-nfts" className="border-0">
              <AccordionTrigger className="text-left hover:no-underline">
                <span>
                  <span className="block text-sm font-semibold text-foreground">Transfer NFTs</span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    Optional: send selected Cosmic Signature NFTs to another wallet.
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <CosmicSignatureNftTransferForm
                  sourceAddress={account}
                  tokens={tokens}
                  description="Select NFTs from this wallet only when you are ready to send them to another address."
                  historyHref={`/cosmic-signature-transfer/${account}`}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </PageShell>
  );
}

export default MyWallet;

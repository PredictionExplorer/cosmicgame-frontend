'use client';

import { SendHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('myPages');
  const { account, active } = useActiveWeb3React();
  const {
    data: tokensRaw,
    isLoading: loading,
    isError: hasError,
  } = useCSTTokensByUser(active && account ? account : undefined);
  const tokens = tokensRaw ?? [];

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        title={t('tokens.page.title')}
        subtitle={t('tokens.page.subtitle')}
        actions={<NftMarketplaceButton variant="secondary" label={t('tokens.page.marketplace')} />}
      />

      {!active || !account ? (
        <EmptyState
          icon={<SendHorizontal className="h-8 w-8 text-muted-foreground/50" />}
          title={t('shared.walletNotConnected')}
          description={t('tokens.page.walletDescription')}
        />
      ) : loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : hasError ? (
        <ErrorState
          title={t('tokens.page.loadErrorTitle')}
          message={t('tokens.page.loadErrorMessage')}
        />
      ) : (
        <div className="mt-12 space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">{t('tokens.page.ownedTitle')}</h2>
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
                  <span className="block text-sm font-semibold text-foreground">
                    {t('tokens.page.transferTitle')}
                  </span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    {t('tokens.page.transferSubtitle')}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <CosmicSignatureNftTransferForm
                  sourceAddress={account}
                  tokens={tokens}
                  description={t('tokens.page.transferDescription')}
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

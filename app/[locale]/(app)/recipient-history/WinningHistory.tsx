'use client';

import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSiteNavCopy } from '@/components/layout/siteNavCopy';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import RecipientHistoryTable from '@/components/tables/RecipientHistoryTable';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';
import { useClaimHistoryByUser } from '@/hooks/useApiQuery';
import { useActiveWeb3React } from '@/hooks/web3';
import { AllocationIcon } from '@/lib/conceptIcons';

/**
 * Every allocation the connected wallet has received, across all finalized
 * cycles, with whether each was retrieved. Retrieval itself happens on My
 * Allocations, which the header links.
 */
function WinningHistory() {
  const t = useTranslations('statistics');
  const tWallet = useTranslations('wallet');
  const nav = useSiteNavCopy();
  const locale = useLocale();
  const { account } = useActiveWeb3React();
  const { data, isLoading, error, refetch } = useClaimHistoryByUser(account);

  if (!account) {
    // The prompt below says what the page shows once connected: the header adds no lede of
    // its own to repeat it.
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader section="account" title={t('recipientHistory.pageTitle')} />
        <WalletRequiredState
          title={tWallet('required.history.title')}
          description={tWallet('required.history.description')}
          publicLink={{ href: '/allocation', label: tWallet('required.history.publicLink') }}
        />
      </PageShell>
    );
  }

  const history = data ?? [];

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        section="account"
        title={t('recipientHistory.pageTitle')}
        subtitle={t('recipientHistory.connectedDescription')}
        related={[
          { href: '/my-allocations', label: nav.routeLabel('myAllocations') },
          { href: '/allocation', label: nav.routeLabel('allocationRecipients') },
        ]}
      />

      {error ? (
        <ErrorState
          headingLevel={2}
          title={t('recipientHistory.loadError')}
          message={
            getLocaleConfig(locale).showRawProviderErrors
              ? error.message
              : t('recipientHistory.loadErrorDescription')
          }
          onRetry={() => void refetch()}
        />
      ) : !isLoading && history.length === 0 ? (
        <EmptyState
          variant="page"
          headingLevel={2}
          icon={<AllocationIcon aria-hidden className="size-6" />}
          title={t('recipientHistory.emptyTitle')}
          description={t('recipientHistory.emptyDescription')}
          action={
            <Link href="/" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              {nav.routeLabel('observatory')}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />
      ) : (
        <RecipientHistoryTable
          winningHistory={history}
          loading={isLoading}
          showClaimedStatus
          showWinnerAddr={false}
          showSummary
          className="mb-10"
        />
      )}
    </PageShell>
  );
}

export default WinningHistory;

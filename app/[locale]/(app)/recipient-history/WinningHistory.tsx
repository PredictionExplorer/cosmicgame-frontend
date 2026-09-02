'use client';

import { useLocale, useTranslations } from 'next-intl';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { PageShell } from '@/components/ui/page-shell';
import { useActiveWeb3React } from '@/hooks/web3';
import RecipientHistoryTable from '@/components/tables/RecipientHistoryTable';
import { useClaimHistoryByUser } from '@/hooks/useApiQuery';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';

function WinningHistory() {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const { account } = useActiveWeb3React();
  const { data, isLoading: loading, error: queryError } = useClaimHistoryByUser(account);
  const winningHistory = data ?? null;
  const error = queryError?.message ?? null;

  if (!account) {
    return (
      <PageShell variant="data" backdrop="signature">
        <PageHeader
          title={t('recipientHistory.pageTitle')}
          subtitle={t('recipientHistory.subtitle')}
        />
        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
          {t('recipientHistory.disconnectedDescription')}
        </p>
        <EmptyState
          title={t('recipientHistory.walletTitle')}
          description={t('recipientHistory.walletDescription')}
        />
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        title={t('recipientHistory.connectedTitle')}
        subtitle={t('recipientHistory.subtitle')}
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('recipientHistory.connectedDescription')}
      </p>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState
          title={t('recipientHistory.loadError')}
          message={
            getLocaleConfig(locale).showRawProviderErrors
              ? error
              : t('recipientHistory.loadErrorDescription')
          }
        />
      ) : !winningHistory || winningHistory.length === 0 ? (
        <EmptyState
          title={t('recipientHistory.emptyTitle')}
          description={t('recipientHistory.emptyDescription')}
        />
      ) : (
        <RecipientHistoryTable
          winningHistory={winningHistory}
          showClaimedStatus={true}
          showWinnerAddr={false}
        />
      )}
    </PageShell>
  );
}

export default WinningHistory;

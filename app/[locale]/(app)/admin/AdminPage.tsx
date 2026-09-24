'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';

import BanGestureTable from '@/components/tables/BanGestureTable';
import { ConnectWalletAction } from '@/components/wallet/ConnectWalletAction';
import { useGestureList } from '@/hooks/useApiQuery';
import { useActiveWeb3React } from '@/hooks/web3';

/**
 * The moderation list under the operator header: every gesture that carries
 * a message. Hide and Restore appear only once a wallet is connected; until
 * then the list is read-only and says how to moderate.
 */
export default function AdminPage() {
  const t = useTranslations('admin');
  const { data, isLoading, isError, refetch } = useGestureList();
  const { account, active } = useActiveWeb3React();
  const moderatorAddress = active && account ? account : null;

  const messages = useMemo(() => data?.filter((gesture) => gesture.Message !== '') ?? null, [data]);

  return (
    <BanGestureTable
      title={t('moderation.heading')}
      description={t('moderation.description')}
      gestureHistory={messages ?? []}
      loading={isLoading || (messages === null && !isError)}
      error={isError && messages === null ? t('moderation.loadError') : undefined}
      onRetry={() => void refetch()}
      moderatorAddress={moderatorAddress}
      notice={
        moderatorAddress ? null : (
          <div
            data-testid="moderation-read-only"
            className="flex flex-col gap-3 rounded-surface bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="flex items-start gap-2.5 type-body-sm text-muted-foreground">
              <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-subtle" />
              {t('moderation.readOnly')}
            </p>
            <ConnectWalletAction
              variant="outline"
              size="sm"
              className="shrink-0 self-start sm:self-auto"
            />
          </div>
        )
      }
    />
  );
}

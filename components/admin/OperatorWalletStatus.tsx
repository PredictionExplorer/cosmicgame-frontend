'use client';

import { Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useConnection } from 'wagmi';

import { AddressChip } from '@/components/ui/address-chip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveWeb3React } from '@/hooks/web3';

import { useOperatorRoles } from './useOperatorRoles';

/**
 * The operator header's wallet line: which wallet is connected and the
 * on-chain roles it holds, so an operator sees before acting whether this
 * wallet can use the tool in front of them.
 */
export function OperatorWalletStatus() {
  const t = useTranslations('admin');
  const { account, active } = useActiveWeb3React();
  const { status: connection } = useConnection();
  const connected = active && Boolean(account);
  const { status, roles } = useOperatorRoles(connected ? account : null);
  const restoring = !connected && (connection === 'reconnecting' || connection === 'connecting');

  return (
    <div data-testid="operator-wallet" className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="inline-flex items-center gap-1.5">
        <Wallet aria-hidden className="size-3.5" />
        {connected
          ? t('wallet.connected')
          : restoring
            ? t('wallet.restoring')
            : t('wallet.notConnected')}
      </span>
      {connected && account ? (
        <>
          <AddressChip
            address={account}
            variant="plain"
            href={false}
            label={false}
            className="type-hash text-foreground"
          />
          {status === 'loading' ? (
            <Skeleton className="h-5 w-32" />
          ) : roles.length > 0 ? (
            <ul aria-label={t('wallet.rolesLabel')} className="flex flex-wrap gap-1.5">
              {roles.map((role) => (
                <li key={role}>
                  <Badge tone="accent" size="sm">
                    {t(`wallet.roles.${role}`)}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : status === 'ready' ? (
            <Badge size="sm">{t('wallet.roles.none')}</Badge>
          ) : null}
          {status === 'error' ? (
            <span>{roles.length > 0 ? t('wallet.rolesPartial') : t('wallet.rolesError')}</span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

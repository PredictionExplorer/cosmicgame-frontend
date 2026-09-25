'use client';

import { AlertTriangle, ArrowUpRight, Check, Copy, LogOut, Repeat } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useWalletAccount, type WalletAccountState } from '@/hooks/useWalletAccount';
import { cn } from '@/lib/utils';
import { formatAddress } from '@/utils/format';

import { SwitchNetworkButton } from './NetworkGuard';

function NetworkLine({ account }: { account: WalletAccountState }) {
  const t = useTranslations('wallet');
  if (account.isWrongChain) {
    return (
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertTriangle
          className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', 'text-attention')}
          aria-hidden
        />
        <span>
          {account.connectedChainName
            ? t('network.walletOn', {
                current: account.connectedChainName,
                network: account.requiredChainName,
              })
            : t('network.walletOnOther', { network: account.requiredChainName })}
        </span>
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <span aria-hidden className={cn('h-1.5 w-1.5 shrink-0 rounded-full', 'bg-positive')} />
      {t('network.connectedTo', { network: account.requiredChainName })}
    </p>
  );
}

function AddressRow({ account }: { account: WalletAccountState }) {
  const t = useTranslations('wallet');
  if (!account.address) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        {account.walletName && (
          <p className="text-xs text-muted-foreground">{account.walletName}</p>
        )}
        <p className="truncate font-mono text-sm text-foreground" title={account.address}>
          {formatAddress(account.address)}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => void account.copyAddress()}
        aria-label={
          account.copied ? t('accessibility.addressCopied') : t('accessibility.copyAddress')
        }
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        {account.copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {account.copied ? t('accessibility.addressCopied') : ''}
      </span>
    </div>
  );
}

/**
 * The connected-account panel for sheets, drawers and popovers: address with
 * copy, network state (with a one-click switch when it is wrong), the address
 * on the block explorer, Switch wallet and Disconnect. Renders nothing when
 * no wallet is connected.
 */
export function WalletAccountPanel({ className }: { className?: string }) {
  const t = useTranslations('wallet');
  const account = useWalletAccount();
  if (!account.isConnected) return null;

  return (
    <div className={cn('flex flex-col gap-4', className)} data-testid="wallet-account-panel">
      <AddressRow account={account} />
      <div className="flex flex-col gap-2">
        <NetworkLine account={account} />
        {account.isWrongChain && <SwitchNetworkButton size="sm" className="w-full" />}
      </div>
      <div className="border-t border-border pt-3">
        <div className="-mx-2 flex flex-col gap-1">
          {account.explorerUrl && (
            <a
              href={account.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2.5 rounded-md px-2 text-sm text-foreground transition-colors hover:bg-muted sm:min-h-9"
            >
              <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden />
              {t('account.viewOnExplorer', { explorer: account.explorerName })}
            </a>
          )}
          <button
            type="button"
            onClick={() => void account.switchWallet()}
            disabled={account.isDisconnecting}
            className="flex min-h-11 items-center gap-2.5 rounded-md px-2 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-60 sm:min-h-9"
          >
            <Repeat className="h-4 w-4 text-muted-foreground" aria-hidden />
            {t('account.switchWallet')}
          </button>
          <button
            type="button"
            onClick={() => void account.disconnect()}
            disabled={account.isDisconnecting}
            className="flex min-h-11 items-center gap-2.5 rounded-md px-2 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-60 sm:min-h-9"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" aria-hidden />
            {t('account.disconnect')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The network state as `DropdownMenuItem`s for the desktop wallet menu: the
 * network line, plus "Switch to Arbitrum One" while the wallet is elsewhere.
 * The menu shows it right under the address, so the fix is the first thing
 * the wrong-network pill leads to. Place inside a `DropdownMenuContent`.
 */
export function WalletNetworkMenuItems() {
  const t = useTranslations('wallet');
  const account = useWalletAccount();
  if (!account.isConnected) return null;

  return (
    <>
      <div className="px-2 py-1.5">
        <NetworkLine account={account} />
      </div>
      {account.isWrongChain && (
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 px-2 font-semibold"
          onSelect={() => void account.switchToRequiredChain()}
        >
          <Repeat className={cn('h-3.5 w-3.5', 'text-attention')} aria-hidden />
          {t('network.switchTo', { network: account.requiredChainName })}
        </DropdownMenuItem>
      )}
    </>
  );
}

/**
 * The account actions as `DropdownMenuItem`s, for the desktop wallet menu:
 * explorer link, Switch wallet, Disconnect. Place inside a
 * `DropdownMenuContent`.
 */
export function WalletAccountMenuItems() {
  const t = useTranslations('wallet');
  const account = useWalletAccount();
  if (!account.isConnected) return null;

  return (
    <>
      {account.explorerUrl && (
        <DropdownMenuItem asChild className="cursor-pointer gap-2.5 px-2">
          <a href={account.explorerUrl} target="_blank" rel="noopener noreferrer">
            <ArrowUpRight className="size-3.5 text-subtle" aria-hidden />
            {t('account.viewOnExplorer', { explorer: account.explorerName })}
          </a>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        className="cursor-pointer gap-2.5 px-2"
        onSelect={() => void account.switchWallet()}
      >
        <Repeat className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        {t('account.switchWallet')}
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer gap-2.5 px-2"
        onSelect={() => void account.disconnect()}
      >
        <LogOut className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        {t('account.disconnect')}
      </DropdownMenuItem>
    </>
  );
}

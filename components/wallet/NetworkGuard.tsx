'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button, type ButtonProps } from '@/components/ui/button';
import { useWalletNetwork, type WalletNetworkState } from '@/hooks/useWalletNetwork';
import { useActiveWeb3React } from '@/hooks/web3';
import { cn } from '@/lib/utils';

import { ConnectWalletAction } from './ConnectWalletAction';

/** "Your wallet is on Ethereum. Cosmic Signature runs on Arbitrum One." */
function useWrongNetworkSentence(): (network: WalletNetworkState) => string {
  const t = useTranslations('wallet');
  return (network) =>
    network.connectedChainName
      ? t('network.walletOn', {
          current: network.connectedChainName,
          network: network.requiredChainName,
        })
      : t('network.walletOnOther', { network: network.requiredChainName });
}

type SwitchNetworkButtonProps = Omit<ButtonProps, 'onClick' | 'children'>;

/**
 * One-click switch to the protocol's chain. The wallet shows its own prompt;
 * while it is open the button reads "Switching…" and is busy.
 */
export function SwitchNetworkButton({ disabled, ...props }: SwitchNetworkButtonProps) {
  const t = useTranslations('wallet');
  const { requiredChainName, switchToRequiredChain, isSwitching } = useWalletNetwork();
  return (
    <Button
      {...props}
      type="button"
      onClick={() => void switchToRequiredChain()}
      aria-busy={isSwitching || undefined}
      disabled={isSwitching || disabled}
    >
      {isSwitching ? <Loader2 className="animate-spin" aria-hidden /> : <RefreshCw aria-hidden />}
      {isSwitching ? t('network.switching') : t('network.switchTo', { network: requiredChainName })}
    </Button>
  );
}

/**
 * Wrong-network button for the header, next to the wallet pill. Renders
 * nothing unless a connected wallet is on another chain; then one click asks
 * the wallet to switch.
 *
 * It has to fit beside the pill at every width and in every locale, so the
 * visible label follows the room the header has: an icon-only 44px target on
 * phones (the header already holds four icon controls) and "Wrong network"
 * from `md`, while the navigation sits in the drawer. Below 360px, and from
 * `xl` where the navigation joins the bar, the chip steps aside and
 * `WrongNetworkBadge` on the wallet pill carries the state. The accessible
 * name is always the full "Wrong network. Switch to Arbitrum One", and
 * `title` explains both networks on hover.
 */
export function WrongNetworkChip({ className }: { className?: string }) {
  const t = useTranslations('wallet');
  const network = useWalletNetwork();
  const sentence = useWrongNetworkSentence();
  if (!network.isWrongChain) return null;

  const action = network.isSwitching
    ? t('network.switching')
    : t('network.switchTo', { network: network.requiredChainName });

  return (
    <button
      type="button"
      onClick={() => void network.switchToRequiredChain()}
      aria-busy={network.isSwitching || undefined}
      disabled={network.isSwitching}
      title={`${sentence(network)} ${action}`}
      data-testid="wrong-network-chip"
      className={cn(
        'hidden size-11 shrink-0 items-center justify-center gap-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors min-[360px]:inline-flex xl:hidden',
        'sm:size-9 md:w-auto md:px-3',
        'border-attention/45 bg-attention-surface hover:bg-attention/20',
        'text-attention',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-progress',
        className,
      )}
    >
      {network.isSwitching ? (
        <Loader2 className="size-4 shrink-0 animate-spin md:size-3.5" aria-hidden />
      ) : (
        <AlertTriangle className="size-4 shrink-0 md:size-3.5" aria-hidden />
      )}
      <span className="sr-only md:not-sr-only">{t('network.wrong')}</span>
      <span className="sr-only">{action}</span>
    </button>
  );
}

/**
 * The wrong-network state as a badge on the wallet pill, where the header has
 * no room for `WrongNetworkChip`: phones under 360px and the desktop bar
 * (1024px and up), where the navigation fills the row. The pill opens the
 * account panel or menu, which explains the state and offers the switch.
 * Place it inside a `relative` trigger; pass visibility classes for the widths
 * where the chip is shown instead.
 *
 * The badge is drawn only: a button's `aria-label` replaces its content, so
 * the trigger says the state in its own name (the wallet pill's
 * `account.menuLabelWrongNetwork`).
 */
export function WrongNetworkBadge({ className }: { className?: string }) {
  const { isWrongChain } = useWalletNetwork();
  if (!isWrongChain) return null;
  return (
    <span
      aria-hidden
      data-testid="wrong-network-badge"
      className={cn(
        'absolute right-0 -top-0.5 inline-flex size-4 items-center justify-center rounded-full border border-background bg-background',
        className,
      )}
    >
      <AlertTriangle className="size-3.5 text-attention" />
    </span>
  );
}

export interface ChainGuardProps {
  /** The action that needs the wallet on the protocol's chain. */
  children: ReactNode;
  /**
   * Also require a connected wallet: without one, a Connect button stands in
   * for the action. Off by default (many actions have their own connect path).
   */
  requireConnection?: boolean;
  /** Show the one-line explanation above the switch button (default on). */
  explain?: boolean;
  className?: string;
  /** Props for the switch / connect button that replaces the action. */
  buttonClassName?: string;
}

/**
 * Wraps a primary action (Retrieve, Anchor, Send…). While the wallet is on
 * another chain the action is replaced by "Switch to Arbitrum One" and one
 * sentence naming both networks, so a wrong-network write never becomes a
 * dead-end error. Every write still goes through the chain guard in useTxFlow
 * / useRequireChain; this makes the state visible before the click.
 */
export function ChainGuard({
  children,
  requireConnection = false,
  explain = true,
  className,
  buttonClassName,
}: ChainGuardProps) {
  const { account } = useActiveWeb3React();
  const network = useWalletNetwork();
  const sentence = useWrongNetworkSentence();

  if (requireConnection && !account) {
    return (
      <div className={className}>
        <ConnectWalletAction className={buttonClassName} />
      </div>
    );
  }
  if (!network.isWrongChain) return <>{children}</>;

  return (
    <div className={cn('flex flex-col items-start gap-2', className)} data-testid="chain-guard">
      {explain && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertTriangle className={cn('mt-0.5 size-4 shrink-0', 'text-attention')} aria-hidden />
          {sentence(network)}
        </p>
      )}
      <SwitchNetworkButton className={buttonClassName} />
    </div>
  );
}

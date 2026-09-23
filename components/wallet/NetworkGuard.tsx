'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button, type ButtonProps } from '@/components/ui/button';
import { useRequireChain } from '@/hooks/useRequireChain';
import { useActiveWeb3React } from '@/hooks/web3';
import { cn } from '@/lib/utils';

import { ConnectWalletAction } from './ConnectWalletAction';

/*
 * Attention colour for the wrong-network state. `--attention` is the
 * palette-tuned state token; the fallback is its shared default. Always paired
 * with an icon and a word, never colour alone.
 */
const ATTENTION_TEXT = 'text-[hsl(var(--attention,40_90%_68%))]';
const ATTENTION_CHIP =
  'border-[hsl(var(--attention,40_90%_68%)/0.45)] bg-[hsl(var(--attention,40_90%_68%)/0.12)] hover:bg-[hsl(var(--attention,40_90%_68%)/0.2)]';

type SwitchNetworkButtonProps = Omit<ButtonProps, 'onClick' | 'children'>;

/**
 * One-click switch to the protocol's chain. The wallet shows its own prompt;
 * while it is open the button reads "Switching…" and is busy.
 */
export function SwitchNetworkButton({ disabled, ...props }: SwitchNetworkButtonProps) {
  const t = useTranslations('wallet');
  const { requiredChainName, switchToRequiredChain, isSwitching } = useRequireChain();
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
 * Compact wrong-network chip for the header, next to the wallet pill. Renders
 * nothing unless a connected wallet is on another chain; then it is a single
 * button — "Wrong network · Switch to Arbitrum One" — that asks the wallet to
 * switch.
 */
export function WrongNetworkChip({ className }: { className?: string }) {
  const t = useTranslations('wallet');
  const {
    isWrongChain,
    requiredChainName,
    connectedChainName,
    switchToRequiredChain,
    isSwitching,
  } = useRequireChain();
  if (!isWrongChain) return null;

  const description = connectedChainName
    ? t('network.walletOn', { current: connectedChainName, network: requiredChainName })
    : t('network.walletOnOther', { network: requiredChainName });

  return (
    <button
      type="button"
      onClick={() => void switchToRequiredChain()}
      aria-busy={isSwitching || undefined}
      disabled={isSwitching}
      title={description}
      data-testid="wrong-network-chip"
      className={cn(
        'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors sm:min-h-9',
        ATTENTION_CHIP,
        ATTENTION_TEXT,
        'disabled:cursor-progress',
        className,
      )}
    >
      {isSwitching ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
      )}
      <span>{t('network.wrong')}</span>
      <span aria-hidden className="hidden sm:inline">
        ·
      </span>
      <span className="sr-only sm:not-sr-only">
        {isSwitching
          ? t('network.switching')
          : t('network.switchTo', { network: requiredChainName })}
      </span>
    </button>
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
 * / useContract; this makes the state visible before the click.
 */
export function ChainGuard({
  children,
  requireConnection = false,
  explain = true,
  className,
  buttonClassName,
}: ChainGuardProps) {
  const t = useTranslations('wallet');
  const { account } = useActiveWeb3React();
  const { isWrongChain, requiredChainName, connectedChainName } = useRequireChain();

  if (requireConnection && !account) {
    return (
      <div className={className}>
        <ConnectWalletAction className={buttonClassName} />
      </div>
    );
  }
  if (!isWrongChain) return <>{children}</>;

  return (
    <div className={cn('flex flex-col items-start gap-2', className)} data-testid="chain-guard">
      {explain && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertTriangle className={cn('mt-0.5 h-4 w-4 shrink-0', ATTENTION_TEXT)} aria-hidden />
          {connectedChainName
            ? t('network.walletOn', { current: connectedChainName, network: requiredChainName })
            : t('network.walletOnOther', { network: requiredChainName })}
        </p>
      )}
      <SwitchNetworkButton className={buttonClassName} />
    </div>
  );
}

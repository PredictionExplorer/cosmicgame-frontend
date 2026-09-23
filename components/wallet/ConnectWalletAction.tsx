'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button, type ButtonProps } from '@/components/ui/button';
import { useWalletUi } from '@/contexts/WalletUiContext';
import { cn } from '@/lib/utils';

interface NetworkInformationLike {
  saveData?: boolean;
}

function prefersReducedData(): boolean {
  if (typeof navigator === 'undefined') return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return connection?.saveData === true;
}

function whenIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout: 3_000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 200);
  return () => window.clearTimeout(id);
}

export interface ConnectWalletActionProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  /** Replaces the default "Connect Wallet" label. */
  label?: ReactNode;
  /** Leading wallet icon (default on). */
  showIcon?: boolean;
  /**
   * Download the wallet UI when the button scrolls into view and the browser
   * is idle. Use on page-level connect prompts (a visitor who reaches one is
   * likely to connect); skipped when the browser asks to save data.
   */
  warmOnVisible?: boolean;
}

/**
 * The connect button every surface shares: warms the lazy wallet UI on hover
 * and focus, and shows a spinner with `aria-busy` from the tap until the
 * wallet list is on screen — on a phone the first tap downloads the list, and
 * without feedback the button looks dead.
 */
export function ConnectWalletAction({
  label,
  showIcon = true,
  warmOnVisible = false,
  className,
  disabled,
  ...buttonProps
}: ConnectWalletActionProps) {
  const t = useTranslations('wallet');
  const { requestConnectModal, warmConnectModal, connectPending } = useWalletUi();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const node = buttonRef.current;
    if (!warmOnVisible || !node || prefersReducedData()) return undefined;
    if (typeof IntersectionObserver === 'undefined') return undefined;
    let cancelIdle: (() => void) | null = null;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      cancelIdle = whenIdle(warmConnectModal);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelIdle?.();
    };
  }, [warmConnectModal, warmOnVisible]);

  return (
    <Button
      ref={buttonRef}
      type="button"
      onClick={requestConnectModal}
      onPointerEnter={warmConnectModal}
      onFocus={warmConnectModal}
      aria-busy={connectPending || undefined}
      disabled={disabled}
      data-testid="connect-wallet-button"
      className={cn(connectPending && 'cursor-progress', className)}
      {...buttonProps}
    >
      {connectPending ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : showIcon ? (
        <Wallet aria-hidden />
      ) : null}
      {label ?? t('connect.button')}
      {connectPending && <span className="sr-only">{t('connect.opening')}</span>}
    </Button>
  );
}

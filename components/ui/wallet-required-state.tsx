'use client';

import { useId, type ReactNode } from 'react';
import { ArrowRight, Loader2, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAccount } from 'wagmi';

import { Link } from '@/i18n/navigation';
import { ConnectWalletAction } from '@/components/wallet/ConnectWalletAction';
import { cn } from '@/lib/utils';

export interface WalletRequiredStateProps {
  /** What connecting unlocks, as a sentence title: "Connect a wallet to see your allocations". */
  title: string;
  /** One sentence on what the page shows once connected. */
  description?: string;
  /** Public view of the same kind of data, for visitors who only want to look. */
  publicLink?: { href: string; label: string };
  /** Heading level for the title; the page H1 sits above, so h2 by default. */
  headingLevel?: 'h2' | 'h3';
  /** Extra content under the actions (a Uniswap link on the CST pages…). */
  children?: ReactNode;
  className?: string;
}

/**
 * The disconnected state of a wallet-gated page (My Allocations, My NFTs, My
 * Anchors, My Statistics, Allocation History, Transfer CST): what connecting
 * unlocks, a Connect button that opens the wallet list, reassurance that
 * connecting signs nothing, and a way to the public view of the same data.
 *
 * While wagmi restores a returning visitor's session it shows a quiet
 * "Connecting…" line instead, so the Connect button does not flash before
 * the page switches to the connected view.
 */
export function WalletRequiredState({
  title,
  description,
  publicLink,
  headingLevel = 'h2',
  children,
  className,
}: WalletRequiredStateProps) {
  const t = useTranslations('wallet');
  const tCommon = useTranslations('common');
  const { status } = useAccount();
  const Heading = headingLevel;
  const titleId = useId();
  const restoring = status === 'reconnecting' || status === 'connecting';

  return (
    <section
      aria-labelledby={titleId}
      data-testid="wallet-required-state"
      className={cn(
        'mx-auto flex max-w-xl flex-col items-center px-4 py-14 text-center sm:py-16',
        className,
      )}
    >
      <div className="mb-5 rounded-2xl border border-border bg-card/60 p-4">
        <Wallet className="h-7 w-7 text-primary" aria-hidden />
      </div>
      <Heading id={titleId} className="type-heading-3 text-balance text-foreground">
        {title}
      </Heading>
      {description && (
        <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {restoring ? (
        <p
          role="status"
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {tCommon('liveStatus.connecting')}
        </p>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <ConnectWalletAction size="lg" warmOnVisible />
          {publicLink && (
            <Link
              href={publicLink.href}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline sm:min-h-0"
            >
              {publicLink.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      )}
      <p className="mt-4 max-w-sm text-pretty text-xs leading-relaxed text-muted-foreground">
        {t('required.hint')}
      </p>
      {children}
    </section>
  );
}

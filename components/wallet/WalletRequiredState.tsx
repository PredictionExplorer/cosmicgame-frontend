'use client';

import type { ReactNode } from 'react';
import { ArrowRight, Loader2, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useConnection } from 'wagmi';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

import { ConnectWalletAction } from './ConnectWalletAction';

export interface WalletRequiredStateProps {
  /** What connecting unlocks, as a sentence title: "Connect a wallet to see your allocations". */
  title: string;
  /** One sentence on what the page shows once connected (not a second call to connect). */
  description?: string;
  /** Public view of the same kind of data, for visitors who only want to look. */
  publicLink?: { href: string; label: string };
  /**
   * A figure in place of the wallet icon tile: what will fill the page once
   * connected (My NFTs shows the newest plates).
   */
  visual?: ReactNode;
  /** Heading level for the title; the page H1 sits above, so h2 by default. */
  headingLevel?: 'h2' | 'h3';
  /** Extra content under the actions (a Uniswap link on the CST pages…). */
  children?: ReactNode;
  className?: string;
}

/**
 * Keeps a trailing icon on the line of the label's last word: the text may
 * wrap anywhere else, but never leaves the arrow alone on a line. Labels
 * without spaces (Chinese, Japanese) stay whole.
 */
function withTrailingIcon(label: string, icon: ReactNode): ReactNode {
  const cut = label.lastIndexOf(' ') + 1;
  return (
    <>
      {label.slice(0, cut)}
      <span className="whitespace-nowrap">
        {label.slice(cut)}
        {icon}
      </span>
    </>
  );
}

/**
 * The disconnected state of a wallet-gated page (My Allocations, My NFTs, My
 * Anchors, My Statistics, Allocation History, Transfer CST): what connecting
 * unlocks, what the page shows once connected, a Connect button that opens
 * the wallet list, reassurance that connecting signs nothing, and a way to
 * the public view of the same data.
 *
 * It is the page variant of `EmptyState`, so every empty, error and wallet
 * state shares one well, icon tone and type scale, and its public link is the
 * underlined `link` every empty state's next step uses.
 *
 * While wagmi restores a returning visitor's session it shows a quiet
 * "Restoring your wallet connection…" line instead, so the Connect button
 * does not flash before the page switches to the connected view.
 */
export function WalletRequiredState({
  title,
  description,
  publicLink,
  visual,
  headingLevel = 'h2',
  children,
  className,
}: WalletRequiredStateProps) {
  const t = useTranslations('wallet');
  const { status } = useConnection();
  const restoring = status === 'reconnecting' || status === 'connecting';

  return (
    <section
      aria-label={title}
      data-testid="wallet-required-state"
      className={cn('mx-auto max-w-xl', className)}
    >
      <EmptyState
        variant="page"
        headingLevel={headingLevel === 'h3' ? 3 : 2}
        icon={<Wallet />}
        visual={visual}
        title={title}
        description={description}
        className="py-14 sm:py-16"
        action={
          <div className="flex flex-col items-center">
            {restoring ? (
              <p
                role="status"
                className="type-body-sm inline-flex min-h-11 items-center gap-2 text-muted-foreground"
              >
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t('connect.restoring')}
              </p>
            ) : (
              <div className="flex max-w-full flex-col items-center gap-3 sm:flex-row sm:gap-5">
                <ConnectWalletAction size="lg" warmOnVisible />
                {publicLink ? (
                  <Link
                    href={publicLink.href}
                    className="link type-body-sm inline-block max-w-full py-3 font-medium text-balance sm:py-0"
                  >
                    {withTrailingIcon(
                      publicLink.label,
                      <ArrowRight className="ml-1.5 inline size-4 align-[-0.1875em]" aria-hidden />,
                    )}
                  </Link>
                ) : null}
              </div>
            )}
            <p className="type-caption mt-4 max-w-sm text-pretty text-subtle">
              {t('required.hint')}
            </p>
            {children}
          </div>
        }
      />
    </section>
  );
}

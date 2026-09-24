'use client';

import { ArrowRight, Info } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useBalance, useConnection } from 'wagmi';

import { activeChain } from '@/config/chains';
import { Link } from '@/i18n/navigation';
import { REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';
import { cn } from '@/lib/utils';
import { formatAmount } from '@/utils/format/numbers';

/** FAQ answer on moving ETH to the protocol's chain (a stable public anchor). */
export const FUNDING_HELP_HREF = '/faq#how-to-get-eth-on-arbitrum';

export interface FundingNoticeProps {
  /** ETH the action needs before gas (the Gesture Cost), in wei; null while unknown. */
  requiredWei: bigint | null | undefined;
  className?: string;
}

/**
 * Tells a connected participant, before they press submit, that their wallet
 * on the protocol's chain cannot cover the action — with both amounts and a
 * link to how to add ETH there. Renders nothing while the balance or cost is
 * unknown, when no wallet is connected, or when the balance covers the cost
 * (the submit-time check stays as the backstop, since gas is not included).
 */
export function FundingNotice({ requiredWei, className }: FundingNoticeProps) {
  const t = useTranslations('wallet');
  const locale = useLocale();
  const { address } = useConnection();
  const { data: balance } = useBalance({
    address,
    chainId: activeChain.id,
    query: { enabled: Boolean(address) },
  });

  if (!address || requiredWei == null || requiredWei <= 0n || !balance) return null;
  if (balance.value >= requiredWei) return null;

  return (
    <div
      role="note"
      data-testid="funding-notice"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border border-border bg-card/60 px-3 py-2.5 text-sm text-muted-foreground',
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <p className="text-foreground">
          {t('funding.short', {
            available: formatAmount(balance.value, { unit: 'ETH', locale, withUnit: false }),
            required: formatAmount(requiredWei, { unit: 'ETH', locale, withUnit: false }),
            network: REQUIRED_CHAIN_NAME,
          })}
        </p>
        <Link
          href={FUNDING_HELP_HREF}
          className="mt-1 inline-flex min-h-9 items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"
        >
          {t('funding.howTo', { network: REQUIRED_CHAIN_NAME })}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

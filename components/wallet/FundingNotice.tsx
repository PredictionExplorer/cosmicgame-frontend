'use client';

import { ArrowRight, Info } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

import { activeChain } from '@/config/chains';
import { Link } from '@/i18n/navigation';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';
import { cn } from '@/lib/utils';

/** FAQ answer on moving ETH to the protocol's chain (a stable public anchor). */
export const FUNDING_HELP_HREF = '/faq#how-to-get-eth-on-arbitrum';

/** Fraction digits for the two ETH amounts in the notice. */
const DISPLAY_DECIMALS = 4;

function formatEth(wei: bigint, intlLocale: string): string {
  const value = Number(formatEther(wei));
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString(intlLocale, { maximumFractionDigits: DISPLAY_DECIMALS });
}

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
  const { intlLocale } = getLocaleConfig(useLocale());
  const { address } = useAccount();
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
            available: formatEth(balance.value, intlLocale),
            required: formatEth(requiredWei, intlLocale),
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

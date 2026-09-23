'use client';

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  checksumAddress,
  findKnownAddress,
  formatAddress,
  isZeroAddress,
  sameAddress,
} from '@/utils/format';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { useClipboard } from '@/hooks/useClipboard';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';

/** How long the copied check stays before the copy icon returns. */
const COPIED_FEEDBACK_MS = 2_000;

/** The zero address in a transfer: a token came into being, or was consumed. */
const ZERO_ADDRESS_LABELS = {
  from: 'address.imprinted',
  to: 'address.consumed',
} as const;

export interface AddressChipProps {
  /** The address (or hash) to show. */
  address: string;
  /** Link target. Default `/user/<address>`; `false` renders plain text. */
  href?: string | false;
  /** `chip` (default): a tinted pill. `plain`: inline text for table cells and prose. */
  variant?: 'chip' | 'plain';
  /**
   * `short` (default): "0x1Ec1…E990". `full`: the whole checksummed address,
   * for a detail-page header only. `responsive`: short below `sm`, full from `sm`.
   */
  display?: 'short' | 'full' | 'responsive';
  /** Show the copy button (copies the full address). Default `true`. */
  showCopy?: boolean;
  /**
   * The zero address's role in a transfer row: `from` reads "Imprinted",
   * `to` reads "Consumed". Without it the zero address reads "Zero address".
   */
  zeroRole?: 'from' | 'to';
  /** The address the page is about; a match reads "This address" and is not linked. */
  currentAddress?: string | null;
  /**
   * A label to show instead of hex. By default protocol contracts are
   * labelled by name ("Public Goods Vault"); pass `false` to always show hex.
   */
  label?: string | false;
  className?: string;
}

/**
 * The one address display: checksummed, shortened as 0x1Ec1…E990 with the
 * full address on hover (`title`), never wrapping, with a copy button and a
 * link to the participant page. Protocol contracts, the zero address and the
 * address the page is about read as words instead of hex.
 */
export function AddressChip({
  address,
  href,
  variant = 'chip',
  display = 'short',
  showCopy = true,
  zeroRole,
  currentAddress,
  label,
  className,
}: AddressChipProps) {
  const t = useTranslations('formats');
  const tCommon = useTranslations('common');
  const contracts = useContractAddresses();
  const { copy } = useClipboard();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const full = checksumAddress(address);
  const isSelf = sameAddress(address, currentAddress);
  const knownKey = label === undefined ? findKnownAddress(address, contracts) : null;

  let wordLabel: string | null = null;
  if (typeof label === 'string') wordLabel = label;
  else if (isSelf) wordLabel = t('address.self');
  else if (label !== false && isZeroAddress(address)) {
    wordLabel = t(zeroRole ? ZERO_ADDRESS_LABELS[zeroRole] : 'address.zero');
  } else if (knownKey) wordLabel = t(`address.known.${knownKey}`);

  const title = wordLabel ? `${wordLabel} · ${full}` : full;
  const linkTarget =
    href === false || isSelf || isZeroAddress(address) ? null : (href ?? `/user/${address}`);

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    // The chip often sits inside a clickable row or card link.
    event.preventDefault();
    event.stopPropagation();
    await copy(full);
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  let content: ReactNode;
  if (wordLabel) {
    content = <span className="truncate">{wordLabel}</span>;
  } else if (display === 'responsive') {
    content = (
      <span className="font-mono">
        <span className="sm:hidden">{formatAddress(address)}</span>
        <span className="hidden sm:inline">{full}</span>
      </span>
    );
  } else {
    content = (
      <span className="font-mono">{display === 'full' ? full : formatAddress(address)}</span>
    );
  }

  const textClass =
    'inline-flex min-w-0 items-center text-muted-foreground no-underline transition-colors print:!text-foreground';

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 whitespace-nowrap align-middle',
        variant === 'chip' && 'rounded-md bg-foreground/[0.04] py-0.5 pl-2 pr-0.5 text-xs',
        variant === 'chip' && !showCopy && 'pr-2',
        className,
      )}
    >
      {linkTarget ? (
        <Link
          href={linkTarget}
          title={title}
          className={cn(textClass, 'hover:text-primary focus-visible:text-primary max-sm:min-h-6')}
        >
          {content}
        </Link>
      ) : (
        <span title={title} className={textClass}>
          {content}
        </span>
      )}
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          data-touch-target="extended"
          className={cn(
            'inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground',
            TOUCH_TARGET_EXTENDED_CLASS,
          )}
          aria-label={copied ? tCommon('actions.copied') : tCommon('actions.copyAddress')}
        >
          {copied ? (
            <Check aria-hidden className="size-3.5 text-[hsl(var(--success))]" />
          ) : (
            <Copy aria-hidden className="size-3.5" />
          )}
        </button>
      )}
      <span role="status" className="sr-only">
        {copied ? tCommon('actions.addressCopied') : ''}
      </span>
    </span>
  );
}

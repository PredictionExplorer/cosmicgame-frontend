'use client';

import type { MouseEvent, ReactNode } from 'react';
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
import { useCopyFeedback } from '@/hooks/useCopyFeedback';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';

/**
 * A shortened address ("0x1Ec1…⁠E990") is one word: the word joiner after the
 * ellipsis leaves it no break opportunity, but the base `.font-mono` rule's
 * `overflow-wrap: anywhere` would still split it between any two characters.
 * Opting out keeps it whole, so a compact table that cannot fit it reports
 * the overflow and becomes records instead of printing "0x360E…FB3 / 2".
 * The full 42-character form keeps `anywhere`: it is wider than a phone.
 */
const SHORT_ADDRESS_CLASS = '[overflow-wrap:normal]';

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
   * A label to show instead of hex. By default the address the page is
   * about, the zero address and protocol contracts ("Public Goods Vault")
   * read as words; pass `false` to always show hex (linking still follows
   * `href`, `currentAddress` and the zero-address rule).
   */
  label?: string | false;
  /**
   * Let a word label ("Cosmic Signature NFT Anchoring Wallet") wrap onto more
   * lines instead of truncating, where the full name must read (a spec-sheet
   * ledger row). Hex never wraps.
   */
  wrapLabel?: boolean;
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
  wrapLabel = false,
  className,
}: AddressChipProps) {
  const t = useTranslations('formats');
  const tCommon = useTranslations('common');
  const contracts = useContractAddresses();
  const { copied, copy } = useCopyFeedback();

  const full = checksumAddress(address);
  const isSelf = sameAddress(address, currentAddress);
  const knownKey = label === undefined ? findKnownAddress(address, contracts) : null;

  let wordLabel: string | null = null;
  if (typeof label === 'string') wordLabel = label;
  else if (label !== false) {
    if (isSelf) wordLabel = t('address.self');
    else if (isZeroAddress(address)) {
      wordLabel = t(zeroRole ? ZERO_ADDRESS_LABELS[zeroRole] : 'address.zero');
    } else if (knownKey) wordLabel = t(`address.known.${knownKey}`);
  }

  const title = wordLabel ? `${wordLabel} · ${full}` : full;
  const linkTarget =
    href === false || isSelf || isZeroAddress(address) ? null : (href ?? `/user/${address}`);

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    // The chip often sits inside a clickable row or card link.
    event.preventDefault();
    event.stopPropagation();
    await copy(full);
  };

  let content: ReactNode;
  if (wordLabel) {
    content = (
      <span className={wrapLabel ? 'whitespace-normal [overflow-wrap:anywhere]' : 'truncate'}>
        {wordLabel}
      </span>
    );
  } else if (display === 'responsive') {
    content = (
      <span className="font-mono">
        <span className={cn('sm:hidden', SHORT_ADDRESS_CLASS)}>{formatAddress(address)}</span>
        <span className="hidden sm:inline">{full}</span>
      </span>
    );
  } else if (display === 'full') {
    content = <span className="font-mono">{full}</span>;
  } else {
    content = (
      <span className={cn('font-mono', SHORT_ADDRESS_CLASS)}>{formatAddress(address)}</span>
    );
  }

  // A chip is a muted pill with no underline (the pill is its own cue);
  // plain text takes the colour of the cell or sentence it sits in.
  const textClass = cn(
    'inline-flex min-w-0 items-center transition-colors print:!text-foreground',
    variant === 'chip' ? 'text-muted-foreground no-underline' : '[color:inherit]',
  );
  // A plain address that opens a profile says so at rest: a faint hairline
  // underline (the rule colour) that turns solid on hover and focus, the
  // one entity-link look for records and ledgers. It must not also carry
  // `no-underline`, which wins over the utility in the cascade.
  const plainLinkClass = variant === 'plain' && 'link-entity';

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 whitespace-nowrap align-middle',
        variant === 'chip' && 'rounded-control bg-surface-sunken py-0.5 pl-2 pr-0.5 text-xs',
        variant === 'chip' && !showCopy && 'pr-2',
        className,
      )}
    >
      {linkTarget ? (
        <Link
          href={linkTarget}
          title={title}
          className={cn(
            textClass,
            plainLinkClass,
            'hover:text-primary focus-visible:text-primary max-sm:min-h-6',
          )}
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
            'inline-flex size-6 shrink-0 items-center justify-center rounded-control text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground',
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

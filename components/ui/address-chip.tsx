'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface AddressChipProps {
  address: string;
  href?: string;
  truncateLength?: number;
  className?: string;
  showCopy?: boolean;
}

export function AddressChip({
  address,
  href,
  truncateLength = 6,
  className,
  showCopy = true,
}: AddressChipProps) {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const display = shortenHex(address, truncateLength);
  const resolvedHref = href ?? `/user/${address}`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 font-mono text-xs',
        className,
      )}
    >
      <Link
        href={resolvedHref}
        className="text-muted-foreground transition-colors no-underline print:!text-foreground hover:text-primary"
      >
        {display}
      </Link>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          aria-label={copied ? t('actions.copied') : t('actions.copyAddress')}
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </button>
      )}
    </span>
  );
}

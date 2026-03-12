'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check } from 'lucide-react';

import { shortenHex } from '@/utils';

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
        className="text-muted-foreground hover:text-primary transition-colors no-underline"
      >
        {display}
      </Link>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          aria-label="Copy address"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </button>
      )}
    </span>
  );
}

'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface ContractAddressCardProps {
  name: string;
  address: string;
  description: string;
  explorerUrl: string;
  className?: string;
}

export function ContractAddressCard({
  name,
  address,
  description,
  explorerUrl,
  className,
}: ContractAddressCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerHref = `${explorerUrl}/address/${address}`;

  return (
    <div
      className={cn(
        'group rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium text-foreground">{name}</h3>
          <InfoTooltip content={description} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-white/[0.06] hover:text-muted-foreground"
            aria-label={`Copy ${name} address`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
          <a
            href={explorerHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-white/[0.06] hover:text-muted-foreground"
            aria-label={`View ${name} on block explorer`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <p className="mt-2 break-all font-mono text-xs text-muted-foreground leading-relaxed">
        {address}
      </p>
    </div>
  );
}

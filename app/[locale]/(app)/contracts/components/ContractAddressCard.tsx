'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_ICON_CLASS } from '@/lib/touch-target';
import { useClipboard } from '@/hooks/useClipboard';
import { GeckoTerminalPoolButton } from '@/components/common/GeckoTerminalPoolButton';
import { NftMarketplaceButton } from '@/components/common/NftMarketplaceButton';
import { UniswapTradeButton } from '@/components/common/UniswapTradeButton';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface ContractAddressCardProps {
  name: string;
  address: string;
  description: string;
  explorerUrl: string;
  showTradeAction?: boolean;
  showPoolAction?: boolean;
  showMarketplaceAction?: boolean;
  className?: string;
}

export function ContractAddressCard({
  name,
  address,
  description,
  explorerUrl,
  showTradeAction = false,
  showPoolAction = false,
  showMarketplaceAction = false,
  className,
}: ContractAddressCardProps) {
  const t = useTranslations('contracts');
  const [copied, setCopied] = useState(false);
  const { copy } = useClipboard();

  const handleCopy = async () => {
    await copy(address);
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
            className={cn(
              'rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-white/[0.06] hover:text-muted-foreground',
              TOUCH_TARGET_ICON_CLASS,
            )}
            aria-label={t('addressCard.copyAria', { name })}
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
            className={cn(
              'rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-white/[0.06] hover:text-muted-foreground',
              TOUCH_TARGET_ICON_CLASS,
            )}
            aria-label={t('addressCard.explorerAria', { name })}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <p className="mt-2 break-all font-mono text-xs text-muted-foreground leading-relaxed">
        {address}
      </p>
      {showTradeAction || showPoolAction || showMarketplaceAction ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {showTradeAction ? <UniswapTradeButton variant="card" /> : null}
          {showPoolAction ? <GeckoTerminalPoolButton /> : null}
          {showMarketplaceAction ? <NftMarketplaceButton variant="card" /> : null}
        </div>
      ) : null}
    </div>
  );
}

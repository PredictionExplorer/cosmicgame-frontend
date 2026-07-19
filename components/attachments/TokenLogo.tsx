import { useState } from 'react';
import Image from 'next/image';
import { Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface TokenLogoProps {
  logoURI?: string;
  symbol?: string;
  name?: string;
  className?: string;
}

function getInitials(symbol?: string) {
  const clean = symbol?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5);
  return clean || 'ERC20';
}

function TokenFallback({ symbol }: { symbol?: string }) {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[rgb(var(--impact-green-rgb)/0.24)] bg-[radial-gradient(circle,rgb(var(--impact-green-rgb)/0.24),rgb(var(--aurora-cyan-rgb)/0.10)_56%,transparent)] shadow-[0_0_55px_-24px_rgb(var(--impact-green-rgb)/0.9)]">
      <Coins className="h-12 w-12 text-[rgb(var(--impact-green-rgb))]" />
      <span className="absolute -bottom-2 rounded-full border border-white/[0.08] bg-background/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
        {getInitials(symbol)}
      </span>
    </div>
  );
}

export function TokenLogo({ logoURI, symbol, name, className }: TokenLogoProps) {
  const t = useTranslations('currentCycle');
  const [failed, setFailed] = useState(false);
  const resolvedLogoURI = logoURI && !failed ? logoURI : null;
  const label = t('showcase.erc20Card.logoAlt', { token: symbol || name || 'ERC20' });

  return (
    <div
      className={cn(
        'flex min-h-[168px] items-center justify-center rounded-xl border border-white/[0.08] bg-black/25 p-5',
        className,
      )}
    >
      {resolvedLogoURI ? (
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/[0.12] bg-white shadow-[0_0_55px_-24px_rgb(var(--impact-green-rgb)/0.9)]">
          <Image
            src={resolvedLogoURI}
            alt={label}
            width={112}
            height={112}
            loading="lazy"
            unoptimized
            className="h-full w-full object-contain p-2"
            onError={() => setFailed(true)}
          />
        </div>
      ) : (
        <TokenFallback symbol={symbol} />
      )}
    </div>
  );
}

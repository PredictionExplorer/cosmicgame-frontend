'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface TokenLogoProps {
  logoURI?: string;
  symbol?: string;
  name?: string;
  /** The frame the logo sits in (size, shape, ground). */
  className?: string;
}

function getInitials(symbol?: string) {
  const clean = symbol?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5);
  return clean || 'ERC20';
}

/**
 * An ERC-20's logo, centred in the frame the caller gives it. Token logos are
 * drawn for a light ground, so the logo sits on a white disc; without one (or
 * when it fails to load) a hairline disc shows a coin and the symbol.
 */
export function TokenLogo({ logoURI, symbol, name, className }: TokenLogoProps) {
  const t = useTranslations('currentCycle');
  const [failed, setFailed] = useState(false);
  const resolvedLogoURI = logoURI && !failed ? logoURI : null;
  const label = t('showcase.erc20Card.logoAlt', { token: symbol || name || 'ERC20' });

  return (
    <div className={cn('flex flex-col items-center justify-center p-5', className)}>
      {resolvedLogoURI ? (
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-rule-faint">
          <Image
            src={resolvedLogoURI}
            alt={label}
            width={96}
            height={96}
            loading="lazy"
            unoptimized
            className="size-full object-contain p-2"
            onError={() => setFailed(true)}
          />
        </div>
      ) : (
        <>
          <div className="flex size-24 items-center justify-center rounded-full border border-rule bg-surface">
            <Coins aria-hidden className="size-10 text-subtle" />
          </div>
          <span className="mt-3 type-label text-muted-foreground">{getInitials(symbol)}</span>
        </>
      )}
    </div>
  );
}

'use client';

import type { AnchorHTMLAttributes } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CST_GECKOTERMINAL_POOL_URL } from '@/config/geckoterminal';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type GeckoTerminalPoolButtonProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children' | 'href' | 'rel' | 'target'
>;

export function GeckoTerminalPoolButton({
  className,
  'aria-label': ariaLabel,
  ...props
}: GeckoTerminalPoolButtonProps) {
  const t = useTranslations('nav');

  return (
    <Button
      asChild
      size="sm"
      variant="secondary"
      className={cn(
        'h-8 rounded-md border-[#7556F6]/35 bg-[#7556F6]/[0.06] px-2.5 text-xs text-[#CBBDFF] hover:border-[#7556F6]/55 hover:bg-[#7556F6]/[0.12]',
        className,
      )}
    >
      <a
        href={CST_GECKOTERMINAL_POOL_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel ?? t('ecosystem.geckoTerminal.ariaLabel')}
        {...props}
      >
        <Image
          src="/images/brands/geckoterminal-symbol.svg"
          width={16}
          height={16}
          alt=""
          aria-hidden
        />
        {t('ecosystem.geckoTerminal.shortLabel')}
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </a>
    </Button>
  );
}

'use client';

import type { AnchorHTMLAttributes } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type UniswapTradeButtonVariant = 'default' | 'secondary' | 'compact' | 'menu' | 'card';

interface UniswapTradeButtonProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children' | 'href' | 'rel' | 'target'
> {
  variant?: UniswapTradeButtonVariant;
  label?: string;
}

const LABEL_KEYS: Record<UniswapTradeButtonVariant, string> = {
  default: 'ecosystem.uniswap.defaultLabel',
  secondary: 'ecosystem.uniswap.defaultLabel',
  compact: 'ecosystem.uniswap.shortLabel',
  menu: 'ecosystem.uniswap.defaultLabel',
  card: 'ecosystem.uniswap.shortLabel',
};

const buttonClasses: Record<Exclude<UniswapTradeButtonVariant, 'menu'>, string> = {
  default: 'h-11 px-5',
  secondary: 'h-11 px-5 border-primary/35 bg-primary/[0.06]',
  compact: 'h-9 rounded-full px-3.5 text-xs',
  card: 'h-8 rounded-md px-2.5 text-xs',
};

export function UniswapTradeButton({
  variant = 'default',
  label,
  className,
  'aria-label': ariaLabel,
  ...props
}: UniswapTradeButtonProps) {
  const t = useTranslations('nav');
  const text = label ?? t(LABEL_KEYS[variant]);
  const resolvedAriaLabel = ariaLabel ?? t('ecosystem.uniswap.ariaLabel');

  if (variant === 'menu') {
    return (
      <a
        href={CST_UNISWAP_SWAP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={resolvedAriaLabel}
        className={cn(
          'flex w-full items-center gap-2.5 px-2 py-1.5 text-sm text-white no-underline transition-colors hover:text-primary',
          className,
        )}
        {...props}
      >
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        {text}
      </a>
    );
  }

  const buttonVariant = variant === 'default' ? 'default' : 'secondary';

  return (
    <Button
      asChild
      size={variant === 'card' || variant === 'compact' ? 'sm' : 'lg'}
      variant={buttonVariant}
      className={cn(buttonClasses[variant], className)}
    >
      <a
        href={CST_UNISWAP_SWAP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={resolvedAriaLabel}
        {...props}
      >
        {text}
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </a>
    </Button>
  );
}

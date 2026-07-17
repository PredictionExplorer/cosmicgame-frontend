'use client';

import type { AnchorHTMLAttributes } from 'react';
import { Store } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type NftMarketplaceButtonVariant = 'default' | 'secondary' | 'compact' | 'menu' | 'card';

interface NftMarketplaceButtonProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children' | 'href' | 'rel' | 'target'
> {
  variant?: NftMarketplaceButtonVariant;
  label?: string;
}

const LABEL_KEYS: Record<NftMarketplaceButtonVariant, string> = {
  default: 'ecosystem.axiomZero.defaultLabel',
  secondary: 'ecosystem.axiomZero.defaultLabel',
  compact: 'ecosystem.axiomZero.shortLabel',
  menu: 'ecosystem.axiomZero.menuLabel',
  card: 'ecosystem.axiomZero.shortLabel',
};

const buttonClasses: Record<Exclude<NftMarketplaceButtonVariant, 'menu'>, string> = {
  default: 'h-11 px-5',
  secondary: 'h-11 px-5 border-primary/35 bg-primary/[0.06]',
  compact: 'h-9 rounded-full px-3.5 text-xs',
  card: 'h-8 rounded-md px-2.5 text-xs',
};

export function NftMarketplaceButton({
  variant = 'default',
  label,
  className,
  'aria-label': ariaLabel,
  ...props
}: NftMarketplaceButtonProps) {
  const t = useTranslations('nav');
  const text = label ?? t(LABEL_KEYS[variant]);
  const resolvedAriaLabel = ariaLabel ?? t('ecosystem.axiomZero.ariaLabel');

  if (variant === 'menu') {
    return (
      <a
        href={COSMIC_SIGNATURE_MARKETPLACE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={resolvedAriaLabel}
        className={cn(
          'flex w-full items-center gap-2.5 px-2 py-1.5 text-sm text-white no-underline transition-colors hover:text-primary',
          className,
        )}
        {...props}
      >
        <Store className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
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
        href={COSMIC_SIGNATURE_MARKETPLACE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={resolvedAriaLabel}
        {...props}
      >
        {text}
        <Store className="h-4 w-4" aria-hidden />
      </a>
    </Button>
  );
}

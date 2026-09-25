'use client';

import type { AnchorHTMLAttributes } from 'react';
import { ArrowUpRight, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * `action`: the Signature page's action row, the outline button beside Share
 * (44px on a phone, 36px from `sm`), with the page-header label.
 */
type NftMarketplaceButtonVariant = 'default' | 'secondary' | 'compact' | 'menu' | 'card' | 'action';

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
  action: 'ecosystem.axiomZero.defaultLabel',
};

const buttonClasses: Record<Exclude<NftMarketplaceButtonVariant, 'menu'>, string> = {
  default: 'h-11 px-5',
  secondary: 'h-11 px-5 border-primary/35 bg-primary/[0.06]',
  compact: 'h-9 rounded-full px-3.5 text-xs',
  card: 'h-8 rounded-md px-2.5 text-xs',
  action: 'px-3 font-medium',
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

  const buttonVariant =
    variant === 'default' ? 'default' : variant === 'action' ? 'outline' : 'secondary';

  return (
    <Button
      asChild
      size={variant === 'card' || variant === 'compact' || variant === 'action' ? 'sm' : 'lg'}
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
        {/* The site's mark for a link that leaves it (it opens a new tab). */}
        <ArrowUpRight className="size-4 text-subtle" aria-hidden />
      </a>
    </Button>
  );
}

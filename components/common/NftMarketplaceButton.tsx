'use client';

import { useTranslations } from 'next-intl';

import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { Button } from '@/components/ui/button';
import { SiteLink } from '@/components/layout/SiteLink';

export interface NftMarketplaceButtonProps {
  /** `sm` beside the other quiet actions of a row (the detail page's Share). */
  size?: 'default' | 'sm';
  /** Placement only (margins, alignment); the look is fixed. */
  className?: string;
}

/**
 * The one way out to the collection's third-party marketplace, the same on
 * every page: an outline button ("Buy or sell on Axiom Zero") with the
 * external-link arrow, opening a new tab that screen readers hear about.
 * Its accessible name starts with the words it shows (WCAG 2.5.3). It is a
 * navigation call to action, never `commit`, which is for transactions.
 */
export function NftMarketplaceButton({ size = 'default', className }: NftMarketplaceButtonProps) {
  const t = useTranslations('nav');
  return (
    <Button asChild variant="outline" size={size} className={className}>
      <SiteLink href={COSMIC_SIGNATURE_MARKETPLACE_URL} kind="external" className="no-underline">
        {t('ecosystem.axiomZero.label')}
      </SiteLink>
    </Button>
  );
}

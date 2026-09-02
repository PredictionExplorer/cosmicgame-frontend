'use client';

import * as React from 'react';

import type { CategoricalTraitKey } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { AttributePill, type AttributePillProps } from '@/components/nft/AttributePills';

import { useTraitLabels } from './useTraitLabels';

/** Props for {@link TraitPill}. */
export interface TraitPillProps extends Omit<AttributePillProps, 'label' | 'value'> {
  traitKey: CategoricalTraitKey;
  /** Wire value; localized through the trait catalog. */
  value: string;
  /** Prefix the pill with the trait type label. */
  withType?: boolean;
  /** Small "n/N" frequency suffix (how many tokens share the value). */
  share?: { count: number; total: number };
}

/**
 * TraitPill — a localized categorical trait as a chip (optionally with the
 * trait type and the collection share), for cards, quick view, and facets.
 */
export const TraitPill = React.forwardRef<HTMLSpanElement, TraitPillProps>(
  ({ traitKey, value, withType = false, share, className, ...props }, ref) => {
    const { typeLabel, valueLabel } = useTraitLabels();
    return (
      <AttributePill
        ref={ref}
        label={withType ? typeLabel(traitKey) : undefined}
        value={
          share ? (
            <>
              {valueLabel(traitKey, value)}
              <span aria-hidden className="ml-1 text-muted-foreground/60">
                {share.count}/{share.total}
              </span>
            </>
          ) : (
            valueLabel(traitKey, value)
          )
        }
        className={cn('max-w-full', className)}
        {...props}
      />
    );
  },
);
TraitPill.displayName = 'TraitPill';

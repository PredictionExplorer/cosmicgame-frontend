'use client';

import { Sparkles } from 'lucide-react';

import {
  AnchoringIcon,
  ChronoWarriorIcon,
  EnduranceChampionIcon,
  FinalCstGestureIcon,
  SignatureAllocationIcon,
  StellarSelectionIcon,
} from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { camelTraitKey, useTraitLabels } from './useTraitLabels';

/** Props for {@link AllocationLabel}. */
export interface AllocationLabelProps {
  /** Wire allocation value (`"Stellar Selection"`, ...); renders nothing when absent. */
  value?: string;
  /** `sm` sets caption type; `md` takes the surrounding text size. */
  size?: 'sm' | 'md';
  /** Hide the icon (dense list rows). */
  iconless?: boolean;
  className?: string;
}

/** Each allocation's concept glyph (lib/conceptIcons). */
const ALLOCATION_ICONS: Record<string, typeof Sparkles> = {
  stellarSelection: StellarSelectionIcon,
  anchoredSelection: AnchoringIcon,
  finalGesture: SignatureAllocationIcon,
  lastCstGesture: FinalCstGestureIcon,
  enduranceChampion: EnduranceChampionIcon,
  chronoWarrior: ChronoWarriorIcon,
};

/**
 * AllocationLabel — which allocation delivered the NFT to its first
 * recipient, as a value: the allocation's concept glyph and its localized
 * name, with the trait's meaning in a tooltip.
 */
export function AllocationLabel({ value, size = 'md', iconless, className }: AllocationLabelProps) {
  const { valueLabel, typeHint } = useTraitLabels();
  if (!value) return null;
  const Icon = ALLOCATION_ICONS[camelTraitKey(value)] ?? Sparkles;
  const label = valueLabel('allocation', value);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex cursor-help items-center gap-1.5',
            size === 'sm' && 'type-caption',
            className,
          )}
          data-testid="allocation-label"
        >
          {iconless ? null : <Icon aria-hidden className="size-3.5 shrink-0 text-subtle" />}
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">{typeHint('allocation')}</p>
      </TooltipContent>
    </Tooltip>
  );
}

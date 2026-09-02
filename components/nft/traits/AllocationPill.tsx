'use client';

import { Anchor, Feather, Flag, Hourglass, Sparkles, Timer } from 'lucide-react';

import { cn } from '@/lib/utils';
import { AttributePill, type PillTone } from '@/components/nft/AttributePills';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { camelTraitKey, useTraitLabels } from './useTraitLabels';

/** Props for {@link AllocationPill}. */
export interface AllocationPillProps {
  /** Wire allocation value (`"Stellar Selection"`, ...); renders nothing when absent. */
  value?: string;
  size?: 'sm' | 'md';
  /** Hide the icon (dense list rows). */
  iconless?: boolean;
  className?: string;
}

const allocationStyles: Record<string, { tone: PillTone; Icon: typeof Sparkles }> = {
  stellarSelection: { tone: 'aurora', Icon: Sparkles },
  anchoredSelection: { tone: 'nebula', Icon: Anchor },
  finalGesture: { tone: 'solar', Icon: Flag },
  lastCstGesture: { tone: 'neutral', Icon: Feather },
  enduranceChampion: { tone: 'impact', Icon: Hourglass },
  chronoWarrior: { tone: 'rose', Icon: Timer },
};

/**
 * AllocationPill — which allocation delivered the NFT to its first recipient,
 * colour-coded per role and localized through the trait catalog.
 */
export function AllocationPill({ value, size = 'sm', iconless, className }: AllocationPillProps) {
  const { valueLabel, typeHint } = useTraitLabels();
  if (!value) return null;
  const allocation = allocationStyles[camelTraitKey(value)] ?? {
    tone: 'neutral',
    Icon: Sparkles,
  };
  const label = valueLabel('allocation', value);
  const iconClass = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <AttributePill
          tone={allocation.tone}
          size={size}
          value={label}
          icon={iconless ? undefined : <allocation.Icon className={iconClass} />}
          className={cn('cursor-help whitespace-nowrap', className)}
          data-testid="allocation-pill"
        />
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">{typeHint('allocation')}</p>
      </TooltipContent>
    </Tooltip>
  );
}

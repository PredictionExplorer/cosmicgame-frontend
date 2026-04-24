'use client';

import { Layers, Lock, Tag } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type FilterKey = 'all' | 'staked' | 'named';

interface GalleryFilterChipsProps {
  value: FilterKey;
  onChange: (filter: FilterKey) => void;
}

const filters: { key: FilterKey; label: string; icon: typeof Layers; tooltip: string }[] = [
  { key: 'all', label: 'All', icon: Layers, tooltip: 'Show all NFTs in the collection' },
  {
    key: 'staked',
    label: 'Anchored',
    icon: Lock,
    tooltip: 'NFTs currently anchored and receiving Anchor Distributions',
  },
  { key: 'named', label: 'Named', icon: Tag, tooltip: 'NFTs given a custom name by their owner' },
];

export function GalleryFilterChips({ value, onChange }: GalleryFilterChipsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Filter NFTs">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = value === f.key;
          return (
            <Tooltip key={f.key}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => onChange(f.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-[#06AEEC]/20 to-[#9C37FD]/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(21,191,253,0.1)]'
                      : 'bg-white/[0.03] text-muted-foreground border border-white/[0.06] hover:bg-white/[0.06] hover:text-foreground',
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {f.label}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{f.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

'use client';

import { LayoutGrid, List } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type ViewMode = 'grid' | 'list';

interface GalleryViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const modes: { value: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { value: 'grid', icon: LayoutGrid, label: 'Grid view' },
  { value: 'list', icon: List, label: 'List view' },
];

export function GalleryViewToggle({ value, onChange }: GalleryViewToggleProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="flex items-center rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5"
        role="radiogroup"
        aria-label="View mode"
      >
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = value === mode.value;
          return (
            <Tooltip key={mode.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={mode.label}
                  onClick={() => onChange(mode.value)}
                  className={cn(
                    'rounded-md p-1.5 transition-all duration-200',
                    isActive
                      ? 'bg-primary/20 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{mode.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

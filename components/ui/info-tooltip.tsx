'use client';

import { Info } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InfoTooltipProps {
  content: string;
  className?: string;
  iconClassName?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  maxWidth?: number;
  ariaLabel?: string;
}

export function InfoTooltip({
  content,
  className,
  iconClassName,
  side = 'top',
  maxWidth = 240,
  ariaLabel = 'Show more information',
}: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={ariaLabel}
            className={cn(
              'inline-flex cursor-help appearance-none items-center border-0 bg-transparent p-0 align-middle text-muted-foreground/50 transition-colors hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              className,
            )}
          >
            <Info className={cn('h-3.5 w-3.5 text-current', iconClassName)} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p className="text-xs leading-relaxed" style={{ maxWidth }}>
            {content}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

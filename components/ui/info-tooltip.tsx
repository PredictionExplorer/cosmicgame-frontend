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
}

export function InfoTooltip({
  content,
  className,
  iconClassName,
  side = 'top',
  maxWidth = 240,
}: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('inline-flex cursor-help align-middle', className)}>
            <Info
              className={cn(
                'h-3.5 w-3.5 text-muted-foreground/50 hover:text-primary/70 transition-colors',
                iconClassName,
              )}
            />
          </span>
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

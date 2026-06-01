'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  description?: string;
  tooltip?: string;
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  className,
  icon,
  description,
  tooltip,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.06] border-l-2 border-l-primary/40 bg-white/[0.02]',
        className,
      )}
    >
      <div className="flex items-start gap-2 px-4 py-4 transition-colors hover:bg-white/[0.04] sm:px-5">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="flex min-w-0 items-start gap-2.5">
            {icon && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </h4>
              {description ? (
                <p className="mt-1 max-w-3xl text-xs normal-case leading-relaxed tracking-normal text-muted-foreground/80">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-primary/60 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
        {tooltip ? (
          <InfoTooltip content={tooltip} label={title} className="mt-0.5 shrink-0" />
        ) : null}
      </div>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/[0.06] px-3 py-3 sm:px-5 sm:py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

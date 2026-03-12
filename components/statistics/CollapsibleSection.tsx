'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  className,
  icon,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.06] border-l-2 border-l-primary/40 bg-white/[0.02]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.04]"
      >
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h4>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-primary/60 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/[0.06] px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';

export interface FaqBotSourcesProps {
  sources: string[];
  className?: string;
}

export function FaqBotSources({ sources, className }: FaqBotSourcesProps) {
  if (!sources.length) return null;

  const uniqueSources = sources.filter((source, index) => sources.indexOf(source) === index);

  return (
    <details className={cn('group/sources mt-2 text-xs text-muted-foreground', className)}>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-primary [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className="inline-block transition-transform duration-150 group-open/sources:rotate-90"
        >
          ▸
        </span>
        Sources ({uniqueSources.length})
      </summary>
      <ul className="mt-1.5 space-y-0.5 pl-4">
        {uniqueSources.map((source, index) => (
          <li key={`${index}-${source}`} className="break-words leading-snug">
            {source}
          </li>
        ))}
      </ul>
    </details>
  );
}

import { cn } from '@/lib/utils';

interface SectionDividerProps {
  title?: string;
  className?: string;
}

export function SectionDivider({ title, className }: SectionDividerProps) {
  if (title) {
    return (
      <div className={cn('flex items-center gap-4 py-2', className)}>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgb(var(--aurora-cyan-rgb)/0.45)] to-transparent" />
        {/* A long divider title has to wrap on a phone; `nowrap` pushed it
            straight through the rules on either side. */}
        <h3 className="min-w-0 break-words rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground backdrop-blur sm:whitespace-nowrap">
          {title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgb(var(--nebula-violet-rgb)/0.45)] to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-px bg-gradient-to-r from-transparent via-[rgb(var(--aurora-cyan-rgb)/0.28)] to-[rgb(var(--nebula-violet-rgb)/0.18)]',
        className,
      )}
    />
  );
}

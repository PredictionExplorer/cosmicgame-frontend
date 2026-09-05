import { cn } from '@/lib/utils';

interface SectionDividerProps {
  title?: string;
  className?: string;
}

export function SectionDivider({ title, className }: SectionDividerProps) {
  if (title) {
    return (
      <div className={cn('flex items-center gap-4 py-2', className)}>
        <div className="h-px flex-1 bg-white/10" />
        {/* A long divider title has to wrap on a phone; `nowrap` pushed it
            straight through the rules on either side. */}
        <h3 className="min-w-0 break-words px-2 py-1 text-center type-eyebrow text-muted-foreground">
          {title}
        </h3>
        <div className="h-px flex-1 bg-white/10" />
      </div>
    );
  }

  return <div className={cn('h-px bg-white/10', className)} />;
}

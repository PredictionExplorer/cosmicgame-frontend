import { cn } from '@/lib/utils';

interface SectionDividerProps {
  title?: string;
  className?: string;
}

export function SectionDivider({ title, className }: SectionDividerProps) {
  if (title) {
    return (
      <div className={cn('flex items-center gap-4 py-4 my-10', className)}>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground/70 whitespace-nowrap">
          {title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-px my-8 bg-gradient-to-r from-transparent via-primary/20 to-transparent',
        className,
      )}
    />
  );
}

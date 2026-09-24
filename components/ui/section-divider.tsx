import { cn } from '@/lib/utils';

interface SectionDividerProps {
  title?: string;
  /** The title's element; `h3` by default. Use `p` when the divider is not a heading. */
  as?: 'h2' | 'h3' | 'h4' | 'p';
  className?: string;
}

/**
 * SectionDivider — a hairline between groups on one page, optionally with a
 * centred kicker. It separates; it is not the section-heading tier (use
 * `SectionHeader` for a titled section).
 */
export function SectionDivider({ title, as: Title = 'h3', className }: SectionDividerProps) {
  if (title) {
    return (
      <div className={cn('flex items-center gap-4 py-2', className)}>
        <div aria-hidden className="h-px flex-1 bg-rule-faint" />
        {/* A long divider title has to wrap on a phone; `nowrap` pushed it
            straight through the rules on either side. */}
        <Title className="min-w-0 break-words px-2 py-1 text-center type-eyebrow text-subtle">
          {title}
        </Title>
        <div aria-hidden className="h-px flex-1 bg-rule-faint" />
      </div>
    );
  }

  return <div role="separator" className={cn('h-px bg-rule-faint', className)} />;
}

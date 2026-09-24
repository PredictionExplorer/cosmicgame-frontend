import { ArrowRight } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface QuizPromptProps {
  heading: string;
  body: string;
  linkLabel: string;
  href: string;
  headingId: string;
  className?: string;
}

/**
 * The invitation to test what was just read: a hairline band with the
 * question, one sentence and the way into the quiz.
 */
export function QuizPrompt({
  heading,
  body,
  linkLabel,
  href,
  headingId,
  className,
}: QuizPromptProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'flex flex-col gap-6 border-y border-rule py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 id={headingId} className="type-heading-2 text-foreground">
          {heading}
        </h2>
        <p className="mt-2 max-w-[var(--measure-lede)] type-body-md text-muted-foreground">
          {body}
        </p>
      </div>
      <Link
        href={href}
        className={cn(buttonVariants({ variant: 'outline', size: 'xl' }), 'shrink-0 max-sm:w-full')}
      >
        {linkLabel}
        <ArrowRight aria-hidden />
      </Link>
    </section>
  );
}

'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  stateIconVariants,
  stateLayoutVariants,
  type StateVariant,
} from '@/components/ui/empty-state';
import { Surface } from '@/components/ui/surface';

type Tone = 'destructive' | 'warning' | 'neutral';

interface ErrorStateProps {
  title?: string;
  message?: ReactNode;
  /**
   * Heading level for the title. Defaults to 4; pass 3 when the state sits
   * directly under a page `h2`, or 2 when it replaces a page's content under
   * its `h1`, so the document keeps a valid heading order.
   */
  headingLevel?: 2 | 3 | 4;
  /** Lucide icon override. Defaults to AlertTriangle. */
  icon?: ReactNode;
  tone?: Tone;
  /** The space the state stands in for (see EmptyState). Defaults to `panel`. */
  variant?: StateVariant;
  /** If provided, renders a "Try again" button. */
  onRetry?: () => void;
  retryLabel?: string;
  /** A second way on beside the retry, such as a link to a hub page. */
  action?: ReactNode;
  /** Wrap the state in a Surface for inline/contained contexts. */
  surface?: boolean;
  className?: string;
}

/** Status colour sits on the icon only; the words carry the state. */
const TONE: Record<Tone, string> = {
  destructive: 'border-transparent bg-critical-surface text-critical',
  warning: 'border-transparent bg-attention-surface text-attention',
  neutral: '',
};

/** Inline states wrap their text beside the icon; centred states keep it flat. */
function StateText({ inline, children }: { inline: boolean; children: ReactNode }) {
  return inline ? <div className="min-w-0">{children}</div> : <>{children}</>;
}

/**
 * ErrorState — something could not be read or done. Say what failed in the
 * reader's words and offer the retry; the technical detail belongs in the
 * toast's "Copy details", not here.
 */
export function ErrorState({
  title,
  message,
  headingLevel = 4,
  icon,
  tone = 'destructive',
  variant = 'panel',
  onRetry,
  retryLabel,
  action,
  surface = false,
  className,
}: ErrorStateProps) {
  const t = useTranslations('errors');
  const Heading = `h${headingLevel}` as const;
  const isInline = variant === 'inline';
  const body = (
    <div className={cn(stateLayoutVariants({ variant }), className)}>
      <div aria-hidden className={cn(stateIconVariants({ variant }), TONE[tone])}>
        {icon ?? <AlertTriangle />}
      </div>
      <StateText inline={isInline}>
        <Heading
          className={cn(
            'text-foreground',
            variant === 'page' ? 'type-heading-3' : 'type-title',
            isInline && 'type-body-sm font-medium',
          )}
        >
          {title ?? t('state.title')}
        </Heading>
        {message ? (
          <div
            className={cn(
              'type-body-sm text-muted-foreground',
              isInline ? 'mt-0.5' : 'mt-2 max-w-md text-pretty',
            )}
          >
            {message}
          </div>
        ) : null}
        {onRetry || action ? (
          <div
            className={cn(
              'flex flex-wrap items-center gap-3',
              isInline ? 'mt-3' : 'mt-6 justify-center',
            )}
          >
            {onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw aria-hidden />
                {retryLabel ?? t('state.retry')}
              </Button>
            ) : null}
            {action}
          </div>
        ) : null}
      </StateText>
    </div>
  );
  if (!surface) return body;
  return (
    <Surface variant="outlined" padding="none">
      {body}
    </Surface>
  );
}

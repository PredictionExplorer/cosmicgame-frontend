'use client';

import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { reportError } from '@/utils/errors';

interface RouteErrorProps {
  error: Error & { digest?: string };
  /**
   * The boundary's `retry` (Next.js 16.3): re-fetches the segment's server
   * data and re-renders it, so a failed server read can recover. `reset`
   * would only re-render what already failed.
   */
  retry: () => void;
  /** Sentry tag identifying which route segment threw. */
  context: string;
  title: string;
  message: string;
  /**
   * The way on besides retrying: the host's home, labelled for it. Defaults
   * to the Observatory, the app host's home.
   */
  home?: { href: string; label: string };
}

/**
 * Shared body for App Router `error.tsx` boundaries: report the error once,
 * then offer to retry the segment (re-fetching it) and a way on to the
 * host's home, so a reader is never left on a dead end. Segment boundaries
 * supply their own copy and Sentry context so a failure is attributable to a
 * route without every segment re-implementing the reporting effect.
 */
export function RouteError({ error, retry, context, title, message, home }: RouteErrorProps) {
  const t = useTranslations('errors');
  useEffect(() => {
    reportError(error, context);
  }, [error, context]);

  const onward = home ?? { href: '/', label: t('notFound.primaryCta') };
  return (
    <ErrorState
      title={title}
      message={message}
      onRetry={retry}
      headingLevel={2}
      surface
      action={
        <Link
          href={onward.href}
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'no-underline' })}
        >
          {onward.label}
          <ArrowRight aria-hidden />
        </Link>
      }
    />
  );
}

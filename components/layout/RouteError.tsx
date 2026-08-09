'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/ui/error-state';
import { reportError } from '@/utils/errors';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Sentry tag identifying which route segment threw. */
  context: string;
  title: string;
  message: string;
}

/**
 * Shared body for App Router `error.tsx` boundaries: report the error once,
 * then show the retry surface. Segment boundaries supply their own copy and
 * Sentry context so a failure is attributable to a route without every
 * segment re-implementing the reporting effect.
 */
export function RouteError({ error, reset, context, title, message }: RouteErrorProps) {
  useEffect(() => {
    reportError(error, context);
  }, [error, context]);

  return <ErrorState title={title} message={message} onRetry={reset} surface />;
}

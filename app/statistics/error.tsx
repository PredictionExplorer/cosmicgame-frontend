'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/ui/error-state';
import { reportError } from '@/utils/errors';

/** Route-level error boundary for the statistics section pages. */
export default function StatisticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, 'statistics-route');
  }, [error]);

  return (
    <ErrorState
      title="Statistics failed to load"
      message="Something went wrong while rendering this statistics page. Try again, or come back in a moment."
      onRetry={reset}
      surface
    />
  );
}

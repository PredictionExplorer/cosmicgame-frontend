'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <h2 className="font-display text-3xl font-semibold text-primary">Something went wrong</h2>
      <p className="text-text-secondary">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="rounded-md border border-primary px-6 py-2 text-primary transition-colors hover:bg-primary/10"
      >
        Try Again
      </button>
    </div>
  );
}

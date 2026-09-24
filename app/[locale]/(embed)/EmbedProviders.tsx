'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import ErrorBoundary from '@/components/layout/ErrorBoundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { makeQueryClient } from '@/lib/queryClient';
import { installGlobalErrorHandlers } from '@/utils/globalErrorHandlers';

/**
 * The client shell of an embed: an API client, tooltips and error
 * reporting, and nothing else. An embed opens in a window of its own or in a
 * third-party iframe, reads public data and never connects a wallet, so the
 * dApp's providers (wagmi, the wallet UI, chain-event polling, protocol
 * contexts, header and footer) stay out of its bundle.
 */
export function EmbedProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200} skipDelayDuration={300}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

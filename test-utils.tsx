import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { axe } from 'jest-axe';

import { TooltipProvider } from '@/components/ui/tooltip';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  return <TooltipProvider delayDuration={0}>{children}</TooltipProvider>;
}

function QueryWrapper({ children }: { children: ReactNode }) {
  const client = createTestQueryClient();
  return (
    <TooltipProvider delayDuration={0}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </TooltipProvider>
  );
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });

const renderWithQuery = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: QueryWrapper, ...options });

export async function checkA11y(container: HTMLElement, axeOptions?: Parameters<typeof axe>[1]) {
  const results = await axe(container, axeOptions);
  expect(results).toHaveNoViolations();
}

export * from '@testing-library/react';
export { customRender as render, renderWithQuery };

import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { render, checkA11y } from '@/test-utils';

import { SystemModeProvider, useSystemMode } from '../SystemModeContext';

function wrapper({ children }: { children: ReactNode }) {
  return <SystemModeProvider>{children}</SystemModeProvider>;
}

describe('SystemModeProvider', () => {
  it('renders children', () => {
    const { result } = renderHook(() => useSystemMode(), { wrapper });
    expect(result.current).toBeDefined();
  });

  it('always provides data 0 (systemMode removed from contracts)', () => {
    const { result } = renderHook(() => useSystemMode(), { wrapper });
    expect(result.current!.data).toBe(0);
  });

  it('provides fetchData (no-op for API compatibility)', async () => {
    const { result } = renderHook(() => useSystemMode(), { wrapper });
    await result.current!.fetchData();
    expect(result.current!.data).toBe(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SystemModeProvider>
        <div>Test</div>
      </SystemModeProvider>,
    );
    await checkA11y(container);
  });
});

describe('useSystemMode', () => {
  it('returns undefined outside of provider', () => {
    const { result } = renderHook(() => useSystemMode());
    expect(result.current).toBeUndefined();
  });
});

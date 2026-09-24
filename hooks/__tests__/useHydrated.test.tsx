import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { renderHook } from '@testing-library/react';

import { useHydrated } from '../useHydrated';

function Probe() {
  return <span>{useHydrated() ? 'client' : 'server'}</span>;
}

describe('useHydrated', () => {
  it('is true at once when rendered on the client', () => {
    const { result } = renderHook(() => useHydrated());
    expect(result.current).toBe(true);
  });

  it('renders the server markup during hydration, then the client’s, without a mismatch', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Probe />);
    expect(container.textContent).toBe('server');

    const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const recoverable = jest.fn();
    await act(async () => {
      hydrateRoot(container, <Probe />, { onRecoverableError: recoverable });
    });
    expect(container.textContent).toBe('client');
    expect(recoverable).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});

import { act, renderHook, waitFor } from '@testing-library/react';

import { useInkViewLink } from '../useInkViewLink';

// Next notifies useSearchParams after public history writes and after traversal.
// Keep the hook reactive to those events without importing the full app router.
jest.mock('next/navigation', () => ({
  useSearchParams: () => {
    const React = require('react');
    const search = React.useSyncExternalStore(
      (notify: () => void) => {
        window.addEventListener('next-test-navigation', notify);
        window.addEventListener('popstate', notify);
        return () => {
          window.removeEventListener('next-test-navigation', notify);
          window.removeEventListener('popstate', notify);
        };
      },
      () => window.location.search,
    );
    return new URLSearchParams(search);
  },
}));

const nativePush = window.history.pushState.bind(window.history);
const nativeReplace = window.history.replaceState.bind(window.history);
const routerState = { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: { tree: ['detail'] } };

// Mirror Next's documented native-history bridge, including its internal-call
// escape hatch: passing __NA or _N must fail to notify the hook under test.
function nextHistoryWrite(nativeWrite: typeof nativePush): typeof nativePush {
  return (state, unused, url) => {
    if (state?.__NA || state?._N) {
      nativeWrite(state, unused, url);
      return;
    }
    nativeWrite({ ...state, ...routerState }, unused, url);
    window.dispatchEvent(new Event('next-test-navigation'));
  };
}

describe('useInkViewLink', () => {
  beforeEach(() => {
    nativeReplace({ ...routerState, readerPreference: 'quiet' }, '', '/detail/48');
    jest.spyOn(window.history, 'pushState').mockImplementation(nextHistoryWrite(nativePush));
    jest.spyOn(window.history, 'replaceState').mockImplementation(nextHistoryWrite(nativeReplace));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(['image', 'short', 'medium', 'slow'] as const)('opens a direct %s link', (view) => {
    nativeReplace(routerState, '', `/detail/48?ink=${view}`);
    const { result } = renderHook(() => useInkViewLink(true));
    expect(result.current.view).toBe(view);
    expect(window.history.pushState).not.toHaveBeenCalled();
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });

  it.each(['?ink=', '?ink=Medium', '?ink=unknown', '?ink=image&ink=medium', '?ink=slow&ink=slow'])(
    'ignores malformed or ambiguous links: %s',
    (search) => {
      nativeReplace(routerState, '', `/detail/48${search}`);
      const { result } = renderHook(() => useInkViewLink(true));
      expect(result.current.view).toBeNull();
      expect(window.history.replaceState).not.toHaveBeenCalled();
    },
  );

  it('adds one history entry, then replaces it when switching views', () => {
    nativeReplace(
      { ...routerState, readerPreference: 'quiet' },
      '',
      '/zh-TW/detail/48?ref=art#traits',
    );
    const originalLength = window.history.length;
    const { result } = renderHook(() => useInkViewLink(true));
    act(() => result.current.open('medium'));
    expect(result.current.view).toBe('medium');
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      '/zh-TW/detail/48?ref=art&ink=medium#traits',
    );
    act(() => result.current.select('image'));
    act(() => result.current.select('slow'));
    expect(result.current.view).toBe('slow');
    expect(window.history.length).toBe(originalLength + 1);
    expect(window.history.pushState).toHaveBeenCalledTimes(1);
    expect(window.history.replaceState).toHaveBeenCalledTimes(2);
    expect(window.history.state).toEqual(
      expect.objectContaining({ ...routerState, readerPreference: 'quiet' }),
    );
  });

  it('does not add history or restart navigation when selecting the current view', () => {
    const { result } = renderHook(() => useInkViewLink(true));
    act(() => result.current.open('medium'));
    act(() => result.current.open('medium'));
    act(() => result.current.select('medium'));
    expect(window.history.pushState).toHaveBeenCalledTimes(1);
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });

  it('closes an owned entry with Back, and Forward restores its selected view', async () => {
    const back = jest.spyOn(window.history, 'back');
    const { result } = renderHook(() => useInkViewLink(true));
    act(() => result.current.open('medium'));
    act(() => result.current.select('image'));
    act(() => {
      result.current.close();
      result.current.close();
    });
    expect(back).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.view).toBeNull());
    expect(window.location.pathname).toBe('/detail/48');
    act(() => window.history.forward());
    await waitFor(() => expect(result.current.view).toBe('image'));
    act(() => result.current.close());
    await waitFor(() => expect(result.current.view).toBeNull());
    expect(back).toHaveBeenCalledTimes(2);
  });

  it('responds to browser Back and Forward without duplicating URL state', async () => {
    const { result } = renderHook(() => useInkViewLink(true));
    act(() => result.current.open('slow'));
    act(() => window.history.back());
    await waitFor(() => expect(result.current.view).toBeNull());
    act(() => window.history.forward());
    await waitFor(() => expect(result.current.view).toBe('slow'));
  });

  it('opens, switches, and closes when secure-context randomUUID is unavailable', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(window.crypto, 'randomUUID');
    Object.defineProperty(window.crypto, 'randomUUID', { configurable: true, value: undefined });
    try {
      const back = jest.spyOn(window.history, 'back');
      const { result } = renderHook(() => useInkViewLink(true));
      act(() => result.current.open('medium'));
      act(() => result.current.select('image'));
      expect(result.current.view).toBe('image');
      act(() => result.current.close());
      await waitFor(() => expect(result.current.view).toBeNull());
      expect(back).toHaveBeenCalledTimes(1);
    } finally {
      if (descriptor) Object.defineProperty(window.crypto, 'randomUUID', descriptor);
      else Reflect.deleteProperty(window.crypto, 'randomUUID');
    }
  });

  it('can close with Back when an existing parameter contains percent-encoded spaces', async () => {
    nativeReplace(routerState, '', '/detail/48?ref=ink%20art');
    const back = jest.spyOn(window.history, 'back');
    const { result } = renderHook(() => useInkViewLink(true));
    act(() => result.current.open('medium'));
    act(() => result.current.close());
    await waitFor(() => expect(result.current.view).toBeNull());
    expect(back).toHaveBeenCalledTimes(1);
    expect(window.location.search).toBe('?ref=ink%20art');
  });

  it('closes a freshly loaded link in place, preserving other parameters and its fragment', () => {
    nativeReplace(
      { ...routerState, readerPreference: 'quiet' },
      '',
      '/ko/detail/48?ink=short&ref=art#traits',
    );
    const back = jest.spyOn(window.history, 'back');
    const { result } = renderHook(() => useInkViewLink(true));
    act(() => result.current.select('slow'));
    act(() => result.current.close());
    expect(result.current.view).toBeNull();
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      '/ko/detail/48?ref=art#traits',
    );
    expect(back).not.toHaveBeenCalled();
    expect(window.history.pushState).not.toHaveBeenCalled();
    expect(window.history.state.readerPreference).toBe('quiet');
  });

  it('treats a reloaded owned link as a fresh link, so closing cannot leave the artwork', () => {
    const back = jest.spyOn(window.history, 'back');
    const first = renderHook(() => useInkViewLink(true));
    act(() => first.result.current.open('medium'));
    first.unmount();
    const reloaded = renderHook(() => useInkViewLink(true));
    act(() => reloaded.result.current.close());
    expect(reloaded.result.current.view).toBeNull();
    expect(window.location.pathname + window.location.search).toBe('/detail/48');
    expect(back).not.toHaveBeenCalled();
  });

  it('keeps unrelated URL changes made while the viewer was open', () => {
    const back = jest.spyOn(window.history, 'back');
    const { result } = renderHook(() => useInkViewLink(true));
    act(() => result.current.open('medium'));
    nativeReplace(window.history.state, '', '?ink=medium&ref=new#traits');
    act(() => result.current.close());
    expect(window.location.search + window.location.hash).toBe('?ref=new#traits');
    expect(back).not.toHaveBeenCalled();
  });

  it('normalizes duplicate values on explicit selection without adding history', () => {
    nativeReplace(routerState, '', '/detail/48?ink=image&ref=art&ink=medium');
    const { result } = renderHook(() => useInkViewLink(true));
    act(() => result.current.open('short'));
    expect(result.current.view).toBe('short');
    expect(window.location.search).toBe('?ink=short&ref=art');
    expect(window.history.pushState).not.toHaveBeenCalled();
  });

  it('leaves the location untouched when disabled, even if it contains an ink view', () => {
    nativeReplace(routerState, '', '/detail/48?ink=medium');
    const back = jest.spyOn(window.history, 'back');
    const { result } = renderHook(() => useInkViewLink(false));
    expect(result.current.view).toBeNull();
    act(() => {
      result.current.open('image');
      result.current.select('slow');
      result.current.close();
    });
    expect(window.history.pushState).not.toHaveBeenCalled();
    expect(window.history.replaceState).not.toHaveBeenCalled();
    expect(back).not.toHaveBeenCalled();
    expect(window.location.search).toBe('?ink=medium');
  });
});

import { render } from '@testing-library/react';

import { CanonicalAddress } from '../[round]/[start]/[end]/CanonicalAddress';

const mockUseLocale = jest.fn(() => 'en');
// The component reads only the locale (the global next-intl mock pins it to en).
jest.mock('next-intl', () => ({ useLocale: () => mockUseLocale() }));

describe('CanonicalAddress', () => {
  beforeEach(() => {
    mockUseLocale.mockReturnValue('en');
    window.history.replaceState(null, '', '/system-event/2/200/340?from=share#changes');
  });

  it('puts the window’s one URL in the address bar, keeping the query and the hash', () => {
    const replace = jest.spyOn(window.history, 'replaceState');
    render(<CanonicalAddress href="/system-event/2/200/350" />);
    expect(window.location.pathname).toBe('/system-event/2/200/350');
    expect(window.location.search).toBe('?from=share');
    expect(window.location.hash).toBe('#changes');
    expect(replace).toHaveBeenCalledTimes(1);
    replace.mockRestore();
  });

  it('keeps the locale’s prefix', () => {
    mockUseLocale.mockReturnValue('uk');
    window.history.replaceState(null, '', '/uk/system-event/2/200/340');
    render(<CanonicalAddress href="/system-event/2/200/350" />);
    expect(window.location.pathname).toBe('/uk/system-event/2/200/350');
  });

  it('leaves an address that is already the one URL alone', () => {
    window.history.replaceState(null, '', '/system-event/2/200/350');
    const replace = jest.spyOn(window.history, 'replaceState');
    render(<CanonicalAddress href="/system-event/2/200/350" />);
    expect(replace).not.toHaveBeenCalled();
    replace.mockRestore();
  });
});

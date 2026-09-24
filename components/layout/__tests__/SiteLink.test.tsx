import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@/test-utils';

import { SiteLink } from '../SiteLink';

const mockPrefetch = jest.fn();
jest.spyOn(jest.requireMock('next/navigation'), 'useRouter').mockReturnValue({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: mockPrefetch,
});

beforeEach(() => mockPrefetch.mockClear());

describe('SiteLink', () => {
  it('opens third-party links in a new tab with an arrow and an announcement', () => {
    render(
      <SiteLink href="https://example.com" kind="external">
        Example
      </SiteLink>,
    );
    const link = screen.getByRole('link', { name: 'Example nav.link.newTab' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps the other Cosmic Signature host in the same tab, without an arrow', () => {
    render(
      <SiteLink href="https://cosmicsignature.com/learn" kind="crossHost">
        Learn
      </SiteLink>,
    );
    const link = screen.getByRole('link', { name: 'Learn' });
    expect(link).not.toHaveAttribute('target');
    expect(link.querySelector('svg')).toBeNull();
  });

  it('prefetches directory links only on intent', () => {
    render(
      <SiteLink href="/gallery" kind="internal" prefetch="intent">
        Gallery
      </SiteLink>,
    );
    const link = screen.getByRole('link', { name: 'Gallery' });
    expect(mockPrefetch).not.toHaveBeenCalled();
    fireEvent.pointerEnter(link);
    fireEvent.focus(link);
    expect(mockPrefetch).toHaveBeenCalledWith('/gallery');
    expect(mockPrefetch).toHaveBeenCalledTimes(2);
  });

  it('forwards its ref and props for Radix asChild', () => {
    const ref = { current: null as HTMLAnchorElement | null };
    render(
      <SiteLink ref={ref} href="/faq" kind="internal" aria-current="page" data-testid="faq">
        FAQ
      </SiteLink>,
    );
    expect(ref.current).toBe(screen.getByTestId('faq'));
    expect(screen.getByTestId('faq')).toHaveAttribute('aria-current', 'page');
  });
});

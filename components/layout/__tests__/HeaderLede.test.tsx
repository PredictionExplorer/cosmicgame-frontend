import { renderToString } from 'react-dom/server';

import { HeaderLede } from '@/components/layout/HeaderLede';

import { fireEvent, render, screen } from '@/test-utils';

const CLAMP_CLASS = 'max-sm:[@media(scripting:enabled)]:line-clamp-3';
const LINE_HEIGHT = 24;

/**
 * Lays the lede out as `lines` lines of 24px in a browser that reports
 * `scripting: enabled` (or not).
 */
function mockLayout(lines: number, { scripting = true }: { scripting?: boolean } = {}) {
  const scroll = jest
    .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    .mockReturnValue(lines * LINE_HEIGHT);
  const computeStyle = window.getComputedStyle.bind(window);
  // Only the paragraph's metrics are faked; everything else keeps jsdom's styles.
  const style = jest.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
    const computed = computeStyle(element, pseudo);
    if (element.tagName !== 'P') return computed;
    return Object.assign(Object.create(computed), {
      lineHeight: `${LINE_HEIGHT}px`,
      fontSize: '16px',
    }) as CSSStyleDeclaration;
  });
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: scripting && query === '(scripting: enabled)',
    media: query,
  })) as typeof window.matchMedia;
  return () => {
    scroll.mockRestore();
    style.mockRestore();
    window.matchMedia = originalMatchMedia;
  };
}

describe('HeaderLede', () => {
  it('renders the clamped state and its toggle on the server, where nothing is measured yet', () => {
    const html = renderToString(
      <HeaderLede moreLabel="Read more" lessLabel="Show less">
        A lede.
      </HeaderLede>,
    );
    expect(html).toContain('Read more');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('line-clamp-3');
    // Without script the toggle could not work: it hides, and the clamp never applies.
    expect(html).toContain('[@media(scripting:none)]:hidden');
  });

  it('shows a lede of up to four lines whole: one hidden line is not worth a "Read more"', () => {
    const restore = mockLayout(4);
    render(
      <HeaderLede moreLabel="Read more" lessLabel="Show less">
        A four-line lede.
      </HeaderLede>,
    );
    expect(screen.getByText('A four-line lede.')).not.toHaveClass(CLAMP_CLASS);
    expect(screen.queryByRole('button')).toBeNull();
    restore();
  });

  it('clamps a longer lede to three lines and expands it in place', () => {
    const restore = mockLayout(6);
    render(
      <HeaderLede moreLabel="Read more" lessLabel="Show less">
        A long lede that runs well past three lines on a phone.
      </HeaderLede>,
    );
    const lede = screen.getByText(/A long lede/);
    expect(lede).toHaveClass(CLAMP_CLASS);
    const toggle = screen.getByRole('button', { name: 'Read more' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', lede.id);

    fireEvent.click(toggle);
    expect(lede).not.toHaveClass(CLAMP_CLASS);
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    restore();
  });

  it('never clamps where the browser cannot report scripting', () => {
    const restore = mockLayout(8, { scripting: false });
    render(
      <HeaderLede moreLabel="Read more" lessLabel="Show less">
        A long lede in an older browser.
      </HeaderLede>,
    );
    expect(screen.getByText(/older browser/)).not.toHaveClass(CLAMP_CLASS);
    expect(screen.queryByRole('button')).toBeNull();
    restore();
  });

  it('renders a plain paragraph when clamping is off (reading pages)', () => {
    const restore = mockLayout(8);
    render(
      <HeaderLede moreLabel="Read more" lessLabel="Show less" clamp={false}>
        The disclosure the page exists to state.
      </HeaderLede>,
    );
    expect(screen.getByText('The disclosure the page exists to state.')).not.toHaveClass(
      CLAMP_CLASS,
    );
    expect(screen.queryByRole('button')).toBeNull();
    restore();
  });
});

import { renderToString } from 'react-dom/server';

import {
  HeaderLede,
  LEDE_CLAMP_LINES,
  LEDE_FULL_UP_TO_LINES,
  LEDE_UNITS_PER_LINE,
  estimateLedeFit,
  ledeText,
} from '@/components/layout/HeaderLede';

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

/** A Latin lede of `lines` full phone lines. */
const latin = (lines: number) => 'word '.repeat((lines * LEDE_UNITS_PER_LINE) / 5).trim();

describe('HeaderLede', () => {
  it('shows a thesis lede in full, with no toggle to mount or remove after hydration', () => {
    const html = renderToString(
      <HeaderLede clamp={false} moreLabel="Read more" lessLabel="Show less">
        The thesis of a long read.
      </HeaderLede>,
    );
    expect(html).not.toContain('Read more');
    render(
      <HeaderLede clamp={false} moreLabel="Read more" lessLabel="Show less">
        The thesis of a long read.
      </HeaderLede>,
    );
    expect(screen.getByText('The thesis of a long read.')).not.toHaveClass(CLAMP_CLASS);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('ships a short lede whole from the server, so hydration removes nothing', () => {
    const html = renderToString(
      <HeaderLede moreLabel="Read more" lessLabel="Show less">
        {latin(LEDE_CLAMP_LINES)}
      </HeaderLede>,
    );
    expect(html).not.toContain('Read more');
    expect(html).not.toContain('line-clamp-3');
    expect(html).toContain('data-lede-fit="full"');
  });

  it('ships a long lede clamped, with its toggle, from the server', () => {
    const html = renderToString(
      <HeaderLede moreLabel="Read more" lessLabel="Show less">
        {latin(LEDE_FULL_UP_TO_LINES + 1)}
      </HeaderLede>,
    );
    expect(html).toContain('Read more');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('line-clamp-3');
    // Without script the toggle could not work: it hides, and the clamp never applies.
    expect(html).toContain('[@media(scripting:none)]:hidden');
    // One line tall: three clamped lines and the button stand exactly as
    // tall as a four-line lede, so a four-line lede never moves on hydration.
    expect(html).toMatch(/<button[^>]*class="[^"]*\bflex h-6\b/);
  });

  it('clamps from three and a half estimated lines, where either state is four lines tall', () => {
    expect(estimateLedeFit('a'.repeat(3 * LEDE_UNITS_PER_LINE))).toBe('full');
    expect(estimateLedeFit('a'.repeat(LEDE_FULL_UP_TO_LINES * LEDE_UNITS_PER_LINE))).toBe(
      'clamped',
    );
  });

  it('counts East Asian characters at twice the width of Latin ones, Cyrillic a little wider', () => {
    // 100 characters: a short Latin lede, a long Chinese or Korean one.
    expect(estimateLedeFit('a'.repeat(100))).toBe('full');
    expect(estimateLedeFit('锚'.repeat(100))).toBe('clamped');
    expect(estimateLedeFit('앵'.repeat(100))).toBe('clamped');
    expect(estimateLedeFit('锚'.repeat(70))).toBe('full');
    expect(estimateLedeFit('a'.repeat(140))).toBe('full');
    expect(estimateLedeFit('я'.repeat(140))).toBe('clamped');
    expect(estimateLedeFit('  ')).toBeNull();
  });

  it('reads the text of a rich lede through its elements', () => {
    expect(
      ledeText(
        <>
          Every <strong>gesture</strong> counts {3} times.
        </>,
      ),
    ).toBe('Every gesture counts 3 times.');
  });

  it('renders a lede with no readable text clamped until it is measured', () => {
    const html = renderToString(
      <HeaderLede moreLabel="Read more" lessLabel="Show less">
        <img alt="" src="/x.png" />
      </HeaderLede>,
    );
    expect(html).toContain('data-lede-fit="measuring"');
    expect(html).toContain('Read more');
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

  it('corrects an estimate the phone does not bear out (a wide phone fits it in four lines)', () => {
    const restore = mockLayout(LEDE_FULL_UP_TO_LINES);
    render(
      <HeaderLede moreLabel="Read more" lessLabel="Show less">
        {latin(LEDE_FULL_UP_TO_LINES + 1)}
      </HeaderLede>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(document.querySelector('[data-lede-fit]')).toHaveAttribute('data-lede-fit', 'full');
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

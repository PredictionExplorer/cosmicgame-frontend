import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { ClampedText } from '@/components/tables/ClampedText';
import { cycleHref } from '@/components/tables/useCycleHref';

import { act, render, screen } from '@/test-utils';

/** Lays the clamped text out as `lines` tall: 20px a line, two shown. */
function layOut(lines: number) {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => lines * 20,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => Math.min(lines, 2) * 20,
  });
}

let observed: (() => void) | null = null;

beforeEach(() => {
  observed = null;
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
    constructor(callback: () => void) {
      observed = callback;
    }
    observe() {
      observed?.();
    }
    disconnect() {}
  };
});

afterEach(() => {
  delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
  delete (HTMLElement.prototype as { scrollHeight?: unknown }).scrollHeight;
  delete (HTMLElement.prototype as { clientHeight?: unknown }).clientHeight;
});

describe('ClampedText', () => {
  it('shows a short message whole, with nothing to press', () => {
    layOut(1);
    render(<ClampedText text="gm" />);
    expect(screen.getByText('gm')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('offers the rest of a long message as a disclosure, not a hover tooltip', async () => {
    const user = userEvent.setup();
    layOut(5);
    render(<ClampedText text={'word '.repeat(80)} />);

    const text = screen.getByText(/word/);
    expect(text).toHaveClass('sm:line-clamp-2');
    const toggle = screen.getByRole('button', { name: 'tables.message.showAll' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', text.id);

    await user.click(toggle);
    expect(text).not.toHaveClass('sm:line-clamp-2');
    const collapse = screen.getByRole('button', { name: 'tables.message.showLess' });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');

    await user.click(collapse);
    expect(text).toHaveClass('sm:line-clamp-2');
  });

  it('breaks a run with no spaces anywhere, so it never widens its column', () => {
    layOut(1);
    act(() => {
      render(<ClampedText text={'x'.repeat(200)} />);
    });
    expect(screen.getByText('x'.repeat(200))).toHaveClass('[overflow-wrap:anywhere]');
  });
});

describe('cycleHref', () => {
  it('leads the live cycle to its page, which has no allocation record yet', () => {
    expect(cycleHref(2, 2)).toBe('/current-cycle');
  });

  it('leads a finalized cycle to its allocation record', () => {
    expect(cycleHref(1, 2)).toBe('/allocation/1');
  });

  it('leads to the record while the live cycle is unknown', () => {
    expect(cycleHref(2, null)).toBe('/allocation/2');
    expect(cycleHref(2, undefined)).toBe('/allocation/2');
  });
});

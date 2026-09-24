import { act, render, screen } from '@/test-utils';

import { CYCLE_SECTION_SCROLL_MARGIN, CycleSectionNav } from '../components/CycleSectionNav';

type ObserverCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;

const observers: Array<{ callback: ObserverCallback; rootMargin?: string }> = [];

class FakeIntersectionObserver {
  constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
    observers.push({ callback, rootMargin: options?.rootMargin });
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

const SECTION_IDS = ['allocations', 'participants', 'gesture-history', 'rules'];

/** The scrollspy's observer (the other one watches whether the bar is stuck). */
function spy(entries: Array<{ id: string; isIntersecting: boolean }>) {
  const observer = observers.find((entry) => entry.rootMargin === '-25% 0px -65% 0px');
  if (!observer) throw new Error('no reading-band observer');
  act(() =>
    observer.callback(
      entries.map(({ id, isIntersecting }) => ({
        target: document.getElementById(id)!,
        isIntersecting,
      })),
    ),
  );
}

function placeFirstSection(top: number) {
  jest
    .spyOn(document.getElementById('allocations')!, 'getBoundingClientRect')
    .mockReturnValue({ top } as DOMRect);
}

const current = () =>
  screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'location')
    .map((link) => link.getAttribute('href'));

beforeEach(() => {
  observers.length = 0;
  window.IntersectionObserver =
    FakeIntersectionObserver as unknown as typeof window.IntersectionObserver;
  render(
    <>
      <CycleSectionNav hasStandings={false} />
      {SECTION_IDS.map((id) => (
        <section key={id} id={id} className={CYCLE_SECTION_SCROLL_MARGIN}>
          <h2>{id}</h2>
        </section>
      ))}
    </>,
  );
});

describe('CycleSectionNav', () => {
  it('marks the section crossing the reading band as the current location', () => {
    spy([{ id: 'participants', isIntersecting: true }]);
    expect(current()).toEqual(['#participants']);
  });

  it('keeps the section above current in the gap before the next one', () => {
    spy([{ id: 'participants', isIntersecting: true }]);
    placeFirstSection(-1200);
    spy([{ id: 'participants', isIntersecting: false }]);
    expect(current()).toEqual(['#participants']);
  });

  it('marks nothing once the reader is back above the first section, at the page header', () => {
    spy([{ id: 'allocations', isIntersecting: true }]);
    placeFirstSection(window.innerHeight);
    spy([{ id: 'allocations', isIntersecting: false }]);
    expect(current()).toEqual([]);
  });

  it('lands a jump just under the bar: the margin clears only the bar, not the header twice', () => {
    // The page's scroll padding (--sticky-offset) already clears the site header.
    expect(CYCLE_SECTION_SCROLL_MARGIN).not.toContain('header-height');
    expect(document.getElementById('rules')).toHaveClass(CYCLE_SECTION_SCROLL_MARGIN);
  });
});

import { restScroll, ScrollRail, type RailSpan } from '@/components/ui/scroll-rail';

import { render, screen, waitFor } from '@/test-utils';

/** Lays every element out `overflow` px wider than its box. */
function mockOverflow(overflow: number) {
  const scroll = jest
    .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
    .mockReturnValue(400 + overflow);
  const client = jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400);
  return () => {
    scroll.mockRestore();
    client.mockRestore();
  };
}

describe('ScrollRail', () => {
  it('marks the edge it can still scroll toward', async () => {
    const restore = mockOverflow(500);
    const { container } = render(
      <ScrollRail label="Performance Cycle phases">
        <ol>
          <li>Opening</li>
          <li aria-current="step">Open</li>
        </ol>
      </ScrollRail>,
    );
    await waitFor(() => expect(container.querySelector('[data-overflow-end]')).not.toBeNull());
    expect(container.querySelector('[data-overflow-start]')).toBeNull();
    restore();
  });

  it('lets a keyboard scroll a track that overflows with nothing focusable inside', async () => {
    const restore = mockOverflow(200);
    render(
      <ScrollRail label="Cycle timeline">
        <ol>
          <li>Opening</li>
          <li>Open</li>
        </ol>
      </ScrollRail>,
    );
    const region = await screen.findByRole('region', { name: 'Cycle timeline' });
    expect(region).toHaveAttribute('tabindex', '0');
    restore();
  });

  it('leaves the track alone when its own items take focus', async () => {
    const restore = mockOverflow(200);
    const { container } = render(
      <ScrollRail label="Sections">
        <a href="/a">A</a>
        <a href="/b">B</a>
      </ScrollRail>,
    );
    await waitFor(() => expect(container.querySelector('[data-overflow-end]')).not.toBeNull());
    expect(screen.queryByRole('region')).toBeNull();
    expect(container.querySelector('[tabindex="0"]')).toBeNull();
    restore();
  });

  it('takes no focus and no name when everything fits', async () => {
    const restore = mockOverflow(0);
    const { container } = render(
      <ScrollRail label="Cycle timeline">
        <span>Fits</span>
      </ScrollRail>,
    );
    // Let the first measurement run before asserting nothing changed.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(container.querySelector('[tabindex]')).toBeNull();
    expect(container.querySelector('[role]')).toBeNull();
    expect(container.querySelector('[aria-label]')).toBeNull();
    restore();
  });

  it('never lets its row shrink to the rail, so the row box spans every item', () => {
    // Regression: the scrolled list kept flex-shrink:1, so an underline row's
    // hairline and a segmented track's fill stopped a screen in.
    const { container } = render(
      <ScrollRail>
        <ul className="w-max">
          <li>One</li>
        </ul>
      </ScrollRail>,
    );
    const track = container.querySelector('[class*="overflow-x-auto"]')!;
    expect(track).toHaveClass('[&>*]:shrink-0', 'snap-x', 'snap-proximity');
  });

  describe('revealing the current item', () => {
    type Box = { left: number; right: number };
    function layout(track: HTMLElement, boxes: Box[], trackBox: Box) {
      const row = track.firstElementChild as HTMLElement;
      Array.from(row.children).forEach((item, index) => {
        (item as HTMLElement).getBoundingClientRect = () =>
          ({ ...boxes[index], width: boxes[index]!.right - boxes[index]!.left }) as DOMRect;
      });
      track.getBoundingClientRect = () => trackBox as DOMRect;
      const scrollTo = jest.fn();
      Object.assign(track, { scrollTo });
      return scrollTo;
    }

    it('rests the row on whole items, making room after it when the row ends first', async () => {
      // A 300px rail, 16px font: the end fade is 40px. The active tab (the
      // third) ends at 380 and the row can scroll 80px; the tabs abut.
      const restore = mockOverflow(80);
      const { container } = render(
        <ScrollRail>
          <ul style={{ borderBottom: '1px solid' }}>
            <li>Source code</li>
            <li>Risk Disclosures</li>
            <li data-state="active">Terms</li>
          </ul>
        </ScrollRail>,
      );
      const track = container.querySelector('[class*="overflow-x-auto"]') as HTMLElement;
      const scrollTo = layout(
        track,
        [
          { left: 0, right: 110 },
          { left: 110, right: 280 },
          { left: 280, right: 380 },
        ],
        { left: 0, right: 300 },
      );
      // A change of the current item runs the reveal.
      track.querySelector('[data-state]')!.setAttribute('data-state', 'inactive');
      track.querySelector('[data-state]')!.setAttribute('data-state', 'active');
      await waitFor(() => expect(scrollTo).toHaveBeenCalled());
      // Scrolling just far enough (120) would leave "Risk Disclosures" cut in
      // two at the start, and the row's own end (80) would show 30px of
      // "Source code": the row moves on to "Risk Disclosures", whole at the
      // start, with 30px of room after it.
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 110, behavior: 'smooth' });
      expect(track.style.getPropertyValue('--rail-end-room')).toBe('30px');
      // An underline row's hairline runs on under the room.
      expect(track).toHaveAttribute('data-end-rule');
      restore();
    });

    it('snaps items to the row gap from the start edge', async () => {
      const restore = mockOverflow(100);
      const { container } = render(
        <ScrollRail>
          <ul>
            <li>Overview</li>
            <li data-state="active">Tokens</li>
          </ul>
        </ScrollRail>,
      );
      const track = container.querySelector('[class*="overflow-x-auto"]') as HTMLElement;
      layout(
        track,
        [
          { left: 0, right: 64 },
          { left: 88, right: 136 },
        ],
        { left: 0, right: 300 },
      );
      track.querySelector('[data-state]')!.setAttribute('data-state', 'inactive');
      track.querySelector('[data-state]')!.setAttribute('data-state', 'active');
      await waitFor(() => expect(track.style.scrollPaddingInline).toBe('24px 2.5rem'));
      restore();
    });
  });

  describe('restScroll', () => {
    // Tabs 24px apart on a 358px phone rail, 16px font (a 40px end fade).
    const track: RailSpan = { left: 0, right: 358 };
    const at = (...spans: [number, number][]): RailSpan[] =>
      spans.map(([left, right]) => ({ left, right }));
    const trust = at(
      [0, 56], // Security
      [80, 124], // Audits
      [148, 213], // Contracts
      [237, 322], // Source code
      [346, 456], // Risk Disclosures
      [480, 594], // Terms of Service
      [618, 711], // Privacy Policy
    );
    const rest = (items: RailSpan[], index: number, reach: number, atEnd = false) =>
      restScroll({ track, items, index, inset: 24, fade: 40, reach, atEnd });

    it('leaves a row alone while its current item shows whole and clear of the fade', () => {
      expect(rest(trust, 1, 353)).toBeNull();
    });

    it('moves on to the next item start so no fragment stays at the start (regression)', () => {
      // Terms of Service: the least scroll (276) cut "Source code" to "de"
      // under the start fade; "Risk Disclosures" now starts one gap in.
      expect(rest(trust, 5, 353)).toBe(346 - 24);
    });

    it('never rests on a row end that cuts an item at the start, even by a letter', () => {
      // Privacy Policy at the end: the row's end (353) took 7px of "Risk
      // Disclosures", which read as "isk Disclosures" (regression). "Terms of
      // Service" now starts one gap in, with room after the row.
      expect(rest(trust, 6, 353)).toBe(480 - 24);
    });

    it('makes room after the row when its end would leave a fragment', () => {
      // Statistics at 390px, Activity current: the row's end (147) keeps 25px
      // of "Participation"; resting "Tokens" one gap in needs 172.
      const statistics = at([0, 64], [88, 172], [196, 244], [268, 338], [362, 412], [436, 505]);
      expect(rest(statistics, 4, 147)).toBe(196 - 24);
    });

    it('brings an item hidden to the start in with the one before it, whole', () => {
      const scrolled = trust.map(({ left, right }) => ({ left: left - 400, right: right - 400 }));
      expect(rest(scrolled, 3, 0, true)).toBe(148 - 400 - 24);
    });

    it('moves a row the browser left on a fragment to rest on whole items', () => {
      // Clicking the last tab lets the browser scroll it in to the row's end,
      // leaving 35px of "Stellar Selection": the row moves on to the next
      // tab, whole at the rest inset, with room after the row.
      const tabs = at([-123, 35], [59, 183], [207, 358]);
      expect(rest(tabs, 2, 0, true)).toBe(59 - 24);
    });

    it('moves a row whose start cuts an item by a letter onto whole items', () => {
      const tabs = at([-7, 103], [127, 241], [265, 358]);
      expect(rest(tabs, 2, 0, true)).toBe(127 - 24);
    });

    it('takes a sub-pixel overhang at the start for layout rounding, not a fragment', () => {
      const tabs = at([-0.6, 103], [127, 241], [265, 358]);
      expect(rest(tabs, 2, 0, true)).toBeNull();
    });

    it('draws no end fade to clear at the row end', () => {
      // The last tab ends on the track's edge and the start edge falls in a gap.
      const atRowEnd = at([-120, -10], [14, 124], [148, 262], [286, 358]);
      expect(rest(atRowEnd, 3, 0, true)).toBeNull();
    });
  });
});

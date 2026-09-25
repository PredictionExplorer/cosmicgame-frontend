import { ScrollRail } from '@/components/ui/scroll-rail';

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
        (item as HTMLElement).getBoundingClientRect = () => boxes[index] as DOMRect;
      });
      track.getBoundingClientRect = () => trackBox as DOMRect;
      const scrollBy = jest.fn();
      Object.assign(track, { scrollBy });
      return scrollBy;
    }

    it('scrolls a cut item fully out rather than leave a fragment at the start', async () => {
      // A 300px rail, 16px font: the fade is 40px. The active tab (the third)
      // ends at 380; revealing it alone would stop with the first tab cut.
      const { container } = render(
        <ScrollRail>
          <div>
            <span>Source code</span>
            <span>Risk Disclosures</span>
            <span data-state="active">Terms</span>
          </div>
        </ScrollRail>,
      );
      const track = container.querySelector('[class*="overflow-x-auto"]') as HTMLElement;
      const scrollBy = layout(
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
      await waitFor(() => expect(scrollBy).toHaveBeenCalled());
      // Scrolling just 380 - 300 + 40 = 120 would leave the tab under the
      // start edge (at 120 + 40 = 160, "Risk Disclosures", 110-280) cut in
      // two; the row moves on to that tab's end, beside the fade.
      const { left } = scrollBy.mock.calls.at(-1)![0] as { left: number };
      expect(left).toBe(280 - 0 - 40);
    });
  });
});

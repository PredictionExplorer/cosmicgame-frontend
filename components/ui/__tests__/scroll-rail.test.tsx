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
});

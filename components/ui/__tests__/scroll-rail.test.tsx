import { render, screen, waitFor } from '@/test-utils';

import { ScrollRail } from '../scroll-rail';

function mockWidths(scrollWidth: number, clientWidth: number) {
  const scroll = jest
    .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
    .mockReturnValue(scrollWidth);
  const client = jest
    .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
    .mockReturnValue(clientWidth);
  return () => {
    scroll.mockRestore();
    client.mockRestore();
  };
}

function Steps({ label }: { label?: string }) {
  return (
    <ScrollRail keyboardScrollableLabel={label} data-testid="frame">
      <ol aria-label="Performance Cycle phases">
        <li>Opening</li>
        <li aria-current="step">Open</li>
      </ol>
    </ScrollRail>
  );
}

const track = () => screen.getByTestId('frame').firstElementChild as HTMLElement;

describe('ScrollRail', () => {
  let restore: () => void = () => undefined;
  afterEach(() => restore());

  it('marks the edge it can still scroll toward', async () => {
    restore = mockWidths(900, 358);
    render(<Steps />);

    await waitFor(() => expect(track()).toHaveAttribute('data-overflow-end', 'true'));
    expect(track()).not.toHaveAttribute('data-overflow-start');
  });

  it('gives an overflowing rail of plain items a tab stop and a name', async () => {
    restore = mockWidths(900, 358);
    render(<Steps label="Performance Cycle phases" />);

    await waitFor(() => expect(track()).toHaveAttribute('tabindex', '0'));
    expect(track()).toHaveAttribute('role', 'group');
    expect(track()).toHaveAccessibleName('Performance Cycle phases');
  });

  it('leaves a rail that fits out of the tab order', async () => {
    restore = mockWidths(1280, 1280);
    render(<Steps label="Performance Cycle phases" />);

    // Let the first measurement run before asserting nothing changed.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(track()).not.toHaveAttribute('tabindex');
    expect(track()).not.toHaveAttribute('role');
    expect(track()).not.toHaveAttribute('aria-label');
  });

  it('adds no tab stop unless asked, since links and tabs are stops already', async () => {
    restore = mockWidths(900, 358);
    render(<Steps />);

    await waitFor(() => expect(track()).toHaveAttribute('data-overflow-end', 'true'));
    expect(track()).not.toHaveAttribute('tabindex');
    expect(track()).not.toHaveAttribute('role');
  });
});

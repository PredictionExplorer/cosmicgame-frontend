import { useRef } from 'react';

import { render, screen } from '@/test-utils';

import { useKeyboardScrollable } from '../useKeyboardScrollable';

function Rail() {
  const ref = useRef<HTMLDivElement>(null);
  useKeyboardScrollable(ref, 'Performance Cycle phases');
  return (
    <div ref={ref} data-testid="rail">
      <ol>
        <li>Opening</li>
      </ol>
    </div>
  );
}

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

describe('useKeyboardScrollable', () => {
  it('gives a rail that overflows a tab stop and a name, so the keyboard can scroll it', () => {
    const restore = mockWidths(900, 358);
    render(<Rail />);

    const rail = screen.getByTestId('rail');
    expect(rail).toHaveAttribute('tabindex', '0');
    expect(rail).toHaveAttribute('role', 'group');
    expect(rail).toHaveAccessibleName('Performance Cycle phases');
    restore();
  });

  it('leaves a rail that fits out of the tab order', () => {
    const restore = mockWidths(1280, 1280);
    render(<Rail />);

    const rail = screen.getByTestId('rail');
    expect(rail).not.toHaveAttribute('tabindex');
    expect(rail).not.toHaveAttribute('role');
    expect(rail).not.toHaveAttribute('aria-label');
    restore();
  });
});

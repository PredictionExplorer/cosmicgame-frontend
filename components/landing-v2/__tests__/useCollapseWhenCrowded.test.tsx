import { useRef } from 'react';
import { act, render, screen } from '@testing-library/react';

import { useCollapseWhenCrowded } from '../useCollapseWhenCrowded';

type Callback = () => void;
let notify: Callback = () => {};
const originalResizeObserver = globalThis.ResizeObserver;

beforeAll(() => {
  globalThis.ResizeObserver = class {
    constructor(callback: Callback) {
      notify = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterAll(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

function Row() {
  const container = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const crowded = useCollapseWhenCrowded(container, list);
  return (
    <nav ref={container}>
      <ul ref={list} data-testid="list" data-crowded={String(crowded)} />
    </nav>
  );
}

function size(element: HTMLElement, property: 'clientWidth' | 'scrollWidth', value: number) {
  Object.defineProperty(element, property, { configurable: true, value });
}

describe('useCollapseWhenCrowded', () => {
  it('collapses while the list overflows, and expands once everything fits again', () => {
    render(<Row />);
    const list = screen.getByTestId('list');
    const nav = list.parentElement!;

    size(nav, 'clientWidth', 600);
    size(list, 'scrollWidth', 600);
    act(() => notify());
    expect(list).toHaveAttribute('data-crowded', 'false');

    // "Open the app" joins the bar: 700px of links in 600px of room.
    size(list, 'scrollWidth', 700);
    act(() => notify());
    expect(list).toHaveAttribute('data-crowded', 'true');

    // Hiding the anchors makes the list fit, which must not flip it back.
    size(list, 'scrollWidth', 400);
    act(() => notify());
    expect(list).toHaveAttribute('data-crowded', 'true');

    // Only room for the full 700px brings the anchors back.
    size(nav, 'clientWidth', 699);
    act(() => notify());
    expect(list).toHaveAttribute('data-crowded', 'true');
    size(nav, 'clientWidth', 720);
    act(() => notify());
    expect(list).toHaveAttribute('data-crowded', 'false');
  });

  it('decides nothing while the row is hidden below its breakpoint', () => {
    render(<Row />);
    const list = screen.getByTestId('list');
    size(list.parentElement!, 'clientWidth', 0);
    size(list, 'scrollWidth', 900);
    act(() => notify());
    expect(list).toHaveAttribute('data-crowded', 'false');
  });
});

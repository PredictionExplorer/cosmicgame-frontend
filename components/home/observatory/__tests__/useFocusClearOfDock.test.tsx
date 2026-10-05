import { renderHook } from '@testing-library/react';

import { useFocusClearOfDock } from '../useFocusClearOfDock';

const DOCK_TOP = 763;

function box(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    height: bottom - top,
    left: 0,
    right: 390,
    width: 390,
    x: 0,
    y: top,
    toJSON: () => ({}),
  };
}

interface Setup {
  /** Bottom edge of the control that receives focus, in viewport px. */
  targetBottom: number;
  dockHeight?: number;
  /** Whether the focus is keyboard focus (`:focus-visible`). */
  keyboard?: boolean;
}

function setup({ targetBottom, dockHeight = 64, keyboard = true }: Setup) {
  document.body.innerHTML = `
    <button id="pause">Pause</button>
    <div data-action-dock><button id="dock-button">Gesture</button></div>
  `;
  const dock = document.querySelector<HTMLElement>('[data-action-dock]')!;
  jest.spyOn(dock, 'getBoundingClientRect').mockReturnValue(box(DOCK_TOP, DOCK_TOP + dockHeight));
  const target = document.getElementById('pause')!;
  jest.spyOn(target, 'getBoundingClientRect').mockReturnValue(box(targetBottom - 44, targetBottom));
  jest
    .spyOn(target, 'matches')
    .mockImplementation((selector: string) => selector === ':focus-visible' && keyboard);
  const dockRef: { current: HTMLElement | null } = { current: dock };
  const hook = renderHook(() => useFocusClearOfDock(dockRef));
  return { target, dock, dockRef, dockButton: document.getElementById('dock-button')!, ...hook };
}

let scrollBy: jest.SpyInstance;

beforeEach(() => {
  scrollBy = jest.spyOn(window, 'scrollBy').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('useFocusClearOfDock', () => {
  it('lifts a keyboard-focused control out from under the dock', () => {
    const { target } = setup({ targetBottom: 819 });

    target.focus();

    // The overlap plus a 12px gap: the control ends 12px above the dock.
    expect(scrollBy).toHaveBeenCalledWith({ top: 819 + 12 - DOCK_TOP, behavior: 'instant' });
  });

  it('leaves a control that already clears the dock', () => {
    const { target } = setup({ targetBottom: 700 });

    target.focus();

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('never moves the page for a tap or a click', () => {
    const { target } = setup({ targetBottom: 819, keyboard: false });

    target.focus();

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('ignores a dock that is not displayed', () => {
    const { target } = setup({ targetBottom: 819, dockHeight: 0 });

    target.focus();

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('ignores a dock that has stepped aside, even mid-slide', () => {
    // A stepped-aside dock is inert while it slides out of view; its box
    // still overlaps the control for the length of the transition.
    const { target, dock } = setup({ targetBottom: 819 });
    dock.setAttribute('inert', '');

    target.focus();

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('ignores a page whose dock is not rendered', () => {
    const { target, dockRef } = setup({ targetBottom: 819 });
    dockRef.current = null;

    target.focus();

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('ignores focus inside the dock itself', () => {
    const { dockButton } = setup({ targetBottom: 819 });

    dockButton.focus();

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('stops listening once unmounted', () => {
    const { target, unmount } = setup({ targetBottom: 819 });

    unmount();
    target.focus();

    expect(scrollBy).not.toHaveBeenCalled();
  });
});

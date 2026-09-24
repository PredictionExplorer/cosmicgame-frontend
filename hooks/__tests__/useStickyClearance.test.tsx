import { useRef } from 'react';
import { render } from '@testing-library/react';

import {
  STICKY_CLEARANCE_PROPERTY,
  cssLengthToPx,
  stickyClearancePx,
  useStickyClearance,
} from '../useStickyClearance';

describe('cssLengthToPx', () => {
  it('reads px and rem lengths', () => {
    expect(cssLengthToPx('72px', 16)).toBe(72);
    expect(cssLengthToPx('4.5rem', 16)).toBe(72);
    expect(cssLengthToPx(' 5.25rem ', 16)).toBe(84);
    expect(cssLengthToPx('auto', 16)).toBe(0);
  });
});

describe('stickyClearancePx', () => {
  it('counts the bar and its gap below the header', () => {
    // The gallery toolbar: 56px tall, stuck 12px below a 72px header.
    expect(stickyClearancePx({ height: 55.5, stickyTop: 84, headerHeight: 72 })).toBe(68);
    // A sub-navigation stuck right under the header.
    expect(stickyClearancePx({ height: 45, stickyTop: 72, headerHeight: 72 })).toBe(45);
    expect(stickyClearancePx({ height: 0, stickyTop: 0, headerHeight: 72 })).toBe(0);
  });
});

function Bar({ sticky }: { sticky: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useStickyClearance(ref);
  return <div ref={ref} style={{ position: sticky ? 'sticky' : 'static', top: '84px' }} />;
}

describe('useStickyClearance', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty('--header-height', '4.5rem');
    document.documentElement.style.removeProperty(STICKY_CLEARANCE_PROPERTY);
  });

  it('publishes the clearance of a sticky bar and removes it on unmount', () => {
    const { unmount } = render(<Bar sticky />);
    // jsdom lays nothing out: a 0px bar 12px below the header clears 12px.
    expect(document.documentElement.style.getPropertyValue(STICKY_CLEARANCE_PROPERTY)).toBe('12px');
    unmount();
    expect(document.documentElement.style.getPropertyValue(STICKY_CLEARANCE_PROPERTY)).toBe('');
  });

  it('publishes nothing while the bar is not sticky', () => {
    render(<Bar sticky={false} />);
    expect(document.documentElement.style.getPropertyValue(STICKY_CLEARANCE_PROPERTY)).toBe('');
  });
});

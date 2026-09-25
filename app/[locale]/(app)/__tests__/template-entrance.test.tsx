import { render } from '@testing-library/react';

import { resetDocumentEntranceForTesting } from '@/lib/motion';

import AppTemplate from '../template';
import LandingTemplate from '../../(landing)/template';

/**
 * Route templates wrap EVERY page. If they animated from `opacity: 0` on the
 * initial document load, the server HTML would render the whole page
 * invisible and the Largest Contentful Paint would wait for the full JS
 * bundle to download and hydrate — the single largest mobile LCP regression
 * this app has had.
 *
 * Contract: the entrance is skipped on the initial document load (content
 * visible at first paint), runs only on client-side navigations (later
 * template mounts), fades opacity only (a transform on the wrapper would
 * re-anchor every `position: fixed` descendant), and never runs for a
 * visitor who prefers reduced motion.
 */
describe.each([
  ['app route group', AppTemplate],
  ['landing route group', LandingTemplate],
])('%s template entrance', (_label, Template) => {
  const animate = jest.fn(() => ({ cancel: jest.fn() }));
  let reducedMotion = false;

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: animate,
    });
  });

  afterAll(() => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
  });

  beforeEach(() => {
    resetDocumentEntranceForTesting();
    animate.mockClear();
    reducedMotion = false;
    window.matchMedia = jest.fn((query: string) => ({
      matches: query.includes('reduce') && reducedMotion,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
  });

  const navigate = () => {
    render(
      <Template>
        <p>first page</p>
      </Template>,
    ).unmount();
    return render(
      <Template>
        <p>second page</p>
      </Template>,
    );
  };

  it('renders children visible, without an entrance, on the initial document load', () => {
    const { container, getByText } = render(
      <Template>
        <p>content</p>
      </Template>,
    );
    expect(getByText('content')).toBeInTheDocument();
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe('');
    expect(animate).not.toHaveBeenCalled();
  });

  it('fades a client-side navigation in, opacity only', () => {
    const { container } = navigate();
    expect(animate).toHaveBeenCalledTimes(1);
    const [keyframes, timing] = animate.mock.calls[0] as unknown as [
      Keyframe[],
      KeyframeAnimationOptions,
    ];
    expect(keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    for (const frame of keyframes) expect(Object.keys(frame)).toEqual(['opacity']);
    expect(timing.duration).toBeGreaterThan(0);
    expect(timing.easing).toMatch(/cubic-bezier/);
    expect((container.firstElementChild as HTMLElement).style.transform).toBe('');
  });

  it('shows the next page at once to a visitor who prefers reduced motion', () => {
    reducedMotion = true;
    navigate();
    expect(animate).not.toHaveBeenCalled();
  });

  it('treats every mount as initial again after a reset (new document)', () => {
    render(
      <Template>
        <p>content</p>
      </Template>,
    ).unmount();
    resetDocumentEntranceForTesting();
    render(
      <Template>
        <p>content</p>
      </Template>,
    );
    expect(animate).not.toHaveBeenCalled();
  });
});

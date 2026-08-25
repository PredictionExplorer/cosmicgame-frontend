import { render } from '@testing-library/react';

import { resetDocumentEntranceForTesting } from '@/lib/motion';

import AppTemplate from '../template';
import LandingTemplate from '../../(landing)/template';

/**
 * Route templates wrap EVERY page. If they animate from `opacity: 0` on the
 * initial document load, the server HTML renders the whole page invisible
 * and the Largest Contentful Paint waits for the full JS bundle to download
 * and hydrate — the single largest mobile LCP regression this app has had.
 *
 * Contract: the entrance animation is skipped on the initial document load
 * (content visible at first paint) and runs only on client-side navigations
 * (subsequent template mounts).
 */
describe.each([
  ['app route group', AppTemplate],
  ['landing route group', LandingTemplate],
])('%s template entrance', (_label, Template) => {
  beforeEach(() => {
    resetDocumentEntranceForTesting();
  });

  it('renders children visible on the initial document load', () => {
    const { container } = render(
      <Template>
        <p>content</p>
      </Template>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.opacity === '' || Number(wrapper.style.opacity) > 0).toBe(true);
  });

  it('animates the entrance on subsequent mounts (client-side navigation)', () => {
    const first = render(
      <Template>
        <p>first page</p>
      </Template>,
    );
    first.unmount();

    const second = render(
      <Template>
        <p>second page</p>
      </Template>,
    );
    const wrapper = second.container.firstElementChild as HTMLElement;
    // framer-motion applies the `initial` variant synchronously, so a
    // navigation mount starts hidden and fades in.
    expect(wrapper.style.opacity).toBe('0');
  });

  it('treats every mount as initial again after a reset (new document)', () => {
    const first = render(
      <Template>
        <p>content</p>
      </Template>,
    );
    first.unmount();
    resetDocumentEntranceForTesting();

    const second = render(
      <Template>
        <p>content</p>
      </Template>,
    );
    const wrapper = second.container.firstElementChild as HTMLElement;
    expect(wrapper.style.opacity === '' || Number(wrapper.style.opacity) > 0).toBe(true);
  });
});

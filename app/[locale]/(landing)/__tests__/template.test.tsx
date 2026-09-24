import { render } from '@testing-library/react';

import { resetDocumentEntranceForTesting } from '@/lib/motion';

import LandingTemplate from '../template';

/**
 * A transform on the route wrapper (even a settled `translateY(0.01px)`)
 * makes it the containing block for `position: fixed` descendants, which
 * would pin the reading pages' fixed Contents button to the document after
 * a client-side navigation. The landing entrance fades only.
 */
describe('landing route template', () => {
  beforeEach(() => {
    resetDocumentEntranceForTesting();
  });

  it('fades a navigation in without transforming the page wrapper', () => {
    render(
      <LandingTemplate>
        <p>first page</p>
      </LandingTemplate>,
    ).unmount();

    const { container } = render(
      <LandingTemplate>
        <p>second page</p>
      </LandingTemplate>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('0');
    expect(wrapper.style.transform === '' || wrapper.style.transform === 'none').toBe(true);
  });
});

import { fireEvent, render, screen } from '@testing-library/react';

import { SectionLink } from '@/components/landing-v2/SectionLink';

/**
 * V415: an in-page link on the landing moves keyboard focus with the view,
 * so the next Tab and a screen reader continue from the section, not from
 * the link the reader activated.
 */
describe('<SectionLink />', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  function renderPage() {
    return render(
      <>
        <SectionLink section="cycle">How a cycle works</SectionLink>
        <section id="cycle" aria-labelledby="cycle-heading">
          <h2 id="cycle-heading">A Performance Cycle</h2>
          <a href="/next">Next link</a>
        </section>
      </>,
    );
  }

  it('moves focus to the section’s heading and writes the fragment', () => {
    renderPage();
    const link = screen.getByRole('link', { name: 'How a cycle works' });
    expect(link).toHaveAttribute('href', '#cycle');
    fireEvent.click(link);
    const heading = screen.getByRole('heading', { name: 'A Performance Cycle' });
    expect(heading).toHaveFocus();
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(window.location.hash).toBe('#cycle');
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('leaves a modified click to the browser', () => {
    renderPage();
    const link = screen.getByRole('link', { name: 'How a cycle works' });
    const handled = !fireEvent.click(link, { metaKey: true });
    expect(handled).toBe(false);
    expect(screen.getByRole('heading', { name: 'A Performance Cycle' })).not.toHaveFocus();
  });
});

import { checkA11y, render, screen } from '@/test-utils';

import { RecordPager } from '../record-pager';

const props = {
  label: 'Neighbouring cycles',
  previousLabel: 'Previous cycle',
  nextLabel: 'Next cycle',
};

describe('RecordPager', () => {
  it('names each neighbour by its own title and its direction, as real prev/next links', () => {
    render(
      <RecordPager
        {...props}
        previous={{ href: '/allocation/0', label: 'Cycle #0' }}
        next={{ href: '/allocation/2', label: 'Cycle #2' }}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Neighbouring cycles' });
    expect(nav).toBeInTheDocument();
    const previous = screen.getByRole('link', { name: 'Previous cycle, Cycle #0' });
    expect(previous).toHaveAttribute('href', '/allocation/0');
    expect(previous).toHaveAttribute('rel', 'prev');
    expect(screen.getByRole('link', { name: 'Next cycle, Cycle #2' })).toHaveAttribute(
      'rel',
      'next',
    );
    // Arrows, never chevrons (those are for carousels).
    expect(nav.querySelector('.lucide-chevron-left, .lucide-chevron-right')).toBeNull();
    expect(nav.querySelector('.lucide-arrow-left')).not.toBeNull();
  });

  it('holds the next link’s place while it is pending, and renders nothing without neighbours', () => {
    const { rerender, container } = render(<RecordPager {...props} nextPending="Cycle #2" />);
    expect(screen.getByText('Cycle #2').closest('[aria-hidden]')).toHaveClass('invisible');
    rerender(<RecordPager {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RecordPager {...props} previous={{ href: '/allocation/0', label: 'Cycle #0' }} />,
    );
    await checkA11y(container);
  });
});

import { checkA11y, render, screen } from '@/test-utils';

import { GallerySortSelect } from '../components/GallerySortSelect';

describe('GallerySortSelect', () => {
  it('renders the trigger with the current order', () => {
    render(<GallerySortSelect value="cycle-desc" onChange={jest.fn()} />);
    expect(screen.getByRole('combobox', { name: 'gallery.sort.ariaLabel' })).toHaveTextContent(
      'gallery.sort.cycleDesc',
    );
  });

  it('keeps a trait order on screen while the trait index is unavailable', () => {
    render(<GallerySortSelect value="rarity" onChange={jest.fn()} traitSortsAvailable={false} />);
    expect(screen.getByRole('combobox', { name: 'gallery.sort.ariaLabel' })).toHaveTextContent(
      'gallery.sort.rarity',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GallerySortSelect value="newest" onChange={jest.fn()} />);
    await checkA11y(container);
  });
});

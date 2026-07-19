import { render, screen, checkA11y } from '@/test-utils';

import { GallerySortSelect } from '../components/GallerySortSelect';

const defaultProps = {
  value: 'newest' as const,
  onChange: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('GallerySortSelect', () => {
  it('renders the sort trigger', () => {
    render(<GallerySortSelect {...defaultProps} />);
    expect(screen.getByRole('combobox', { name: 'gallery.sort.ariaLabel' })).toBeInTheDocument();
  });

  it('displays the current value label', () => {
    render(<GallerySortSelect {...defaultProps} />);
    expect(screen.getByText('gallery.sort.newest')).toBeInTheDocument();
  });

  it('displays oldest first when selected', () => {
    render(<GallerySortSelect {...defaultProps} value="oldest" />);
    expect(screen.getByText('gallery.sort.oldest')).toBeInTheDocument();
  });

  it('displays cycle desc when selected', () => {
    render(<GallerySortSelect {...defaultProps} value="cycle-desc" />);
    expect(screen.getByText('gallery.sort.cycleDesc')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GallerySortSelect {...defaultProps} />);
    await checkA11y(container);
  });
});

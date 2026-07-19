import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import { GalleryFilterChips } from '../components/GalleryFilterChips';

const defaultProps = {
  value: 'all' as const,
  onChange: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('GalleryFilterChips', () => {
  it('renders All, Anchored, and Named chips', () => {
    render(<GalleryFilterChips {...defaultProps} />);
    expect(screen.getByRole('radio', { name: 'gallery.filters.all.label' })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'gallery.filters.anchored.label' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'gallery.filters.named.label' })).toBeInTheDocument();
  });

  it('marks the active chip as checked', () => {
    render(<GalleryFilterChips {...defaultProps} value="staked" />);
    expect(screen.getByRole('radio', { name: 'gallery.filters.anchored.label' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'gallery.filters.all.label' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('calls onChange with correct key on click', () => {
    render(<GalleryFilterChips {...defaultProps} />);
    fireEvent.click(screen.getByRole('radio', { name: 'gallery.filters.anchored.label' }));
    expect(defaultProps.onChange).toHaveBeenCalledWith('staked');
  });

  it('calls onChange with named on click', () => {
    render(<GalleryFilterChips {...defaultProps} />);
    fireEvent.click(screen.getByRole('radio', { name: 'gallery.filters.named.label' }));
    expect(defaultProps.onChange).toHaveBeenCalledWith('named');
  });

  it('calls onChange with all on click', () => {
    render(<GalleryFilterChips {...defaultProps} value="staked" />);
    fireEvent.click(screen.getByRole('radio', { name: 'gallery.filters.all.label' }));
    expect(defaultProps.onChange).toHaveBeenCalledWith('all');
  });

  it('has a radiogroup role', () => {
    render(<GalleryFilterChips {...defaultProps} />);
    expect(
      screen.getByRole('radiogroup', { name: 'gallery.filters.ariaLabel' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GalleryFilterChips {...defaultProps} />);
    await checkA11y(container);
  });
});

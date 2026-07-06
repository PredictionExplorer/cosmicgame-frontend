import { render, screen, fireEvent, checkA11y, act } from '@/test-utils';

import { GallerySearchInput } from '../components/GallerySearchInput';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const defaultProps = {
  value: '',
  onChange: jest.fn(),
  onSearch: jest.fn(),
};

describe('GallerySearchInput', () => {
  it('renders the search input', () => {
    render(<GallerySearchInput {...defaultProps} />);
    expect(screen.getByLabelText('Search NFTs')).toBeInTheDocument();
  });

  it('renders search button', () => {
    render(<GallerySearchInput {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('debounces onChange calls', () => {
    render(<GallerySearchInput {...defaultProps} />);
    const input = screen.getByLabelText('Search NFTs');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(300));
    expect(defaultProps.onChange).toHaveBeenCalledWith('hello');
  });

  it('calls onSearch immediately on enter key', () => {
    render(<GallerySearchInput {...defaultProps} />);
    const input = screen.getByLabelText('Search NFTs');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onSearch).toHaveBeenCalledWith('test');
  });

  it('calls onSearch on button click', () => {
    render(<GallerySearchInput {...defaultProps} />);
    const input = screen.getByLabelText('Search NFTs');
    fireEvent.change(input, { target: { value: 'query' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(defaultProps.onSearch).toHaveBeenCalledWith('query');
  });

  it('shows clear button when input has value', () => {
    render(<GallerySearchInput {...defaultProps} />);
    const input = screen.getByLabelText('Search NFTs');
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'text' } });
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('clears input on clear button click', () => {
    render(<GallerySearchInput {...defaultProps} />);
    const input = screen.getByLabelText('Search NFTs');
    fireEvent.change(input, { target: { value: 'text' } });
    fireEvent.click(screen.getByLabelText('Clear search'));
    expect(input).toHaveValue('');
    expect(defaultProps.onChange).toHaveBeenCalledWith('');
  });

  it('calls onChange with empty string immediately on clear', () => {
    render(<GallerySearchInput {...defaultProps} />);
    const input = screen.getByLabelText('Search NFTs');
    fireEvent.change(input, { target: { value: 'some text' } });
    act(() => jest.advanceTimersByTime(300));
    jest.clearAllMocks();
    fireEvent.change(input, { target: { value: '' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('');
  });

  it('shows result count badge when filtered', () => {
    render(<GallerySearchInput {...defaultProps} resultCount={5} totalCount={100} />);
    expect(screen.getByText('5 results')).toBeInTheDocument();
  });

  it('does not show result count badge when counts are equal', () => {
    render(<GallerySearchInput {...defaultProps} resultCount={100} totalCount={100} />);
    expect(screen.queryByText('100 results')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    jest.useRealTimers();
    const { container } = render(<GallerySearchInput {...defaultProps} />);
    await checkA11y(container);
  });
});

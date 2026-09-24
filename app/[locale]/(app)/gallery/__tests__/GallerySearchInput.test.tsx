import { act, checkA11y, fireEvent, render, screen } from '@/test-utils';

import { GallerySearchInput, SEARCH_DEBOUNCE_MS } from '../components/GallerySearchInput';

const field = () => screen.getByRole('searchbox', { name: 'search.gallery.ariaLabel' });

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('GallerySearchInput', () => {
  it('shows the search from the URL', () => {
    render(<GallerySearchInput value="numba" onCommit={jest.fn()} />);
    expect(field()).toHaveValue('numba');
  });

  it('commits after a pause in typing, not per keystroke', () => {
    const onCommit = jest.fn();
    render(<GallerySearchInput value="" onCommit={onCommit} />);
    fireEvent.change(field(), { target: { value: 'nu' } });
    fireEvent.change(field(), { target: { value: 'numba' } });
    expect(onCommit).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('numba');
  });

  it('commits at once on Enter and when cleared', () => {
    const onCommit = jest.fn();
    render(<GallerySearchInput value="" onCommit={onCommit} />);
    fireEvent.change(field(), { target: { value: '#47 ' } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onCommit).toHaveBeenLastCalledWith('#47');
    fireEvent.click(screen.getByRole('button', { name: 'search.gallery.clear' }));
    expect(onCommit).toHaveBeenLastCalledWith('');
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
    expect(onCommit).toHaveBeenCalledTimes(2);
  });

  it('keeps typing that is newer than its own commit', () => {
    const onCommit = jest.fn();
    const { rerender } = render(<GallerySearchInput value="" onCommit={onCommit} />);
    fireEvent.change(field(), { target: { value: 'num' } });
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
    fireEvent.change(field(), { target: { value: 'numba' } });
    // The first commit reaches the URL while the reader is still typing.
    rerender(<GallerySearchInput value="num" onCommit={onCommit} />);
    expect(field()).toHaveValue('numba');
  });

  it('follows a URL change it did not make (Back, "Clear all")', () => {
    const { rerender } = render(<GallerySearchInput value="numba" onCommit={jest.fn()} />);
    rerender(<GallerySearchInput value="" onCommit={jest.fn()} />);
    expect(field()).toHaveValue('');
  });

  it('has no accessibility violations', async () => {
    jest.useRealTimers();
    const { container } = render(<GallerySearchInput value="47" onCommit={jest.fn()} />);
    await checkA11y(container);
  });
});

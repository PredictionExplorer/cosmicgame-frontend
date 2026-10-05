import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import { GalleryStatusFilter } from '../components/GalleryStatusFilter';
import { GalleryViewToggle } from '../components/GalleryViewToggle';

const radio = (name: string) => screen.getByRole('radio', { name });

describe('GalleryStatusFilter', () => {
  it('marks the current status and keeps one tab stop for the group', () => {
    render(<GalleryStatusFilter value="anchored" onChange={jest.fn()} />);
    expect(radio('gallery.filters.anchored.label')).toHaveAttribute('aria-checked', 'true');
    expect(radio('gallery.filters.anchored.label')).toHaveAttribute('tabindex', '0');
    expect(radio('gallery.filters.all.label')).toHaveAttribute('tabindex', '-1');
    expect(radio('gallery.filters.named.label')).toHaveAttribute('tabindex', '-1');
  });

  it('selects with a click', () => {
    const onChange = jest.fn();
    render(<GalleryStatusFilter value="all" onChange={onChange} />);
    fireEvent.click(radio('gallery.filters.named.label'));
    expect(onChange).toHaveBeenCalledWith('named');
  });

  it('moves and selects with the arrow keys, Home and End, wrapping at the ends', () => {
    const onChange = jest.fn();
    render(<GalleryStatusFilter value="all" onChange={onChange} />);
    const all = radio('gallery.filters.all.label');
    fireEvent.keyDown(all, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('anchored');
    fireEvent.keyDown(all, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('named');
    fireEvent.keyDown(all, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('named');
    fireEvent.keyDown(all, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('all');
    fireEvent.keyDown(all, { key: 'a' });
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it('explains the selected option in words in the sheet, where there is no hover', () => {
    render(<GalleryStatusFilter value="anchored" onChange={jest.fn()} block />);
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAccessibleDescription('gallery.filters.anchored.tooltip');
    expect(screen.getByText('gallery.filters.anchored.tooltip')).toBeVisible();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GalleryStatusFilter value="all" onChange={jest.fn()} />);
    await checkA11y(container);
  });
});

describe('GalleryViewToggle', () => {
  it('names its icon-only options', () => {
    const onChange = jest.fn();
    render(<GalleryViewToggle value="grid" onChange={onChange} />);
    expect(radio('gallery.view.grid')).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(radio('gallery.view.list'));
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('shows the labels in the sheet', () => {
    render(<GalleryViewToggle value="list" onChange={jest.fn()} block />);
    expect(screen.getByText('gallery.view.list')).toBeInTheDocument();
  });
});

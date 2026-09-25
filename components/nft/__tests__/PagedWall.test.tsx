import { fireEvent, render, screen } from '@/test-utils';

import { PagedWall, clampWallPage, wallReadFailed } from '../PagedWall';

const items = Array.from({ length: 5 }, (_, index) => ({ id: index + 1 }));

function wall(props: Partial<Parameters<typeof PagedWall<{ id: number }>>[0]> = {}) {
  return (
    <PagedWall
      items={items}
      itemKey={(item) => item.id}
      renderItem={(item, { eager }) => (
        <span data-testid="work" data-eager={eager}>
          #{item.id}
        </span>
      )}
      pageSize={2}
      gridClassName="grid"
      ariaLabel="Works"
      eagerCount={1}
      {...props}
    />
  );
}

describe('wallReadFailed', () => {
  it('fails only when nothing has loaded, or the page knows an empty answer is wrong', () => {
    expect(wallReadFailed({ isError: true, data: undefined })).toBe(true);
    // A background refetch failed: the loaded wall stays up.
    expect(wallReadFailed({ isError: true, data: [] })).toBe(false);
    expect(wallReadFailed({ isError: false, data: [] }, true)).toBe(true);
    expect(wallReadFailed({ isError: false, data: [1] })).toBe(false);
  });
});

describe('clampWallPage', () => {
  it('keeps the page within the pages there are', () => {
    expect(clampWallPage(9, 5, 2)).toBe(3);
    expect(clampWallPage(0, 5, 2)).toBe(1);
    expect(clampWallPage(2, 0, 2)).toBe(1);
    expect(clampWallPage(Number.NaN, 5, 2)).toBe(1);
  });
});

describe('PagedWall', () => {
  it('hangs one page and loads only the first row of the first page eagerly', () => {
    render(wall());
    const works = screen.getAllByTestId('work');
    expect(works.map((work) => work.textContent)).toEqual(['#1', '#2']);
    expect(works.map((work) => work.dataset.eager)).toEqual(['true', 'false']);
    expect(screen.getByRole('list', { name: 'Works' })).toBeInTheDocument();
  });

  it('keeps its own page without a URL, and scrolls back to its top', () => {
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(wall());
    fireEvent.click(screen.getByRole('button', { name: 'tables.pagination.next' }));
    expect(screen.getAllByTestId('work').map((work) => work.textContent)).toEqual(['#3', '#4']);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
  });

  it('follows the page it is given, clamped, and reports a change', () => {
    const onPageChange = jest.fn();
    render(wall({ page: 7, onPageChange }));
    expect(screen.getAllByTestId('work').map((work) => work.textContent)).toEqual(['#5']);
    fireEvent.click(screen.getByRole('button', { name: 'tables.pagination.previous' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('shows the error, then the loading and empty states, in that order', () => {
    const { rerender } = render(
      wall({ error: <p>failed</p>, loading: true, loadingState: <p>loading</p> }),
    );
    expect(screen.getByText('failed')).toBeInTheDocument();
    rerender(wall({ loading: true, loadingState: <p>loading</p> }));
    expect(screen.getByText('loading')).toBeInTheDocument();
    rerender(wall({ items: [], empty: <p>nothing yet</p> }));
    expect(screen.getByText('nothing yet')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

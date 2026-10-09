import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import { GalleryPagination } from '../components/GalleryPagination';

function renderPagination(overrides: Partial<Parameters<typeof GalleryPagination>[0]> = {}) {
  const props = {
    page: 1,
    perPage: 24 as const,
    totalItems: 48,
    onPageChange: jest.fn(),
    onPerPageChange: jest.fn(),
    ...overrides,
  };
  return { ...render(<GalleryPagination {...props} />), props };
}

describe('GalleryPagination', () => {
  it('shows the ledger pager with the range and moves between pages', () => {
    const { props } = renderPagination();
    expect(screen.getByText(/tables\.pagination\.range/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'tables.pagination.next' }));
    expect(props.onPageChange).toHaveBeenCalledWith(2);
  });

  it('offers the page size only when there is more than the smallest page', () => {
    renderPagination({ totalItems: 30 });
    expect(
      screen.getByRole('combobox', { name: 'gallery.pagination.perPage' }),
    ).toBeInTheDocument();
  });

  it('renders nothing for a result that fits the smallest page', () => {
    const { container } = renderPagination({ totalItems: 9 });
    expect(container).toBeEmptyDOMElement();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderPagination();
    await checkA11y(container);
  });
});

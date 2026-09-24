import { TablePagination } from '@/components/ui/pagination';

interface CustomPaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalLength: number;
  perPage: number;
}

/**
 * @deprecated Render `<DataTable>` (`@/components/ui/data-table`), which
 * paginates itself, or `<TablePagination>` from `@/components/ui/pagination`.
 * This wrapper keeps existing tables on the shared pagination: the row range,
 * Previous and Next, and nothing at all for a single page.
 */
export const CustomPagination = ({
  page,
  setPage,
  totalLength,
  perPage,
}: CustomPaginationProps) => (
  <TablePagination page={page} pageSize={perPage} total={totalLength} onPageChange={setPage} />
);

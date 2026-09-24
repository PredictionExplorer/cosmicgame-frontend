/**
 * @deprecated Import from `@/components/ui/data-table`, the table system's
 * home. This path re-exports it so existing imports keep working.
 */
export {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
  type SortDirection,
} from '@/components/ui/data-table';

/** @deprecated Density is a `DataTable` prop (`density`), not a reader toggle. */
export type Density = 'comfortable' | 'compact';

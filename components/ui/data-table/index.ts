/**
 * The table system: `<DataTable>` with column kinds, on the ledger
 * primitives in `@/components/ui/responsive-table` and the layout in
 * styles/tables.css. docs/design-system.md → "Tables" describes it.
 */
export {
  DataTable,
  nextSort,
  type DataTableCellContext,
  type DataTableColumn,
  type DataTableProps,
} from './data-table';
export {
  COLUMN_KINDS,
  COMPACT_MAX_COLUMNS,
  compareRows,
  compareSortValues,
  isBlankValue,
  phoneLayoutFor,
  type ColumnKind,
  type ColumnKindSpec,
  type PhoneColumn,
  type SortDirection,
  type SortValue,
} from './column-kinds';
export { ExternalTableLink, TableLink, TableTag, TxProofLink, YouBadge } from './cells';
export { KindValue } from './kind-value';
export { DataTableWidth, useDataTableWidth, type DataTableWidthMode } from './table-width';
export {
  DEFAULT_PAGE_SIZE,
  PHONE_PAGE_SIZE,
  usePhoneLayout,
  useTablePageSize,
} from './use-page-size';

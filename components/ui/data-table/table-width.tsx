'use client';

import * as React from 'react';

/**
 * How wide a DataTable runs on a wide screen. `auto` keeps a short ledger
 * (four columns or fewer) at one reading width, 56rem; `fill` runs the full
 * width of its container.
 */
export type DataTableWidthMode = 'auto' | 'fill';

const DataTableWidthContext = React.createContext<DataTableWidthMode | undefined>(undefined);

/**
 * One width for every DataTable inside it, set by the page or section that
 * stacks them, so ledgers of different column counts share a right edge
 * (a tab whose anchor ledger has five columns and whose anchored NFTs have
 * four). A table's own `width` prop still wins.
 */
export function DataTableWidth({
  value,
  children,
}: {
  value: DataTableWidthMode;
  children: React.ReactNode;
}) {
  return <DataTableWidthContext.Provider value={value}>{children}</DataTableWidthContext.Provider>;
}

/** The width a DataTable takes: its own, else its section's, else `auto`. */
export function useDataTableWidth(own: DataTableWidthMode | undefined): DataTableWidthMode {
  const shared = React.useContext(DataTableWidthContext);
  return own ?? shared ?? 'auto';
}

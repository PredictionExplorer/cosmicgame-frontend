import type { ReactNode } from 'react';

import type { LedgerStateProps } from '@/components/tables/ledger-props';

/**
 * What every anchoring ledger passes straight to `<DataTable>`: the shared
 * query state and framing, plus the line under its title and the title of
 * its error state.
 */
export interface AnchoringLedgerProps extends LedgerStateProps {
  /** One sentence under the ledger's title. */
  description?: ReactNode;
  /** The error state's title, when the ledger stands for a whole section. */
  errorTitle?: string;
  /** Rows per page, when the ledger shares its page with others. Default 20, or 10 on a phone. */
  pageSize?: number;
}

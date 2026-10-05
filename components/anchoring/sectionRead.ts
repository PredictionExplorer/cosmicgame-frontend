/**
 * The read behind one section of an anchoring panel: still loading, or
 * failed with a retry. Each section shows its own state, so one slow or
 * failed list never holds (or empties) the others.
 */
export interface SectionRead {
  loading?: boolean;
  failed?: boolean;
  onRetry?: () => void;
}

/** A section whose data is in hand. */
export const SECTION_READY: SectionRead = {};

/**
 * A query's state as a section read. A refetch that fails while earlier data
 * is still shown is not a failure of the section: only a read with nothing to
 * show is.
 */
export function sectionRead(query: {
  data?: unknown;
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
}): SectionRead {
  return {
    loading: query.isLoading,
    failed: query.isError && query.data === undefined,
    onRetry: () => void query.refetch(),
  };
}

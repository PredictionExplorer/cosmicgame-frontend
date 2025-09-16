import React, { useMemo, ChangeEvent } from "react";
import { Box, Pagination, TextField, Typography } from "@mui/material";

/**
 * Props for the {@link CustomPagination} component.
 */
interface CustomPaginationProps {
  /** Currently selected page (1‑based) */
  page: number;
  /** Callback invoked when the page changes */
  setPage: (page: number) => void;
  /** Total number of items in the dataset */
  totalLength: number;
  /** Items shown per page */
  perPage: number;
}

/**
 * Displays a MUI {@link Pagination} control with an optional
 * "Go to page" numeric input when lots of pages are available.
 *
 * The numeric input appears only when the calculated `pageCount`
 * is **≥ 30**, to avoid visual clutter on small datasets.
 */
export const CustomPagination: React.FC<CustomPaginationProps> = ({
  page,
  setPage,
  totalLength,
  perPage,
}) => {
  /**
   * Total number of pages — recomputed only when the
   * length of the dataset or the page size changes.
   */
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(totalLength / perPage)),
    [totalLength, perPage]
  );

  /** Whether to show the "Go to page" numeric input. */
  const showGoToInput = pageCount >= 30;

  /**
   * Parses the value from the text field and clamps it
   * between **1** and **pageCount** to avoid invalid pages.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) return;

    // Clamp value to valid range
    const nextPage = Math.min(Math.max(value, 1), pageCount);
    setPage(nextPage);
  };

  return (
    <Box
      display="flex"
      justifyContent={showGoToInput ? "end" : "center"}
      alignItems="center"
      flexWrap="wrap"
      mt={2}
    >
      {/* Standard pagination control */}
      <Pagination
        color="primary"
        page={page}
        onChange={(_, p) => setPage(p)}
        count={pageCount}
        hideNextButton
        hidePrevButton
        shape="rounded"
      />

      {/* Direct page selector, shown only for large datasets */}
      {showGoToInput && (
        <Box sx={{ display: "flex", alignItems: "center", ml: 4, my: 1 }}>
          <Typography id="go_to_page" sx={{ mr: 1 }}>
            Go to page:
          </Typography>
          <TextField
            type="number"
            size="small"
            value={page}
            sx={{ maxWidth: 100 }}
            onChange={handleInputChange}
            inputProps={{ min: 1, max: pageCount }}
            aria-labelledby="go_to_page"
          />
        </Box>
      )}
    </Box>
  );
};

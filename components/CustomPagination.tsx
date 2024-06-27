import { Box, Pagination, TextField, Typography } from "@mui/material";

export const CustomPagination = ({ page, setPage, totalLength, perPage }) => {
  return (
    <Box
      display="flex"
      justifyContent={Math.ceil(totalLength / perPage) >= 30 ? "end" : "center"}
      alignItems="center"
      flexWrap="wrap"
      mt={2}
    >
      <Pagination
        color="primary"
        page={page}
        onChange={(_e, p) => setPage(p)}
        count={Math.ceil(totalLength / perPage)}
        hideNextButton
        hidePrevButton
        shape="rounded"
      />
      {Math.ceil(totalLength / perPage) >= 30 && (
        <Box sx={{ display: "flex", alignItems: "center", ml: 4, my: 1 }}>
          <Typography sx={{ mr: 1 }}>Go to Page:</Typography>
          <TextField
            type="number"
            size="small"
            value={page}
            sx={{ maxWidth: "100px" }}
            onChange={(e) => setPage(Number(e.target.value) || 1)}
          />
        </Box>
      )}
    </Box>
  );
};

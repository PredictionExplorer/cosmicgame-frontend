import { Box, Grid, Tabs, Tab, Typography } from '@mui/material';

import DonatedNFT from '../donations/DonatedNFT';
import DonatedERC20Table from '../donations/DonatedERC20Table';
import { CustomPagination } from '../common/CustomPagination';
import type { DonatedNFT as DonatedNFTType } from '../../services/api/types';
import type { DonatedERC20Token } from '../donations/DonatedERC20Table';

import { CustomTabPanel } from './CustomTabPanel';

interface DonatedTokensSectionProps {
  donatedNFTs: DonatedNFTType[];
  donatedERC20Tokens: DonatedERC20Token[];
  donatedTokensTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  curPage: number;
  setCurPage: (page: number) => void;
  perPage: number;
}

export function DonatedTokensSection({
  donatedNFTs,
  donatedERC20Tokens,
  donatedTokensTab,
  onTabChange,
  curPage,
  setCurPage,
  perPage,
}: DonatedTokensSectionProps) {
  const gridLayout =
    donatedNFTs.length > 16
      ? { xs: 6, sm: 3, md: 2, lg: 2 }
      : donatedNFTs.length > 9
        ? { xs: 6, sm: 4, md: 3, lg: 3 }
        : { xs: 12, sm: 6, md: 4, lg: 4 };

  return (
    <Box marginTop={10}>
      <Typography variant="h6">DONATED TOKENS FOR CURRENT ROUND</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="fullWidth" value={donatedTokensTab} onChange={onTabChange}>
          <Tab label="ERC721 Tokens" />
          <Tab label="ERC20 Tokens" />
        </Tabs>
      </Box>
      <CustomTabPanel value={donatedTokensTab} index={0}>
        {donatedNFTs.length > 0 ? (
          <>
            <Grid container spacing={2} mt={2}>
              {donatedNFTs.map((nft) => (
                <Grid
                  key={nft.RecordId}
                  size={{
                    xs: gridLayout.xs,
                    sm: gridLayout.sm,
                    md: gridLayout.md,
                    lg: gridLayout.lg,
                  }}
                >
                  <DonatedNFT nft={nft} />
                </Grid>
              ))}
            </Grid>
            <CustomPagination
              page={curPage}
              setPage={setCurPage}
              totalLength={donatedNFTs.length}
              perPage={perPage}
            />
          </>
        ) : (
          <Typography>No ERC721 tokens were donated on this round.</Typography>
        )}
      </CustomTabPanel>
      <CustomTabPanel value={donatedTokensTab} index={1}>
        <DonatedERC20Table list={donatedERC20Tokens} handleClaim={null} />
      </CustomTabPanel>
    </Box>
  );
}

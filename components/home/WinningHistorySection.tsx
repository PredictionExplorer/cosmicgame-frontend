import { Box, Container, Typography } from '@mui/material';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

import WinningHistoryTable from '../tables/WinningHistoryTable';
import type { WinningHistoryEntry } from '../tables/WinningHistoryTable';
import TwitterShareButton from '../common/TwitterShareButton';
import TwitterPopup from '../common/TwitterPopup';
import { getAssetsUrl } from '../../utils';

interface WinningHistorySectionProps {
  claimHistory: WinningHistoryEntry[] | null;
  imageOpen: boolean;
  setImageOpen: (open: boolean) => void;
  bannerTokenSeed: string;
  twitterPopupOpen: boolean;
  setTwitterPopupOpen: (open: boolean) => void;
  setTwitterHandle: (handle: string) => void;
}

export function WinningHistorySection({
  claimHistory,
  imageOpen,
  setImageOpen,
  bannerTokenSeed,
  twitterPopupOpen,
  setTwitterPopupOpen,
  setTwitterHandle,
}: WinningHistorySectionProps) {
  const imageSrc =
    bannerTokenSeed === ''
      ? '/images/qmark.png'
      : getAssetsUrl(`cosmicsignature/${bannerTokenSeed}.png`);

  return (
    <>
      <Container>
        <Box margin="100px 0">
          <Typography variant="h4" textAlign="center" mb={6}>
            History of Winnings
          </Typography>
          {claimHistory === null ? (
            <Typography variant="h6">Loading...</Typography>
          ) : (
            <WinningHistoryTable winningHistory={claimHistory} />
          )}
        </Box>
        <Box margin="100px 0">
          <Typography variant="h4" textAlign="center" mb={6}>
            Create a Twitter Post and Refer People
          </Typography>
          <TwitterShareButton />
        </Box>
      </Container>
      <Lightbox open={imageOpen} close={() => setImageOpen(false)} slides={[{ src: imageSrc }]} />
      <TwitterPopup
        open={twitterPopupOpen}
        setOpen={setTwitterPopupOpen}
        setTwitterHandle={setTwitterHandle}
      />
    </>
  );
}

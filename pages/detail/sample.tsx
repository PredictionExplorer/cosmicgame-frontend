import { useState, MouseEvent } from 'react';
import {
  Box,
  Button,
  CardActionArea,
  Container,
  Dialog,
  DialogContent,
  Grid,
  Menu,
  Typography,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Lightbox from 'react-awesome-lightbox';

import NFTImage from '../../components/nft/NFTImage';
import {
  MainWrapper,
  NFTInfoWrapper,
  PrimaryMenuItem,
  SectionWrapper,
  StyledCard,
} from '../../components/styled';
import 'react-awesome-lightbox/build/style.css';
import NFTVideo from '../../components/nft/NFTVideo';
import { getAssetsUrl, getOriginUrl } from '../../utils';

const SampleDetail = () => {
  // State for modal video visibility
  const [isVideoOpen, setVideoOpen] = useState(false);
  // State for image lightbox visibility
  const [isImageOpen, setImageOpen] = useState(false);
  // State to hold currently selected video path
  const [videoPath, setVideoPath] = useState<string | null>(null);
  // State for anchor element used in menu positioning
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const image = getAssetsUrl('cosmicsignature/sample.png');
  const video = getAssetsUrl('cosmicsignature/sample.mp4');

  // Opens the video modal and sets video source
  const handlePlayVideo = (path: string) => {
    setVideoPath(path);
    setVideoOpen(true);
  };

  // Opens dropdown menu
  const handleMenuOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  // Closes dropdown menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainWrapper maxWidth={false} sx={{ px: 0 }}>
      <Container>
        <SectionWrapper>
          <Grid container spacing={4} justifyContent="center">
            <Grid size={{ xs: 12, sm: 8, md: 6 }}>
              <StyledCard>
                <CardActionArea onClick={() => setImageOpen(true)}>
                  <NFTImage src={image} />
                  <NFTInfoWrapper sx={{ width: 'calc(100% - 40px)' }}>
                    <Typography variant="subtitle1" sx={{ color: '#FFFFFF', textAlign: 'center' }}>
                      Sample NFT
                    </Typography>
                  </NFTInfoWrapper>
                </CardActionArea>
              </StyledCard>

              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Button variant="text" fullWidth onClick={handleMenuOpen}>
                      Copy link
                      {anchorEl ? <ExpandLess /> : <ExpandMore />}
                    </Button>
                    <Menu
                      elevation={0}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                    >
                      {[
                        { label: 'Video', link: getOriginUrl(video) },
                        { label: 'Image', link: getOriginUrl(image) },
                        { label: 'Detail Page', link: window.location.href },
                      ].map(({ label, link }) => (
                        <CopyToClipboard key={label} text={link}>
                          <PrimaryMenuItem onClick={handleMenuClose}>
                            <Typography>{label}</Typography>
                          </PrimaryMenuItem>
                        </CopyToClipboard>
                      ))}
                    </Menu>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 8, md: 6 }}>
              <Box sx={{ mb: 1, display: 'flex' }}>
                <Typography color="primary">Token Name:</Typography>&nbsp;
                <Typography>Sample NFT</Typography>
              </Box>
              <Box sx={{ mb: 1, display: 'flex' }}>
                <Typography color="primary">Seed:</Typography>&nbsp;
                <Typography
                  fontFamily="monospace"
                  sx={{
                    display: 'inline-block',
                    wordWrap: 'break-word',
                    width: '32ch',
                  }}
                >
                  3c8510e4cbe870a700d7c44b05f2cdf84824fcd8108aaaafd7952222590b31de
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box mt="80px">
            <NFTVideo image_thumb={image} onClick={() => handlePlayVideo(video)} />
          </Box>

          {/* Image Lightbox */}
          {isImageOpen && <Lightbox image={image} onClose={() => setImageOpen(false)} />}

          {/* Video player dialog */}
          <Dialog
            open={isVideoOpen}
            onClose={() => {
              setVideoOpen(false);
              setVideoPath(null);
            }}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { bgcolor: 'black', boxShadow: 'none' } }}
          >
            <DialogContent sx={{ p: 0, position: 'relative', lineHeight: 0 }}>
              <Button
                onClick={() => {
                  setVideoOpen(false);
                  setVideoPath(null);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'white',
                  zIndex: 1,
                  minWidth: 'auto',
                  fontSize: '1.5rem',
                }}
              >
                ✕
              </Button>
              {videoPath && (
                <video
                  src={videoPath}
                  controls
                  autoPlay
                  style={{ width: '100%', maxHeight: '80vh', display: 'block' }}
                />
              )}
            </DialogContent>
          </Dialog>
        </SectionWrapper>
      </Container>
    </MainWrapper>
  );
};

// Server-side props for page metadata
export async function getServerSideProps() {
  const title = 'Sample Token | Cosmic Signature Token';
  const description =
    'Discover the unique attributes and ownership history of Cosmic Signature Token, an exclusive digital collectible from the Cosmic Signature game.';
  const imageUrl = getAssetsUrl('cosmicsignature/sample.png');

  const openGraphData = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: imageUrl },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ];

  return { props: { title, description, openGraphData } };
}

export default SampleDetail;

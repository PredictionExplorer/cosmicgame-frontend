'use client';

import { useState, MouseEvent } from 'react';
import { Box, Button, CardActionArea, Container, Grid, Menu, Typography } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Lightbox from 'yet-another-react-lightbox';

import NFTImage from '@/components/nft/NFTImage';
import {
  MainWrapper,
  NFTInfoWrapper,
  PrimaryMenuItem,
  SectionWrapper,
  StyledCard,
} from '@/components/styled';
import { useClipboard } from '@/hooks/useClipboard';
import 'yet-another-react-lightbox/styles.css';
import NFTVideo from '@/components/nft/NFTVideo';
import VideoPlayerDialog from '@/components/common/VideoPlayerDialog';
import { getAssetsUrl, getOriginUrl } from '@/utils';

const SampleDetailPage = () => {
  const { copy } = useClipboard();
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
                        <PrimaryMenuItem
                          key={label}
                          onClick={() => {
                            copy(link);
                            handleMenuClose();
                          }}
                        >
                          <Typography>{label}</Typography>
                        </PrimaryMenuItem>
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
          <Lightbox
            open={isImageOpen}
            close={() => setImageOpen(false)}
            slides={[{ src: image }]}
          />

          <VideoPlayerDialog
            open={isVideoOpen}
            videoPath={videoPath}
            onClose={() => {
              setVideoOpen(false);
              setVideoPath(null);
            }}
          />
        </SectionWrapper>
      </Container>
    </MainWrapper>
  );
};

export default SampleDetailPage;

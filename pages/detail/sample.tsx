import { useState, MouseEvent } from "react";
import {
  MainWrapper,
  NFTInfoWrapper,
  PrimaryMenuItem,
  SectionWrapper,
  StyledCard,
} from "../../components/styled";
import {
  Box,
  Button,
  CardActionArea,
  Container,
  Grid,
  Menu,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import NFTImage from "../../components/NFTImage";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";
import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.min.css";
import NFTVideo from "../../components/NFTVideo";
import { getAssetsUrl, getOriginUrl } from "../../utils";

const SampleDetail = () => {
  // State for modal video visibility
  const [isVideoOpen, setVideoOpen] = useState(false);
  // State for image lightbox visibility
  const [isImageOpen, setImageOpen] = useState(false);
  // State to hold currently selected video path
  const [videoPath, setVideoPath] = useState<string | null>(null);
  // State for anchor element used in menu positioning
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const image = getAssetsUrl("cosmicsignature/sample.png");
  const video = getAssetsUrl("cosmicsignature/sample.mp4");

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
            <Grid item xs={12} sm={8} md={6}>
              <StyledCard>
                <CardActionArea onClick={() => setImageOpen(true)}>
                  <NFTImage src={image} />
                  <NFTInfoWrapper sx={{ width: "calc(100% - 40px)" }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "#FFFFFF", textAlign: "center" }}
                    >
                      Sample NFT
                    </Typography>
                  </NFTInfoWrapper>
                </CardActionArea>
              </StyledCard>

              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button variant="text" fullWidth onClick={handleMenuOpen}>
                      Copy link
                      {anchorEl ? <ExpandLess /> : <ExpandMore />}
                    </Button>
                    <Menu
                      elevation={0}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                    >
                      {[
                        { label: "Video", link: getOriginUrl(video) },
                        { label: "Image", link: getOriginUrl(image) },
                        { label: "Detail Page", link: window.location.href },
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

            <Grid item xs={12} sm={8} md={6}>
              <Box sx={{ mb: 1, display: "flex" }}>
                <Typography color="primary">Token Name:</Typography>&nbsp;
                <Typography>Sample NFT</Typography>
              </Box>
              <Box sx={{ mb: 1, display: "flex" }}>
                <Typography color="primary">Seed:</Typography>&nbsp;
                <Typography
                  fontFamily="monospace"
                  sx={{
                    display: "inline-block",
                    wordWrap: "break-word",
                    width: "32ch",
                  }}
                >
                  3c8510e4cbe870a700d7c44b05f2cdf84824fcd8108aaaafd7952222590b31de
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box mt="80px">
            <NFTVideo
              image_thumb={image}
              onClick={() => handlePlayVideo(video)}
            />
          </Box>

          {/* Image Lightbox */}
          {isImageOpen && (
            <Lightbox image={image} onClose={() => setImageOpen(false)} />
          )}

          {/* Video Modal */}
          <ModalVideo
            channel="custom"
            url={videoPath || ""}
            isOpen={isVideoOpen}
            onClose={() => setVideoOpen(false)}
          />
        </SectionWrapper>
      </Container>
    </MainWrapper>
  );
};

// Server-side props for page metadata
export async function getServerSideProps() {
  const title = "Sample Token | Cosmic Signature Token";
  const description =
    "Discover the unique attributes and ownership history of Cosmic Signature Token, an exclusive digital collectible from the Cosmic Signature game.";
  const imageUrl = getAssetsUrl("cosmicsignature/sample.png");

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData } };
}

export default SampleDetail;

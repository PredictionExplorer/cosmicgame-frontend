import { useState } from "react";
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
import { getAssetsUrl } from "../../utils";

const SampleDetail = () => {
  const [open, setOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [videoPath, setVideoPath] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const image = getAssetsUrl("cosmicsignature/sample.png");
  const video = getAssetsUrl("cosmicsignature/sample.mp4");
  const handlePlay = (videoPath) => {
    setVideoPath(videoPath);
    setOpen(true);
  };
  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = (e) => {
    setAnchorEl(null);
  };
  return (
    <MainWrapper
      maxWidth={false}
      style={{
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
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
                      <CopyToClipboard text={video}>
                        <PrimaryMenuItem onClick={handleMenuClose}>
                          <Typography>Video</Typography>
                        </PrimaryMenuItem>
                      </CopyToClipboard>
                      <CopyToClipboard text={image}>
                        <PrimaryMenuItem onClick={handleMenuClose}>
                          <Typography>Image</Typography>
                        </PrimaryMenuItem>
                      </CopyToClipboard>
                      <CopyToClipboard text={window.location.href}>
                        <PrimaryMenuItem onClick={handleMenuClose}>
                          <Typography>Detail Page</Typography>
                        </PrimaryMenuItem>
                      </CopyToClipboard>
                    </Menu>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} sm={8} md={6}>
              <Box sx={{ mb: 1, display: "flex" }}>
                <Typography color="primary" component="span">
                  Token Name:
                </Typography>
                &nbsp;
                <Typography component="span">Sample NFT</Typography>
              </Box>
              <Box sx={{ mb: 1, display: "flex" }}>
                <Typography color="primary" component="span">
                  Seed:
                </Typography>
                &nbsp;
                <Typography
                  fontFamily="monospace"
                  component="span"
                  sx={{
                    fontFamily: "monospace",
                    display: "inline-block",
                    wordWrap: "break-word",
                    width: "32ch",
                  }}
                >
                  {
                    "3c8510e4cbe870a700d7c44b05f2cdf84824fcd8108aaaafd7952222590b31de"
                  }
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box mt="80px">
            <NFTVideo image_thumb={image} onClick={() => handlePlay(video)} />
          </Box>
          {imageOpen && (
            <Lightbox image={image} onClose={() => setImageOpen(false)} />
          )}
          <ModalVideo
            channel="custom"
            url={videoPath}
            isOpen={open}
            onClose={() => setOpen(false)}
          />
        </SectionWrapper>
      </Container>
    </MainWrapper>
  );
};

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
  return {
    props: { title, description, openGraphData },
  };
}

export default SampleDetail;

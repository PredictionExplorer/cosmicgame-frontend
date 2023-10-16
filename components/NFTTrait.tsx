import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  CardActionArea,
  Button,
  TextField,
  Grid,
  Link,
  Container,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";

import { CopyToClipboard } from "react-copy-to-clipboard";
import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";

import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.min.css";

import NFTVideo from "./NFTVideo";
import { useActiveWeb3React } from "../hooks/web3";
import { formatId } from "../utils";
import { StyledCard, SectionWrapper, NFTInfoWrapper } from "./styled";
import {
  ArrowBack,
  ArrowForward,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import useCosmicSignatureContract from "../hooks/useCosmicSignatureContract";
import NFTImage from "./NFTImage";
import { NameHistoryTable } from "./NameHistoryTable";
import { TransferHistoryTable } from "./TransferHistoryTable";
import api from "../services/api";

const NFTTrait = ({ nft, prizeInfo, numCSTokenMints }) => {
  const fileName = nft.TokenId.toString().padStart(6, "0");
  const image = `https://cosmic-game2.s3.us-east-2.amazonaws.com/${fileName}.png`;
  const video = `https://cosmic-game2.s3.us-east-2.amazonaws.com/${fileName}.mp4`;
  const [open, setOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [videoPath, setVideoPath] = useState(null);
  const [address, setAddress] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [notification, setNotification] = useState({
    text: "",
    visible: false,
  });
  const [tokenName, setTokenName] = useState(nft.TokenName);
  const [nameHistory, setNameHistory] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);

  const router = useRouter();
  const nftContract = useCosmicSignatureContract();
  const { account } = useActiveWeb3React();

  const handlePlay = (videoPath) => {
    fetch(videoPath).then((res) => {
      if (res.ok) {
        setVideoPath(videoPath);
        setOpen(true);
      } else {
        setNotification({
          visible: true,
          text: "Video is being generated, come back later!",
        });
      }
    });
  };

  const handleTransfer = async () => {
    try {
      await nftContract
        .transferFrom(account, address, nft.TokenId)
        .then((tx) => tx.wait());

      router.reload();
    } catch (err) {
      console.log(err);
      setNotification({
        text: "Please input the valid address for the token receiver!",
        visible: true,
      });
    }
  };

  const handleSetTokenName = async () => {
    try {
      await nftContract
        .setTokenName(nft.TokenId, tokenName)
        .then((tx) => tx.wait());
      setTimeout(async () => {
        await fetchNameHistory();
        setNotification({
          text: "The token name has been changed successfully!",
          visible: true,
        });
      }, 1000);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClearName = async () => {
    try {
      await nftContract.setTokenName(nft.TokenId, "").then((tx) => tx.wait());
      setTimeout(async () => {
        await fetchNameHistory();
        setNotification({
          text: "The token name has been cleared successfully!",
          visible: true,
        });
      }, 1000);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePrev = () =>
    router.push(`/detail/${Math.max(nft.TokenId - 1, 0)}`);

  const handleNext = async () => {
    const totalSupply = await nftContract.totalSupply();
    router.push(
      `/detail/${Math.min(nft.TokenId + 1, totalSupply.toNumber() - 1)}`
    );
  };

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    setAnchorEl(null);
  };

  const convertTimestampToDateTime = (timestamp: any) => {
    var date_ob = new Date(timestamp * 1000);
    var year = date_ob.getFullYear();
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var date = ("0" + date_ob.getDate()).slice(-2);
    var hours = ("0" + date_ob.getHours()).slice(-2);
    var minutes = ("0" + date_ob.getMinutes()).slice(-2);
    var seconds = ("0" + date_ob.getSeconds()).slice(-2);
    var result = `${month}/${date}/${year} ${hours}:${minutes}:${seconds}`;
    return result;
  };

  const fetchNameHistory = async () => {
    const history = await api.get_name_history(nft.TokenId);
    setNameHistory(history);
  };
  const fetchTransferHistory = async () => {
    const history = await api.get_transfer_history(nft.TokenId);
    setTransferHistory(history);
  };

  useEffect(() => {
    fetchNameHistory();
    fetchTransferHistory();
    setTokenName(nft.TokenName);
  }, [nft]);

  return (
    <Container>
      <SectionWrapper>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          autoHideDuration={10000}
          open={notification.visible}
          onClose={() => setNotification({ text: "", visible: false })}
        >
          <Alert severity="error" variant="filled">
            {notification.text}
          </Alert>
        </Snackbar>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
            <StyledCard>
              <CardActionArea onClick={() => setImageOpen(true)}>
                <NFTImage src={image} />
                <NFTInfoWrapper>
                  <Typography variant="body1" sx={{ color: "#FFFFFF" }}>
                    {formatId(nft.TokenId)}
                  </Typography>
                </NFTInfoWrapper>
                {nameHistory.length > 0 && (
                  <NFTInfoWrapper sx={{ width: "calc(100% - 40px)" }}>
                    <Typography
                      variant="body1"
                      sx={{ color: "#FFFFFF", textAlign: "center" }}
                    >
                      {nameHistory[0].TokenName}
                    </Typography>
                  </NFTInfoWrapper>
                )}
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
                      <MenuItem onClick={handleMenuClose}>Video</MenuItem>
                    </CopyToClipboard>
                    <CopyToClipboard text={image}>
                      <MenuItem onClick={handleMenuClose}>Image</MenuItem>
                    </CopyToClipboard>
                    <CopyToClipboard text={window.location.href}>
                      <MenuItem onClick={handleMenuClose}>Detail Page</MenuItem>
                    </CopyToClipboard>
                  </Menu>
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ArrowBack />}
                        onClick={handlePrev}
                        disabled={nft.TokenId === 0}
                      >
                        Prev
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        endIcon={<ArrowForward />}
                        onClick={handleNext}
                        disabled={nft.TokenId === numCSTokenMints - 1}
                      >
                        Next
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} sm={8} md={6}>
            {nft.TimeStamp && (
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Minted Date:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {convertTimestampToDateTime(nft.TimeStamp)}
                </Typography>
              </Box>
            )}
            <Box mb={1}>
              <Typography color="primary" component="span">
                Winner:
              </Typography>
              &nbsp;
              <Link style={{ color: "#fff" }} href={`/user/${nft.WinnerAddr}`}>
                <Typography fontFamily="monospace" component="span">
                  {nft.WinnerAddr}
                </Typography>
              </Link>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Owner:
              </Typography>
              &nbsp;
              <Link
                style={{ color: "#fff" }}
                href={`/user/${nft.CurOwnerAddr}`}
              >
                <Typography fontFamily="monospace" component="span">
                  {nft.CurOwnerAddr}
                </Typography>
              </Link>
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
                {nft.Seed}
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Prize Type:
              </Typography>
              &nbsp;
              <Typography component="span">
                {nft.RecordType === 1
                  ? "Raffle Winner"
                  : `Round Winner (round #${nft.RoundNum})`}
              </Typography>
            </Box>
            {nft.RecordType === 3 && (
              <Box mb={3}>
                <Typography color="primary" component="span">
                  Prize Amount:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {prizeInfo.AmountEth.toFixed(4)} ETH
                </Typography>
              </Box>
            )}
            <Box mt={6}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/prize/${nft.RoundNum}`)}
              >
                View Round Details
              </Button>
            </Box>
            <Box>
              {account === nft.CurOwnerAddr && (
                <>
                  <Box display="flex" mt={3}>
                    <TextField
                      variant="filled"
                      color="secondary"
                      placeholder="Enter address here"
                      fullWidth
                      size="small"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={handleTransfer}
                      endIcon={<ArrowForward />}
                      sx={{ ml: 1 }}
                      disabled={!address}
                    >
                      Transfer
                    </Button>
                  </Box>
                  <Box mt={3}>
                    <Typography variant="h6" align="left">
                      {nft.TokenName
                        ? "Rename the token"
                        : "Set a name to the token"}
                    </Typography>
                    <Box display="flex">
                      <TextField
                        variant="filled"
                        color="secondary"
                        placeholder="Enter token name here"
                        value={tokenName}
                        size="small"
                        fullWidth
                        sx={{ flex: 1 }}
                        onChange={(e) => setTokenName(e.target.value)}
                      />
                      <Button
                        color="secondary"
                        variant="contained"
                        onClick={handleSetTokenName}
                        sx={{ ml: 1, whiteSpace: "nowrap" }}
                        disabled={!tokenName}
                      >
                        {nft.TokenName === "" ? "Set Name" : "Change Name"}
                      </Button>
                      {tokenName && (
                        <Button
                          color="secondary"
                          variant="contained"
                          onClick={handleClearName}
                          sx={{ ml: 1, whiteSpace: "nowrap" }}
                        >
                          Clear name
                        </Button>
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
        {nameHistory.length !== 0 && (
          <Box mt="40px">
            <Typography variant="h6" mb={2}>
              History of Name Changes
            </Typography>
            <NameHistoryTable list={nameHistory} />
          </Box>
        )}
        {transferHistory.length !== 0 && !transferHistory[0].TransferType && (
          <Box mt="40px">
            <Typography variant="h6" mb={2}>
              History of Ownership Changes
            </Typography>
            <TransferHistoryTable list={transferHistory} />
          </Box>
        )}
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
  );
};

export default NFTTrait;

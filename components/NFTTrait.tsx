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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";

import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.min.css";

import NFTVideo from "./NFTVideo";
import { useActiveWeb3React } from "../hooks/web3";
import { convertTimestampToDateTime, formatId } from "../utils";
import {
  StyledCard,
  SectionWrapper,
  NFTInfoWrapper,
  PrimaryMenuItem,
} from "./styled";
import {
  ArrowBack,
  ArrowForward,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import useCosmicSignatureContract from "../hooks/useCosmicSignatureContract";
import NFTImage from "./NFTImage";
import NameHistoryTable from "./NameHistoryTable";
import { TransferHistoryTable } from "./TransferHistoryTable";
import api from "../services/api";
import { useNotification } from "../contexts/NotificationContext";

const NFTTrait = ({ tokenId }) => {
  const [image, setImage] = useState("/images/qmark.png");
  const [video, setVideo] = useState("");
  const [open, setOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [videoPath, setVideoPath] = useState(null);
  const [address, setAddress] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nft, setNft] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [tokenName, setTokenName] = useState("");
  const [nameHistory, setNameHistory] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();
  const nftContract = useCosmicSignatureContract();
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();

  const BASE_URL = "https://cosmic-game2.s3.us-east-2.amazonaws.com";

  const handleClickTransfer = async () => {
    const { ethereum } = window;
    try {
      const txCount = await ethereum.request({
        method: "eth_getTransactionCount",
        params: [address, "latest"],
      });
      if (Number(txCount) === 0) {
        setOpenDialog(true);
      } else {
        await handleTransfer();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handlePlay = async (videoUrl) => {
    try {
      const res = await fetch(videoUrl, { method: "HEAD" });
      if (res.ok) {
        setVideoPath(videoUrl);
        setOpen(true);
      } else {
        setNotification({
          visible: true,
          type: "info",
          text: "Video is being generated, come back later!",
        });
      }
    } catch (error) {
      setNotification({
        visible: true,
        type: "info",
        text: "Video is being generated, come back later!",
      });
    }
  };

  const handleTransfer = async () => {
    handleCloseDialog();
    try {
      const tx = await nftContract.transferFrom(account, address, tokenId);
      await tx.wait();
      await Promise.all([fetchCSTInfo(), fetchTransferHistory()]);
      setAddress("");
    } catch (err) {
      console.error(err);
      if (err.code !== 4001) {
        setNotification({
          text: "Please input a valid address for the token receiver!",
          type: "error",
          visible: true,
        });
      }
    }
  };

  const handleSetTokenName = async () => {
    try {
      const tx = await nftContract.setNftName(tokenId, tokenName);
      await tx.wait();
      await Promise.all([fetchCSTInfo(), fetchNameHistory()]);
      setTokenName("");
      setNotification({
        text: "The token name has been changed successfully!",
        type: "success",
        visible: true,
      });
    } catch (err) {
      console.error(err);
      const msg =
        err?.data?.message || "An error occurred while setting the token name.";
      setNotification({
        visible: true,
        type: "error",
        text: msg,
      });
    }
  };

  const handleClearName = async () => {
    try {
      const tx = await nftContract.setNftName(tokenId, "");
      await tx.wait();
      await Promise.all([fetchCSTInfo(), fetchNameHistory()]);
      setTokenName("");
      setNotification({
        text: "The token name has been cleared successfully!",
        type: "success",
        visible: true,
      });
    } catch (err) {
      console.error(err);
      const msg =
        err?.data?.message ||
        "An error occurred while clearing the token name.";
      setNotification({
        visible: true,
        type: "error",
        text: msg,
      });
    }
  };

  const handleChange = (e) => {
    let name = e.target.value;
    let len = 0;
    let i;
    for (i = 0; i < name.length; i++) {
      if (name.charCodeAt(i) > 255) {
        len += 3;
      } else {
        len++;
      }
      if (len > 32) {
        i--;
        break;
      }
    }
    setTokenName(name.slice(0, i));
  };

  const handlePrev = () => router.push(`/detail/${Math.max(tokenId - 1, 0)}`);
  const handleNext = async () => {
    const totalSupply = await nftContract.totalSupply();
    router.push(`/detail/${Math.min(tokenId + 1, totalSupply.toNumber() - 1)}`);
  };
  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchNameHistory = async () => {
    try {
      const history = await api.get_name_history(tokenId);
      setNameHistory(history);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransferHistory = async () => {
    try {
      const history = await api.get_ct_ownership_transfers(tokenId);
      setTransferHistory(history);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCSTInfo = async () => {
    try {
      const res = await api.get_cst_info(tokenId);
      setNft(res);
      setImage(`${BASE_URL}/0x${res.Seed}.png`);
      setVideo(`${BASE_URL}/0x${res.Seed}.mp4`);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dashboardData = await api.get_dashboard_info();
        setDashboard(dashboardData);
        if (dashboardData.MainStats.NumCSTokenMints > tokenId) {
          await Promise.all([
            fetchCSTInfo(),
            fetchNameHistory(),
            fetchTransferHistory(),
          ]);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchData();
  }, [tokenId]);

  if (loading) {
    return (
      <Container>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <SectionWrapper>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
            <StyledCard>
              <CardActionArea onClick={() => setImageOpen(true)}>
                <NFTImage src={image} />
                <NFTInfoWrapper>
                  <Typography variant="body1" sx={{ color: "#FFFFFF" }}>
                    {formatId(tokenId)}
                  </Typography>
                </NFTInfoWrapper>
                {nameHistory.length > 0 && (
                  <NFTInfoWrapper sx={{ width: "calc(100% - 40px)" }}>
                    <Typography
                      variant="subtitle1"
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
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ArrowBack />}
                        onClick={handlePrev}
                        disabled={tokenId === 0}
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
                        disabled={
                          tokenId === dashboard.MainStats.NumCSTokenMints - 1
                        }
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
                  <Link
                    color="inherit"
                    fontSize="inherit"
                    href={`https://arbiscan.io/tx/${nft.TxHash}`}
                    target="__blank"
                  >
                    {convertTimestampToDateTime(nft.TimeStamp)}
                  </Link>
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
                {(() => {
                  switch (nft.RecordType) {
                    case 1:
                      return "Raffle Winner";
                    case 2:
                      return "Staking Winner";
                    case 3:
                      return (
                        <>
                          Round Winner (
                          <Link
                            href={`/prize/${nft.RoundNum}`}
                            target="_blank"
                            color="inherit"
                          >
                            Round #{nft.RoundNum}
                          </Link>
                          )
                        </>
                      );
                    case 4:
                      return "Endurance Champion NFT Winner";
                    case 5:
                      return "Stellar Spender NFT Winner";
                    default:
                      return "";
                  }
                })()}
              </Typography>
            </Box>
            {!nft.Staked && !nft.WasUnstaked ? (
              <Typography sx={{ color: "#0f0" }}>
                The token is eligible for staking.
              </Typography>
            ) : (
              <Typography sx={{ color: "#f00" }}>
                The token has already been staked and cannot be staked again.
              </Typography>
            )}
            <Box mt={6}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/prize/${nft.RoundNum}`)}
              >
                View Round Details
              </Button>
            </Box>
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
                    onClick={handleClickTransfer}
                    endIcon={<ArrowForward />}
                    sx={{ ml: 1 }}
                    disabled={!address || address === account}
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
                      inputProps={{ maxLength: 32 }}
                      onChange={handleChange}
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
                    {nameHistory.length > 0 && nameHistory[0].TokenName && (
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
                  <Typography variant="body2" mt={1} fontStyle="italic">
                    There are {dashboard?.MainStats.TotalNamedTokens} tokens
                    with a name, click <Link href="/named-nfts">here</Link> for
                    a full list.
                  </Typography>
                </Box>
              </>
            )}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md">
        <DialogTitle>
          Are you sure you want to send the token to the destination address?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            The destination account doesn&#39;t exist. Please check the provided
            address.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTransfer} autoFocus>
            Yes
          </Button>
          <Button onClick={handleCloseDialog}>No</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NFTTrait;

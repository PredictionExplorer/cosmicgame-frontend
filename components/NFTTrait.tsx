import React, { useEffect, useState, ChangeEvent, MouseEvent } from "react";
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
import NFTImage from "./NFTImage";
import NameHistoryTable from "./NameHistoryTable";
import { TransferHistoryTable } from "./TransferHistoryTable";

import { useActiveWeb3React } from "../hooks/web3";
import useCosmicSignatureContract from "../hooks/useCosmicSignatureContract";
import { useNotification } from "../contexts/NotificationContext";

import api from "../services/api";
import {
  convertTimestampToDateTime,
  formatId,
  getAssetsUrl,
  getOriginUrl,
} from "../utils";

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

/**
 * Props for the NFTTrait component.
 */
interface NFTTraitProps {
  tokenId: number;
}

/**
 * Displays an NFT's details and functionalities such as viewing the image/video,
 * transferring ownership, renaming, and viewing historical information.
 */
const NFTTrait: React.FC<NFTTraitProps> = ({ tokenId }) => {
  // Local state for media display and modals
  const [image, setImage] = useState("/images/qmark.png");
  const [video, setVideo] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openVideo, setOpenVideo] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [videoPath, setVideoPath] = useState<string | null>(null);

  // Local state for transfer and renaming
  const [address, setAddress] = useState("");
  const [tokenName, setTokenName] = useState("");

  // Local state for advanced data
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [nft, setNft] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [nameHistory, setNameHistory] = useState<any[]>([]);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);

  // Hooks for blockchain, notifications, and routing
  const router = useRouter();
  const nftContract = useCosmicSignatureContract();
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();

  /**
   * Checks if the destination address has any transactions.
   * If not, opens a dialog to confirm transfer to a non-existing address.
   */
  const handleClickTransfer = async () => {
    const { ethereum } = window as any;
    try {
      const txCount = await ethereum.request({
        method: "eth_getTransactionCount",
        params: [address, "latest"],
      });

      // If the address is brand new (no transactions), prompt a warning dialog
      if (Number(txCount) === 0) {
        setOpenDialog(true);
      } else {
        await handleTransfer();
      }
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Closes the transfer confirmation dialog.
   */
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  /**
   * Confirms if the video is accessible. If it is, open it in a modal video player;
   * otherwise, show a notification that the video is still being generated.
   *
   * @param videoUrl The URL of the video to be played.
   */
  const handlePlay = async (videoUrl: string) => {
    try {
      const res = await fetch(videoUrl, { method: "HEAD" });
      if (res.ok) {
        setVideoPath(videoUrl);
        setOpenVideo(true);
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

  /**
   * Transfers the NFT to the address stored in the "address" state.
   */
  const handleTransfer = async () => {
    handleCloseDialog();
    try {
      const tx = await nftContract.transferFrom(account, address, tokenId);
      await tx.wait();

      // Re-fetch data after a successful transfer
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

  /**
   * Sets or updates the name of the token via the smart contract.
   */
  const handleSetTokenName = async () => {
    try {
      const tx = await nftContract.setNftName(tokenId, tokenName);
      await tx.wait();

      // Re-fetch data after setting the name
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

  /**
   * Clears the name of the token via the smart contract.
   */
  const handleClearName = async () => {
    try {
      const tx = await nftContract.setNftName(tokenId, "");
      await tx.wait();

      // Re-fetch data after clearing the name
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

  /**
   * Restricts the length of the token name to 32 characters
   * (multi-byte characters count more heavily).
   */
  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    const inputName = e.target.value;
    let len = 0;
    let i;
    for (i = 0; i < inputName.length; i++) {
      if (inputName.charCodeAt(i) > 255) {
        // Multi-byte character
        len += 3;
      } else {
        len++;
      }
      if (len > 32) {
        i--;
        break;
      }
    }
    setTokenName(inputName.slice(0, i));
  };

  /**
   * Navigates to the previous NFT if it exists.
   */
  const handlePrev = () => router.push(`/detail/${Math.max(tokenId - 1, 0)}`);

  /**
   * Navigates to the next NFT if it exists, based on the total supply.
   */
  const handleNext = async () => {
    const totalSupply = await nftContract.totalSupply();
    router.push(`/detail/${Math.min(tokenId + 1, totalSupply.toNumber() - 1)}`);
  };

  /**
   * Opens the copy link menu.
   */
  const handleMenuOpen = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  /**
   * Closes the copy link menu.
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Fetches the name history for the current token from the backend.
   */
  const fetchNameHistory = async () => {
    try {
      const history = await api.get_name_history(tokenId);
      setNameHistory(history);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Fetches the ownership transfer history for the current token.
   */
  const fetchTransferHistory = async () => {
    try {
      const history = await api.get_ct_ownership_transfers(tokenId);
      setTransferHistory(history);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Fetches the main NFT information (like seed, image, video) from the backend.
   */
  const fetchCSTInfo = async () => {
    try {
      const res = await api.get_cst_info(tokenId);
      setNft(res);
      setImage(getAssetsUrl(`cosmicsignature/0x${res.Seed}.png`));
      setVideo(getAssetsUrl(`cosmicsignature/0x${res.Seed}.mp4`));
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Fetches dashboard info and, if the tokenId is valid, fetches
   * the NFT info, name history, and ownership transfer history.
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dashboardData = await api.get_dashboard_info();
        setDashboard(dashboardData);

        // Only fetch data if the token exists (tokenId < NumCSTokenMints)
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

  // Show a simple loading text while data is being fetched
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
          {/* Left column: NFT image and navigations */}
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
                    <CopyToClipboard text={getOriginUrl(video)}>
                      <PrimaryMenuItem onClick={handleMenuClose}>
                        <Typography>Video</Typography>
                      </PrimaryMenuItem>
                    </CopyToClipboard>
                    <CopyToClipboard text={getOriginUrl(image)}>
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

          {/* Right column: NFT metadata and actions */}
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
                  // Mapping the record type to specific labels
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

            {/* Display staking eligibility */}
            {!nft.Staked && !nft.WasUnstaked ? (
              <Typography sx={{ color: "#0f0" }}>
                The token is eligible for staking.
              </Typography>
            ) : (
              <Typography sx={{ color: "#f00" }}>
                The token has already been staked and cannot be staked again.
              </Typography>
            )}

            {/* Button to view round details */}
            <Box mt={6}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/prize/${nft.RoundNum}`)}
              >
                View Round Details
              </Button>
            </Box>

            {/* Transfer and rename controls (only visible to the owner) */}
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
                      onChange={handleChangeName}
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

        {/* Name history table */}
        {nameHistory.length !== 0 && (
          <Box mt="40px">
            <Typography variant="h6" mb={2}>
              History of Name Changes
            </Typography>
            <NameHistoryTable list={nameHistory} />
          </Box>
        )}

        {/* Transfer history table */}
        {transferHistory.length !== 0 && !transferHistory[0].TransferType && (
          <Box mt="40px">
            <Typography variant="h6" mb={2}>
              History of Ownership Changes
            </Typography>
            <TransferHistoryTable list={transferHistory} />
          </Box>
        )}

        {/* Video section */}
        <Box mt="80px">
          <NFTVideo image_thumb={image} onClick={() => handlePlay(video)} />
        </Box>

        {/* Lightbox for full-size image */}
        {imageOpen && (
          <Lightbox image={image} onClose={() => setImageOpen(false)} />
        )}

        {/* Modal video player */}
        <ModalVideo
          channel="custom"
          url={videoPath ?? ""}
          isOpen={openVideo}
          onClose={() => setOpenVideo(false)}
        />
      </SectionWrapper>

      {/* Dialog for transfer confirmation to new address */}
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

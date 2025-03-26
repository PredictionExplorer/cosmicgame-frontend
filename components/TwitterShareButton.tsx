import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

/**
 * TwitterShareButton Component
 * Allows users to input their Twitter handle and share a pre-constructed tweet.
 */
export default function TwitterShareButton() {
  const [handle, setHandle] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    const formattedHandle = handle.startsWith("@") ? handle.slice(1) : handle;

    const tweetText = `I'm joining the @CosmicSignature test round on @arbitrum Sepolia for free! Over $60,000 in prizes up for grabs! https://x.com/CosmicSignature/status/1821607885819785412\nUse my referral link and you'll get an extra $100 if you win: https://cosmicsignature.com/?referred_by=${formattedHandle}`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`;

    window.open(twitterUrl, "_blank");
    handleClose();
  };

  return (
    <>
      <Button variant="outlined" onClick={handleOpen}>
        Share on Twitter
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>What is your Twitter handle?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your Twitter handle below. Ensure your account has a blue
            checkmark.
          </DialogContentText>
          <DialogContentText>
            Follow additional instructions on our Twitter page to confirm
            eligibility.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="twitter_handle"
            name="twitter_handle"
            label="Twitter Handle"
            placeholder="@userhandle"
            fullWidth
            variant="standard"
            value={handle}
            onChange={(e) => setHandle(e.target.value.trim())}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirm}
            disabled={!handle.trim()}
            variant="contained"
          >
            Ok
          </Button>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

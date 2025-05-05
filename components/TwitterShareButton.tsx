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
 * Opens a dialog to collect a user's Twitter handle and then creates a pre-filled tweet with referral link.
 */
const TwitterShareButton: React.FC = () => {
  const [handle, setHandle] = useState<string>(""); // User input for Twitter handle
  const [open, setOpen] = useState<boolean>(false); // Controls the dialog open state

  // Opens the dialog
  const handleOpen = () => setOpen(true);

  // Closes the dialog
  const handleClose = () => setOpen(false);

  // Triggered when user confirms the handle input
  const handleConfirm = () => {
    // Remove '@' if user included it in the handle
    const formattedHandle = handle.startsWith("@") ? handle.slice(1) : handle;

    // Construct the tweet content
    const tweetText = `I'm joining the @CosmicSignature test round on @arbitrum Sepolia for free! Over $60,000 in prizes up for grabs! https://x.com/CosmicSignature/status/1821607885819785412\nUse my referral link and you'll get an extra $100 if you win: https://cosmicsignature.com/?referred_by=${formattedHandle}`;

    // Encode tweet for Twitter intent URL
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`;

    // Open Twitter sharing window
    window.open(twitterUrl, "_blank");

    // Close the dialog
    handleClose();
  };

  return (
    <>
      {/* Trigger Button */}
      <Button variant="outlined" onClick={handleOpen}>
        Share on Twitter
      </Button>

      {/* Dialog for Twitter handle input */}
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
};

export default TwitterShareButton;
